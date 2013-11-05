//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

///<reference path='references.ts' />

module TypeScript {
    export interface IASTSpan {
        _start: number;
        _end: number;
        _trailingTriviaWidth: number;

        start(): number;
        end(): number;
        trailingTriviaWidth(): number;
    }

    export class ASTSpan implements IASTSpan {
        constructor(public _start: number, public _end: number, public _trailingTriviaWidth: number) {
        }

        public start(): number {
            return this._start;
        }

        public end(): number {
            return this._end;
        }

        public trailingTriviaWidth(): number {
            return this._trailingTriviaWidth;
        }
    }

    var astID = 0;

    export function structuralEqualsNotIncludingPosition(ast1: AST, ast2: AST): boolean {
        return structuralEquals(ast1, ast2, false);
    }

    export function structuralEqualsIncludingPosition(ast1: AST, ast2: AST): boolean {
        return structuralEquals(ast1, ast2, true);
    }

    function commentStructuralEqualsNotIncludingPosition(ast1: Comment, ast2: Comment): boolean {
        return commentStructuralEquals(ast1, ast2, false);
    }

    function commentStructuralEqualsIncludingPosition(ast1: Comment, ast2: Comment): boolean {
        return commentStructuralEquals(ast1, ast2, true);
    }

    function structuralEquals(ast1: AST, ast2: AST, includingPosition: boolean): boolean {
        if (ast1 === ast2) {
            return true;
        }

        return ast1 !== null && ast2 !== null &&
               ast1.nodeType() === ast2.nodeType() &&
               ast1.structuralEquals(ast2, includingPosition);
    }

    function commentStructuralEquals(ast1: Comment, ast2: Comment, includingPosition: boolean): boolean {
        if (ast1 === ast2) {
            return true;
        }

        return ast1 !== null && ast2 !== null &&
            ast1.structuralEquals(ast2, includingPosition);
    }

    function astArrayStructuralEquals(array1: AST[], array2: AST[], includingPosition: boolean): boolean {
        return ArrayUtilities.sequenceEquals(array1, array2,
            includingPosition ? structuralEqualsIncludingPosition : structuralEqualsNotIncludingPosition);
    }

    function commentArrayStructuralEquals(array1: Comment[], array2: Comment[], includingPosition: boolean): boolean {
        return ArrayUtilities.sequenceEquals(array1, array2,
            includingPosition ? commentStructuralEqualsIncludingPosition : commentStructuralEqualsNotIncludingPosition);
    }

    export class AST implements IASTSpan {
        public parent: AST = null;
        public _start: number = -1;
        public _end: number = -1;
        public _trailingTriviaWidth: number = 0;

        private _astID: number = astID++;

        private _preComments: Comment[] = null;
        private _postComments: Comment[] = null;

        constructor() {
        }

        public astID(): number {
            return this._astID;
        }

        public start(): number {
            return this._start;
        }

        public end(): number {
            return this._end;
        }

        public trailingTriviaWidth(): number {
            return this._trailingTriviaWidth;
        }

        public fileName(): string {
            return this.parent.fileName();
        }

        public nodeType(): SyntaxKind {
            throw Errors.abstract();
        }

        public preComments(): Comment[] {
            return this._preComments;
        }

        public postComments(): Comment[] {
            return this._postComments;
        }

        public setPreComments(comments: Comment[]) {
            if (comments && comments.length) {
                this._preComments = comments;
            }
            else if (this._preComments) {
                this._preComments = null;
            }
        }

        public setPostComments(comments: Comment[]) {
            if (comments && comments.length) {
                this._postComments = comments;
            }
            else if (this._postComments) {
                this._postComments = null;
            }
        }

        public width(): number {
            return this.end() - this.start();
        }

        public structuralEquals(ast: AST, includingPosition: boolean): boolean {
            if (includingPosition) {
                if (this.start() !== ast.start() || this.end() !== ast.end()) {
                    return false;
                }
            }

            return commentArrayStructuralEquals(this.preComments(), ast.preComments(), includingPosition) &&
                   commentArrayStructuralEquals(this.postComments(), ast.postComments(), includingPosition);
        }
    }

    export interface IASTToken extends AST {
        text(): string;
        valueText(): string;
    }

    export class ASTList extends AST {
        constructor(private _fileName: string, private members: AST[]) {
            super();

            for (var i = 0, n = members.length; i < n; i++) {
                members[i].parent = this;
            }
        }

        public childCount(): number {
            return this.members.length;
        }

        public childAt(index: number): AST {
            return this.members[index];
        }

        public fileName(): string {
            return this._fileName;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.List;
        }

        public firstOrDefault(func: (v: AST, index: number) => boolean): AST {
            return ArrayUtilities.firstOrDefault(this.members, func);
        }

        public lastOrDefault(func: (v: AST, index: number) => boolean): AST {
            return ArrayUtilities.lastOrDefault(this.members, func);
        }

        public any(func: (v: AST) => boolean): boolean {
            return ArrayUtilities.any(this.members, func);
        }

        public structuralEquals(ast: ASTList, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   astArrayStructuralEquals(this.members, ast.members, includingPosition);
        }
    }

    export class ASTSeparatedList extends AST {
        constructor(private _fileName: string, private members: AST[], private _separatorCount: number) {
            super();

            for (var i = 0, n = members.length; i < n; i++) {
                members[i].parent = this;
            }
        }

        public nonSeparatorCount(): number {
            return this.members.length;
        }

        public separatorCount(): number {
            return this._separatorCount;
        }

        public nonSeparatorAt(index: number): AST {
            return this.members[index];
        }

        public nonSeparatorIndexOf(ast: AST): number {
            for (var i = 0, n = this.nonSeparatorCount(); i < n; i++) {
                if (this.nonSeparatorAt(i) === ast) {
                    return i;
                }
            }

            return -1;
        }

        public fileName(): string {
            return this._fileName;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SeparatedList;
        }

        public structuralEquals(ast: ASTSeparatedList, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                astArrayStructuralEquals(this.members, ast.members, includingPosition);
        }
    }

    export class Script extends AST {
        constructor(public moduleElements: ASTList,
                    private _fileName: string,
                    public amdDependencies: string[]) {
            super();
            moduleElements && (moduleElements.parent = this);
        }

        public fileName(): string {
            return this._fileName;
        }

        public isDeclareFile(): boolean {
            return isDTSFile(this.fileName());
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SourceUnit;
        }

        public structuralEquals(ast: Script, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.moduleElements, ast.moduleElements, includingPosition);
        }
    }

    export class Identifier extends AST implements IASTToken {
        private _valueText: string = null;

        // 'actualText' is the text that the user has entered for the identifier. the text might 
        // include any Unicode escape sequences (e.g.: \u0041 for 'A'). 'text', however, contains 
        // the resolved value of any escape sequences in the actual text; so in the previous 
        // example, actualText = '\u0041', text = 'A'.
        // Also, in the case where actualText is "__proto__", we substitute "#__proto__" as the _text
        // so that we can safely use it as a key in a javascript object.
        //
        // For purposes of finding a symbol, use text, as this will allow you to match all 
        // variations of the variable text. For full-fidelity translation of the user input, such
        // as emitting, use the actualText field.
        constructor(private _text: string) {
            super();
        }

        public text(): string {
            return this._text;
        }
        public valueText(): string {
            if (!this._valueText) {
                // In the case where actualText is "__proto__", we substitute "#__proto__" as the _text
                // so that we can safely use it as a key in a javascript object.
                var text = this._text;
                if (text === "__proto__") {
                    this._valueText = "#__proto__";
                }
                else {
                    this._valueText = Syntax.massageEscapes(text);
                }
            }

            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.IdentifierName;
        }

        public structuralEquals(ast: Identifier, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   this._text === ast._text;
        }
    }

    export class LiteralExpression extends AST {
        constructor(private _nodeType: SyntaxKind, private _text: string, private _valueText: string) {
            super();
        }

        public text(): string {
            return this._text;
        }

        public valueText(): string {
            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }

        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class ThisExpression extends AST implements IASTToken {
        constructor(private _text: string, private _valueText: string) {
            super();
        }

        public text(): string {
            return this._text;
        }

        public valueText(): string {
            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ThisKeyword;
        }

        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class SuperExpression extends AST implements IASTToken {
        constructor(private _text: string, private _valueText: string) {
            super();
        }

        public text(): string {
            return this._text;
        }

        public valueText(): string {
            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SuperKeyword;
        }

        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class NumericLiteral extends AST implements IASTToken {
        constructor(private _value: number,
                    private _text: string,
                    private _valueText: string) {
            super();
        }

        public text(): string { return this._text; }
        public valueText(): string { return this._valueText; }
        public value(): any { return this._value; }

        public nodeType(): SyntaxKind {
            return SyntaxKind.NumericLiteral;
        }

        public structuralEquals(ast: NumericLiteral, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   (this._value === ast._value || (isNaN(this._value) && isNaN(ast._value))) &&
                   this._text === ast._text;
        }
    }

    export class RegularExpressionLiteral extends AST implements IASTToken {
        constructor(private _text: string, private _valueText: string) {
            super();
        }

        public text(): string {
            return this._text;
        }

        public valueText(): string {
            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.RegularExpressionLiteral;
        }
    }

    export class StringLiteral extends AST implements IASTToken {
        constructor(private _text: string, private _valueText: string) {
            super();
            this._valueText = _valueText === "__proto__" ? "#__proto__" : _valueText;

        }

        public text(): string { return this._text; }
        public valueText(): string { return this._valueText; }

        public nodeType(): SyntaxKind {
            return SyntaxKind.StringLiteral;
        }

        public structuralEquals(ast: StringLiteral, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   this._text === ast._text;
        }
    }

    export class TypeAnnotation extends AST {
        constructor(public type: AST) {
            super();
            type && (type.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeAnnotation;
        }
    }

    export class BuiltInType extends AST implements IASTToken {
        constructor(private _nodeType: SyntaxKind, private _text: string, private _valueText: string) {
            super();
        }

        public text(): string {
            return this._text;
        }

        public valueText(): string {
            return this._valueText;
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }
    }

    export class ExternalModuleReference extends AST {
        constructor(public stringLiteral: StringLiteral) {
            super();
            stringLiteral && (stringLiteral.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ExternalModuleReference;
        }
    }

    export class ModuleNameModuleReference extends AST {
        constructor(public moduleName: AST) {
            super();
            moduleName && (moduleName.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ModuleNameModuleReference;
        }
    }

    export class ImportDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public identifier: Identifier, public moduleReference: AST) {
            super();
            identifier && (identifier.parent = this);
            moduleReference && (moduleReference.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ImportDeclaration;
        }

        public structuralEquals(ast: ImportDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.moduleReference, ast.moduleReference, includingPosition);
        }
    }

    export class ExportAssignment extends AST {
        constructor(public identifier: Identifier) {
            super();
            identifier && (identifier.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ExportAssignment;
        }

        public structuralEquals(ast: ExportAssignment, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition);
        }
    }

    export class TypeParameterList extends AST {
        constructor(public typeParameters: ASTSeparatedList) {
            super();
            typeParameters && (typeParameters.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeParameterList;
        }
    }

    export class ClassDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public identifier: Identifier, public typeParameterList: TypeParameterList, public heritageClauses: ASTList, public classElements: ASTList, public closeBraceToken: ASTSpan) {
            super();
            identifier && (identifier.parent = this);
            typeParameterList && (typeParameterList.parent = this);
            heritageClauses && (heritageClauses.parent = this);
            classElements && (classElements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ClassDeclaration;
        }

        public structuralEquals(ast: ClassDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.classElements, ast.classElements, includingPosition) &&
                structuralEquals(this.typeParameterList, ast.typeParameterList, includingPosition) &&
                structuralEquals(this.heritageClauses, ast.heritageClauses, includingPosition);
        }
    }

    export class InterfaceDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public identifier: Identifier, public typeParameterList: TypeParameterList, public heritageClauses: ASTList, public body: ObjectType) {
            super();
            identifier && (identifier.parent = this);
            typeParameterList && (typeParameterList.parent = this);
            body && (body.parent = this);
            heritageClauses && (heritageClauses.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.InterfaceDeclaration;
        }

        public structuralEquals(ast: InterfaceDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.body, ast.body, includingPosition) &&
                structuralEquals(this.typeParameterList, ast.typeParameterList, includingPosition) &&
                structuralEquals(this.heritageClauses, ast.heritageClauses, includingPosition);
        }
    }

    export class HeritageClause extends AST {
        constructor(private _nodeType: SyntaxKind, public typeNames: ASTSeparatedList) {
            super();
            typeNames && (typeNames.parent = this);
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }

        public structuralEquals(ast: HeritageClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.typeNames, ast.typeNames, includingPosition);
        }
    }

    export class ModuleDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public name: AST, public stringLiteral: StringLiteral, public moduleElements: ASTList, public endingToken: ASTSpan) {
            super();
            name && (name.parent = this);
            stringLiteral && (stringLiteral.parent = this);
            moduleElements && (moduleElements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ModuleDeclaration;
        }

        public structuralEquals(ast: ModuleDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.name, ast.name, includingPosition) &&
                structuralEquals(this.moduleElements, ast.moduleElements, includingPosition);
        }
    }

    export class FunctionDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public identifier: Identifier, public callSignature: CallSignature, public block: Block) {
            super();
            identifier && (identifier.parent = this);
            callSignature && (callSignature.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.FunctionDeclaration;
        }

        public structuralEquals(ast: FunctionDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.block, ast.block, includingPosition) &&
                structuralEquals(this.callSignature, ast.callSignature, includingPosition);
        }
    }

    export class VariableStatement extends AST {
        constructor(public modifiers: PullElementFlags[], public declaration: VariableDeclaration) {
            super();
            declaration && (declaration.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.VariableStatement;
        }

        public structuralEquals(ast: VariableStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.declaration, ast.declaration, includingPosition);
        }
    }

    export class VariableDeclaration extends AST {
        constructor(public declarators: ASTSeparatedList) {
            super();
            declarators && (declarators.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.VariableDeclaration;
        }

        public structuralEquals(ast: VariableDeclaration, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.declarators, ast.declarators, includingPosition);
        }
    }

    export class VariableDeclarator extends AST {
        constructor(public propertyName: IASTToken, public typeAnnotation: TypeAnnotation, public equalsValueClause: EqualsValueClause) {
            super();
            propertyName && (propertyName.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.VariableDeclarator;
        }
    }

    export class EqualsValueClause extends AST {
        constructor(public value: AST) {
            super();
            value && (value.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.EqualsValueClause;
        }
    }

    export class PrefixUnaryExpression extends AST {
        constructor(private _nodeType: SyntaxKind, public operand: AST) {
            super();
            operand && (operand.parent = this);
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }

        public structuralEquals(ast: PrefixUnaryExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.operand, ast.operand, includingPosition);
        }
    }

    export class ArrayLiteralExpression extends AST {
        constructor(public expressions: ASTSeparatedList) {
            super();
            expressions && (expressions.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ArrayLiteralExpression;
        }

        public structuralEquals(ast: ArrayLiteralExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expressions, ast.expressions, includingPosition);
        }
    }

    export class OmittedExpression extends AST {
        public nodeType(): SyntaxKind {
            return SyntaxKind.OmittedExpression;
        }

        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class ParenthesizedExpression extends AST {
        constructor(public openParenTrailingComments: Comment[], public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ParenthesizedExpression;
        }

        public structuralEquals(ast: ParenthesizedExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export interface ICallExpression extends IASTSpan {
        expression: AST;
        argumentList: ArgumentList;
    }

    export class SimpleArrowFunctionExpression extends AST {
        constructor(public identifier: Identifier, public block: Block, public expression: AST) {
            super();
            identifier && (identifier.parent = this);
            block && (block.parent = this);
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SimpleArrowFunctionExpression;
        }
    }

    export class ParenthesizedArrowFunctionExpression extends AST {
        constructor(public callSignature: CallSignature, public block: Block, public expression: AST) {
            super();
            callSignature && (callSignature.parent = this);
            block && (block.parent = this);
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ParenthesizedArrowFunctionExpression;
        }
    }

    export class QualifiedName extends AST {
        constructor(public left: AST, public right: Identifier) {
            super();
            left && (left.parent = this);
            right && (right.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.QualifiedName;
        }

        public structuralEquals(ast: QualifiedName, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.left, ast.left, includingPosition) &&
                structuralEquals(this.right, ast.right, includingPosition);
        }
    }

    export class ParameterList extends AST {
        constructor(public openParenTrailingComments: Comment[], public parameters: ASTSeparatedList) {
            super();
            parameters && (parameters.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ParameterList;
        }
    }

    export class ConstructorType extends AST {
        constructor(public typeParameterList: TypeParameterList, public parameterList: ParameterList, public type: AST) {
            super();
            typeParameterList && (typeParameterList.parent = this);
            parameterList && (parameterList.parent = this);
            type && (type.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ConstructorType;
        }
    }

    export class FunctionType extends AST {
        constructor(public typeParameterList: TypeParameterList, public parameterList: ParameterList, public type: AST) {
            super();
            typeParameterList && (typeParameterList.parent = this);
            parameterList && (parameterList.parent = this);
            type && (type.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.FunctionType;
        }
    }

    export class ObjectType extends AST {
        constructor(public typeMembers: ASTSeparatedList) {
            super();
            typeMembers && (typeMembers.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ObjectType;
        }

        public structuralEquals(ast: ObjectType, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.typeMembers, ast.typeMembers, includingPosition);
        }
    }

    export class ArrayType extends AST {
        constructor(public type: AST) {
            super();
            type && (type.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ArrayType;
        }

        public structuralEquals(ast: ArrayType, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.type, ast.type, includingPosition);
        }
    }

    export class TypeArgumentList extends AST {
        constructor(public typeArguments: ASTSeparatedList) {
            super();
            typeArguments && (typeArguments.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeArgumentList;
        }
    }

    export class GenericType extends AST {
        constructor(public name: AST, public typeArgumentList: TypeArgumentList) {
            super();
            name && (name.parent = this);
            typeArgumentList && (typeArgumentList.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.GenericType;
        }

        public structuralEquals(ast: GenericType, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.name, ast.name, includingPosition) &&
                structuralEquals(this.typeArgumentList, ast.typeArgumentList, includingPosition);
        }
    }

    export class TypeQuery extends AST {
        constructor(public name: AST) {
            super();
            name && (name.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeQuery;
        }

        public structuralEquals(ast: TypeQuery, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.name, ast.name, includingPosition);
        }
    }

    export class Block extends AST {
        constructor(public statements: ASTList, public closeBraceLeadingComments: Comment[], public closeBraceToken: IASTSpan) {
            super();
            statements && (statements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.Block;
        }

        public structuralEquals(ast: Block, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.statements, ast.statements, includingPosition);
        }
    }

    export class Parameter extends AST {
        constructor(public dotDotDotToken: ASTSpan, public modifiers: PullElementFlags[], public identifier: Identifier, public questionToken: ASTSpan, public typeAnnotation: TypeAnnotation, public equalsValueClause: EqualsValueClause) {
            super();
            identifier && (identifier.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.Parameter;
        }
    }

    export class MemberAccessExpression extends AST {
        constructor(public expression: AST, public name: Identifier) {
            super();
            expression && (expression.parent = this);
            name && (name.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.MemberAccessExpression;
        }

        public structuralEquals(ast: MemberAccessExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.name, ast.name, includingPosition);
        }
    }

    export class PostfixUnaryExpression extends AST {
        constructor(private _nodeType: SyntaxKind, public operand: AST) {
            super();
            operand && (operand.parent = this);
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }

        public structuralEquals(ast: PostfixUnaryExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.operand, ast.operand, includingPosition);
        }
    }

    export class ElementAccessExpression extends AST {
        constructor(public expression: AST, public argumentExpression: AST) {
            super();
            expression && (expression.parent = this);
            argumentExpression && (argumentExpression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ElementAccessExpression;
        }

        public structuralEquals(ast: ElementAccessExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.argumentExpression, ast.argumentExpression, includingPosition);
        }
    }

    export class InvocationExpression extends AST implements ICallExpression {
        constructor(public expression: AST, public argumentList: ArgumentList) {
            super();
            expression && (expression.parent = this);
            argumentList && (argumentList.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.InvocationExpression;
        }

        public structuralEquals(ast: InvocationExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.argumentList, ast.argumentList, includingPosition);
        }
    }

    export class ArgumentList extends AST {
        constructor(public typeArgumentList: TypeArgumentList, public arguments: ASTSeparatedList, public closeParenToken: ASTSpan) {
            super();
            typeArgumentList && (typeArgumentList.parent = this);
            arguments && (arguments.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ArgumentList;
        }
    }

    export class BinaryExpression extends AST {
        constructor(private _nodeType: SyntaxKind, public left: AST, public right: AST) {
            super();
            left && (left.parent = this);
            right && (right.parent = this);
        }

        public nodeType(): SyntaxKind {
            return this._nodeType;
        }

        public structuralEquals(ast: BinaryExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.left, ast.left, includingPosition) &&
                structuralEquals(this.right, ast.right, includingPosition);
        }
    }

    export class ConditionalExpression extends AST {
        constructor(public condition: AST, public whenTrue: AST, public whenFalse: AST) {
            super();
            condition && (condition.parent = this);
            whenTrue && (whenTrue.parent = this);
            whenFalse && (whenFalse.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ConditionalExpression;
        }

        public structuralEquals(ast: ConditionalExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition) &&
                structuralEquals(this.whenTrue, ast.whenTrue, includingPosition) &&
                structuralEquals(this.whenFalse, ast.whenFalse, includingPosition);
        }
    }

    export class ConstructSignature extends AST {
        constructor(public callSignature: CallSignature) {
            super();
            callSignature && (callSignature.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ConstructSignature;
        }
    }

    export class MethodSignature extends AST {
        constructor(public propertyName: IASTToken, public questionToken: ASTSpan, public callSignature: CallSignature) {
            super();
            propertyName && (propertyName.parent = this);
            callSignature && (callSignature.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.MethodSignature;
        }
    }

    export class IndexSignature extends AST {
        constructor(public parameter: Parameter, public typeAnnotation: TypeAnnotation) {
            super();
            parameter && (parameter.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.IndexSignature;
        }
    }

    export class PropertySignature extends AST {
        constructor(public propertyName: IASTToken, public questionToken: ASTSpan, public typeAnnotation: TypeAnnotation) {
            super();
            propertyName && (propertyName.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.PropertySignature;
        }
    }

    export class CallSignature extends AST {
        constructor(public typeParameterList: TypeParameterList, public parameterList: ParameterList, public typeAnnotation: TypeAnnotation) {
            super();
            typeParameterList && (typeParameterList.parent = this);
            parameterList && (parameterList.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.CallSignature;
        }
    }

    export class TypeParameter extends AST {
        constructor(public identifier: Identifier, public constraint: Constraint) {
            super();
            identifier && (identifier.parent = this);
            constraint && (constraint.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeParameter;
        }

        public structuralEquals(ast: TypeParameter, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.constraint, ast.constraint, includingPosition);
        }
    }

    export class Constraint extends AST {
        constructor(public type: AST) {
            super();
            type && (type.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.Constraint;
        }
    }

    export class ElseClause extends AST {
        constructor(public statement: AST) {
            super();
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ElseClause;
        }

        public structuralEquals(ast: ElseClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class IfStatement extends AST {
        constructor(public condition: AST, public statement: AST, public elseClause: ElseClause) {
            super();
            condition && (condition.parent = this);
            statement && (statement.parent = this);
            elseClause && (elseClause.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.IfStatement;
        }

        public structuralEquals(ast: IfStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition) &&
                structuralEquals(this.elseClause, ast.elseClause, includingPosition);
        }
    }

    export class ExpressionStatement extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ExpressionStatement;
        }

        public structuralEquals(ast: ExpressionStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class ConstructorDeclaration extends AST {
        constructor(public parameterList: ParameterList, public block: Block) {
            super();
            parameterList && (parameterList.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ConstructorDeclaration;
        }
    }

    export class MemberFunctionDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public propertyName: IASTToken, public callSignature: CallSignature, public block: Block) {
            super();
            propertyName && (propertyName.parent = this);
            callSignature && (callSignature.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.MemberFunctionDeclaration;
        }
    }

    export class GetAccessor extends AST {
        constructor(public modifiers: PullElementFlags[], public propertyName: IASTToken, public parameterList: ParameterList, public typeAnnotation: TypeAnnotation, public block: Block) {
            super();
            propertyName && (propertyName.parent = this);
            parameterList && (parameterList.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.GetAccessor;
        }
    }

    export class SetAccessor extends AST {
        constructor(public modifiers: PullElementFlags[], public propertyName: IASTToken, public parameterList: ParameterList, public block: Block) {
            super();
            propertyName && (propertyName.parent = this);
            parameterList && (parameterList.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SetAccessor;
        }
    }

    export class MemberVariableDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public variableDeclarator: VariableDeclarator) {
            super();
            variableDeclarator && (variableDeclarator.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.MemberVariableDeclaration;
        }
    }

    export class IndexMemberDeclaration extends AST {
        constructor(public indexSignature: IndexSignature) {
            super();
            indexSignature && (indexSignature.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.IndexMemberDeclaration;
        }
    }

    export class ThrowStatement extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ThrowStatement;
        }

        public structuralEquals(ast: ThrowStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class ReturnStatement extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ReturnStatement;
        }

        public structuralEquals(ast: ReturnStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class ObjectCreationExpression extends AST implements ICallExpression {
        constructor(public expression: AST, public argumentList: ArgumentList) {
            super();
            expression && (expression.parent = this);
            argumentList && (argumentList.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ObjectCreationExpression;
        }

        public structuralEquals(ast: ObjectCreationExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.argumentList, ast.argumentList, includingPosition);
        }
    }

    export class SwitchStatement extends AST {
        constructor(public expression: AST, public closeParenToken: ASTSpan, public switchClauses: ASTList) {
            super();
            expression && (expression.parent = this);
            switchClauses && (switchClauses.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SwitchStatement;
        }

        public structuralEquals(ast: SwitchStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.switchClauses, ast.switchClauses, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class CaseSwitchClause extends AST {
        constructor(public expression: AST, public statements: ASTList) {
            super();
            expression && (expression.parent = this);
            statements && (statements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.CaseSwitchClause;
        }

        public structuralEquals(ast: CaseSwitchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.statements, ast.statements, includingPosition);
        }
    }

    export class DefaultSwitchClause extends AST {
        constructor(public statements: ASTList) {
            super();
            statements && (statements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.DefaultSwitchClause;
        }

        public structuralEquals(ast: DefaultSwitchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.statements, ast.statements, includingPosition);
        }
    }

    export class BreakStatement extends AST {
        constructor(public identifier: Identifier) {
            super();
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.BreakStatement;
        }

        public structuralEquals(ast: BreakStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class ContinueStatement extends AST {
        constructor(public identifier: Identifier) {
            super();
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ContinueStatement;
        }

        public structuralEquals(ast: ContinueStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class ForStatement extends AST {
        constructor(public variableDeclaration: VariableDeclaration, public initializer: AST, public condition: AST, public incrementor: AST, public statement: AST) {
            super();
            variableDeclaration && (variableDeclaration.parent = this);
            initializer && (initializer.parent = this);
            condition && (condition.parent = this);
            incrementor && (incrementor.parent = this);
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ForStatement;
        }

        public structuralEquals(ast: ForStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.initializer, ast.initializer, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition) &&
                structuralEquals(this.incrementor, ast.incrementor, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class ForInStatement extends AST {
        constructor(public variableDeclaration: VariableDeclaration, public left: AST, public expression: AST, public statement: AST) {
            super();
            variableDeclaration && (variableDeclaration.parent = this);
            left && (left.parent = this);
            expression && (expression.parent = this);
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ForInStatement;
        }

        public structuralEquals(ast: ForInStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.variableDeclaration, ast.variableDeclaration, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class WhileStatement extends AST {
        constructor(public condition: AST, public statement: AST) {
            super();
            condition && (condition.parent = this);
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.WhileStatement;
        }

        public structuralEquals(ast: WhileStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class WithStatement extends AST {
        constructor(public condition: AST, public statement: AST) {
            super();
            condition && (condition.parent = this);
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.WithStatement;
        }

        public structuralEquals(ast: WithStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class EnumDeclaration extends AST {
        constructor(public modifiers: PullElementFlags[], public identifier: Identifier, public enumElements: ASTSeparatedList) {
            super();
            identifier && (identifier.parent = this);
            enumElements && (enumElements.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.EnumDeclaration;
        }
    }

    export class EnumElement extends AST {
        constructor(public propertyName: IASTToken, public equalsValueClause: EqualsValueClause) {
            super();
            propertyName && (propertyName.parent = this);
            equalsValueClause && (equalsValueClause.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.EnumElement;
        }
    }

    export class CastExpression extends AST {
        constructor(public type: AST, public expression: AST) {
            super();
            type && (type.parent = this);
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.CastExpression;
        }

        public structuralEquals(ast: CastExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.type, ast.type, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class ObjectLiteralExpression extends AST {
        constructor(public propertyAssignments: ASTSeparatedList) {
            super();
            propertyAssignments && (propertyAssignments.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.ObjectLiteralExpression;
        }

        public structuralEquals(ast: ObjectLiteralExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.propertyAssignments, ast.propertyAssignments, includingPosition);
        }
    }

    export class SimplePropertyAssignment extends AST {
        constructor(public propertyName: Identifier, public expression: AST) {
            super();
            propertyName && (propertyName.parent = this);
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.SimplePropertyAssignment;
        }
    }

    export class FunctionPropertyAssignment extends AST {
        constructor(public propertyName: Identifier, public callSignature: CallSignature, public block: Block) {
            super();
            propertyName && (propertyName.parent = this);
            callSignature && (callSignature.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.FunctionPropertyAssignment;
        }
    }

    export class FunctionExpression extends AST {
        constructor(public identifier: Identifier, public callSignature: CallSignature, public block: Block) {
            super();
            identifier && (identifier.parent = this);
            callSignature && (callSignature.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.FunctionExpression;
        }
    }

    export class EmptyStatement extends AST {
        public nodeType(): SyntaxKind {
            return SyntaxKind.EmptyStatement;
        }

        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition);
        }
    }

    export class TryStatement extends AST {
        constructor(public block: Block, public catchClause: CatchClause, public finallyClause: FinallyClause) {
            super();
            block && (block.parent = this);
            catchClause && (catchClause.parent = this);
            finallyClause && (finallyClause.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TryStatement;
        }

        public structuralEquals(ast: TryStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   structuralEquals(this.block, ast.block, includingPosition) &&
                   structuralEquals(this.catchClause, ast.catchClause, includingPosition) &&
                   structuralEquals(this.finallyClause, ast.finallyClause, includingPosition);
        }
    }

    export class CatchClause extends AST {
        constructor(public identifier: Identifier, public typeAnnotation: TypeAnnotation, public block: Block) {
            super();
            identifier && (identifier.parent = this);
            typeAnnotation && (typeAnnotation.parent = this);
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.CatchClause;
        }

        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                   structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                   structuralEquals(this.typeAnnotation, ast.typeAnnotation, includingPosition) &&
                   structuralEquals(this.block, ast.block, includingPosition);
        }
    }

    export class FinallyClause extends AST {
        constructor(public block: Block) {
            super();
            block && (block.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.FinallyClause;
        }

        public structuralEquals(ast: CatchClause, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.block, ast.block, includingPosition);
        }
    }

    export class LabeledStatement extends AST {
        constructor(public identifier: Identifier, public statement: AST) {
            super();
            identifier && (identifier.parent = this);
            statement && (statement.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.LabeledStatement;
        }

        public structuralEquals(ast: LabeledStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.identifier, ast.identifier, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition);
        }
    }

    export class DoStatement extends AST {
        constructor(public statement: AST, public whileKeyword: ASTSpan, public condition: AST) {
            super();
            statement && (statement.parent = this);
            condition && (condition.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.DoStatement;
        }

        public structuralEquals(ast: DoStatement, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.statement, ast.statement, includingPosition) &&
                structuralEquals(this.condition, ast.condition, includingPosition);
        }
    }

    export class TypeOfExpression extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.TypeOfExpression;
        }

        public structuralEquals(ast: TypeOfExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class DeleteExpression extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.DeleteExpression;
        }

        public structuralEquals(ast: DeleteExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class VoidExpression extends AST {
        constructor(public expression: AST) {
            super();
            expression && (expression.parent = this);
        }

        public nodeType(): SyntaxKind {
            return SyntaxKind.VoidExpression;
        }

        public structuralEquals(ast: VoidExpression, includingPosition: boolean): boolean {
            return super.structuralEquals(ast, includingPosition) &&
                structuralEquals(this.expression, ast.expression, includingPosition);
        }
    }

    export class DebuggerStatement extends AST {
        public nodeType(): SyntaxKind {
            return SyntaxKind.DebuggerStatement;
        }
    }

    export class Comment {
        public text: string[] = null;
        private docCommentText: string = null;
        public _trailingTriviaWidth = 0;

        constructor(private _trivia: ISyntaxTrivia,
                    public endsLine: boolean,
                    public _start: number,
                    public _end: number) {
        }

        public start(): number {
            return this._start;
        }

        public end(): number {
            return this._end;
        }

        public trailingTriviaWidth(): number {
            return this._trailingTriviaWidth;
        }

        public fullText(): string {
            return this._trivia.fullText();
        }

        public isBlockComment(): boolean {
            return this._trivia.kind() === SyntaxKind.MultiLineCommentTrivia;
        }

        public structuralEquals(ast: Comment, includingPosition: boolean): boolean {
            if (includingPosition) {
                if (this.start() !== ast.start() || this.end() !== ast.end()) {
                    return false;
                }
            }

            return this._trivia.fullText() === ast._trivia.fullText() &&
                   this.endsLine === ast.endsLine;
        }

        public isPinnedOrTripleSlash(): boolean {
            if (this.fullText().match(tripleSlashReferenceRegExp)) {
                return true;
            }
            else {
                return this.fullText().indexOf("/*!") === 0;
            }
        }

        public getText(): string[] {
            if (this.text === null) {
                if (this.isBlockComment()) {
                    this.text = this.fullText().split("\n");
                    for (var i = 0; i < this.text.length; i++) {
                        this.text[i] = this.text[i].replace(/^\s+|\s+$/g, '');
                    }
                }
                else {
                    this.text = [(this.fullText().replace(/^\s+|\s+$/g, ''))];
                }
            }

            return this.text;
        }

        public isDocComment() {
            if (this.isBlockComment()) {
                return this.fullText().charAt(2) === "*" && this.fullText().charAt(3) !== "/";
            }

            return false;
        }

        public getDocCommentTextValue() {
            if (this.docCommentText === null) {
                this.docCommentText = Comment.cleanJSDocComment(this.fullText());
            }

            return this.docCommentText;
        }

        static consumeLeadingSpace(line: string, startIndex: number, maxSpacesToRemove?: number) {
            var endIndex = line.length;
            if (maxSpacesToRemove !== undefined) {
                endIndex = min(startIndex + maxSpacesToRemove, endIndex);
            }

            for (; startIndex < endIndex; startIndex++) {
                var charCode = line.charCodeAt(startIndex);
                if (charCode !== CharacterCodes.space && charCode !== CharacterCodes.tab) {
                    return startIndex;
                }
            }

            if (endIndex !== line.length) {
                return endIndex;
            }

            return -1;
        }

        static isSpaceChar(line: string, index: number) {
            var length = line.length;
            if (index < length) {
                var charCode = line.charCodeAt(index);
                // If the character is space
                return charCode === CharacterCodes.space || charCode === CharacterCodes.tab;
            }

            // If the index is end of the line it is space
            return index === length;
        }

        static cleanDocCommentLine(line: string, jsDocStyleComment: boolean, jsDocLineSpaceToRemove?: number) {
            var nonSpaceIndex = Comment.consumeLeadingSpace(line, 0);
            if (nonSpaceIndex !== -1) {
                var jsDocSpacesRemoved = nonSpaceIndex;
                if (jsDocStyleComment && line.charAt(nonSpaceIndex) === '*') { // remove leading * in case of jsDocComment
                    var startIndex = nonSpaceIndex + 1;
                    nonSpaceIndex = Comment.consumeLeadingSpace(line, startIndex, jsDocLineSpaceToRemove);

                    if (nonSpaceIndex !== -1) {
                        jsDocSpacesRemoved = nonSpaceIndex - startIndex;
                    } else {
                        return null;
                    }
                }

                return {
                    start: nonSpaceIndex,
                    end: line.charAt(line.length - 1) === "\r" ? line.length - 1 : line.length,
                    jsDocSpacesRemoved: jsDocSpacesRemoved
                };
            }

            return null;
        }

        static cleanJSDocComment(content: string, spacesToRemove?: number) {

            var docCommentLines = new Array<string>();
            content = content.replace("/**", ""); // remove /**
            if (content.length >= 2 && content.charAt(content.length - 1) === "/" && content.charAt(content.length - 2) === "*") {
                content = content.substring(0, content.length - 2); // remove last */
            }
            var lines = content.split("\n");
            var inParamTag = false;
            for (var l = 0; l < lines.length; l++) {
                var line = lines[l];
                var cleanLinePos = Comment.cleanDocCommentLine(line, true, spacesToRemove);
                if (!cleanLinePos) {
                    // Whole line empty, read next line
                    continue;
                }

                var docCommentText = "";
                var prevPos = cleanLinePos.start;
                for (var i = line.indexOf("@", cleanLinePos.start); 0 <= i && i < cleanLinePos.end; i = line.indexOf("@", i + 1)) {
                    // We have encoutered @. 
                    // If we were omitting param comment, we dont have to do anything
                    // other wise the content of the text till @ tag goes as doc comment
                    var wasInParamtag = inParamTag;

                    // Parse contents next to @
                    if (line.indexOf("param", i + 1) === i + 1 && Comment.isSpaceChar(line, i + 6)) {
                        // It is param tag. 

                        // If we were not in param tag earlier, push the contents from prev pos of the tag this tag start as docComment
                        if (!wasInParamtag) {
                            docCommentText += line.substring(prevPos, i);
                        }

                        // New start of contents 
                        prevPos = i;
                        inParamTag = true;
                    } else if (wasInParamtag) {
                        // Non param tag start
                        prevPos = i;
                        inParamTag = false;
                    }
                }

                if (!inParamTag) {
                    docCommentText += line.substring(prevPos, cleanLinePos.end);
                }

                // Add line to comment text if it is not only white space line
                var newCleanPos = Comment.cleanDocCommentLine(docCommentText, false);
                if (newCleanPos) {
                    if (spacesToRemove === undefined) {
                        spacesToRemove = cleanLinePos.jsDocSpacesRemoved;
                    }
                    docCommentLines.push(docCommentText);
                }
            }

            return docCommentLines.join("\n");
        }

        static getDocCommentText(comments: Comment[]) {
            var docCommentText = new Array<string>();
            for (var c = 0 ; c < comments.length; c++) {
                var commentText = comments[c].getDocCommentTextValue();
                if (commentText !== "") {
                    docCommentText.push(commentText);
                }
            }
            return docCommentText.join("\n");
        }

        static getParameterDocCommentText(param: string, fncDocComments: Comment[]) {
            if (fncDocComments.length === 0 || !fncDocComments[0].isBlockComment()) {
                // there were no fnc doc comments and the comment is not block comment then it cannot have 
                // @param comment that can be parsed
                return "";
            }

            for (var i = 0; i < fncDocComments.length; i++) {
                var commentContents = fncDocComments[i].fullText();
                for (var j = commentContents.indexOf("@param", 0); 0 <= j; j = commentContents.indexOf("@param", j)) {
                    j += 6;
                    if (!Comment.isSpaceChar(commentContents, j)) {
                        // This is not param tag but a tag line @paramxxxxx
                        continue;
                    }

                    // This is param tag. Check if it is what we are looking for
                    j = Comment.consumeLeadingSpace(commentContents, j);
                    if (j === -1) {
                        break;
                    }

                    // Ignore the type expression
                    if (commentContents.charCodeAt(j) === CharacterCodes.openBrace) {
                        j++;
                        // Consume the type
                        var charCode = 0;
                        for (var curlies = 1; j < commentContents.length; j++) {
                            charCode = commentContents.charCodeAt(j);
                            // { character means we need to find another } to match the found one
                            if (charCode === CharacterCodes.openBrace) {
                                curlies++;
                                continue;
                            }

                            // } char
                            if (charCode === CharacterCodes.closeBrace) {
                                curlies--;
                                if (curlies === 0) {
                                    // We do not have any more } to match the type expression is ignored completely
                                    break;
                                } else {
                                    // there are more { to be matched with }
                                    continue;
                                }
                            }

                            // Found start of another tag
                            if (charCode === CharacterCodes.at) {
                                break;
                            }
                        }

                        // End of the comment
                        if (j === commentContents.length) {
                            break;
                        }

                        // End of the tag, go onto looking for next tag
                        if (charCode === CharacterCodes.at) {
                            continue;
                        }

                        j = Comment.consumeLeadingSpace(commentContents, j + 1);
                        if (j === -1) {
                            break;
                        }
                    }

                    // Parameter name
                    if (param !== commentContents.substr(j, param.length) || !Comment.isSpaceChar(commentContents, j + param.length)) {
                        // this is not the parameter we are looking for
                        continue;
                    }

                    // Found the parameter we were looking for
                    j = Comment.consumeLeadingSpace(commentContents, j + param.length);
                    if (j === -1) {
                        return "";
                    }

                    var endOfParam = commentContents.indexOf("@", j);
                    var paramHelpString = commentContents.substring(j, endOfParam < 0 ? commentContents.length : endOfParam);

                    // Find alignement spaces to remove
                    var paramSpacesToRemove: number = undefined;
                    var paramLineIndex = commentContents.substring(0, j).lastIndexOf("\n") + 1;
                    if (paramLineIndex !== 0) {
                        if (paramLineIndex < j && commentContents.charAt(paramLineIndex + 1) === "\r") {
                            paramLineIndex++;
                        }
                    }
                    var startSpaceRemovalIndex = Comment.consumeLeadingSpace(commentContents, paramLineIndex);
                    if (startSpaceRemovalIndex !== j && commentContents.charAt(startSpaceRemovalIndex) === "*") {
                        paramSpacesToRemove = j - startSpaceRemovalIndex - 1;
                    }

                    // Clean jsDocComment and return
                    return Comment.cleanJSDocComment(paramHelpString, paramSpacesToRemove);
                }
            }

            return "";
        }
    }

    export function diagnosticFromDecl(decl: PullDecl, diagnosticKey: string, arguments: any[]= null): Diagnostic {
        var span = decl.getSpan();
        return new Diagnostic(decl.fileName(), decl.semanticInfoChain().lineMap(decl.fileName()), span.start(), span.length(), diagnosticKey, arguments);
    }

    function min(a: number, b: number): number {
        return a <= b ? a : b;
    }
}