﻿///<reference path='References.ts' />

module TypeScript.Syntax {
    export function realizeToken(token: ISyntaxToken): ISyntaxToken {
        return new RealizedToken(token.tokenKind,
            token.leadingTrivia(), token.text(), token.value(), token.valueText(), token.trailingTrivia());
    }

    export function convertToIdentifierName(token: ISyntaxToken): ISyntaxToken {
        Debug.assert(SyntaxFacts.isAnyKeyword(token.tokenKind));
        return new RealizedToken(SyntaxKind.IdentifierName,
            token.leadingTrivia(), token.text(), token.text(), token.text(), token.trailingTrivia());
    }

    export function tokenToJSON(token: ISyntaxToken) {
        var result: any = {};

        result.kind = (<any>SyntaxKind)._map[token.kind()];

        result.width = token.width();
        if (token.fullWidth() !== token.width()) {
            result.fullWidth = token.fullWidth();
        }

        result.text = token.text();

        var value = token.value();
        if (value !== null) {
            result.value = value;
            result.valueText = token.valueText();
        }

        if (token.hasLeadingTrivia()) {
            result.hasLeadingTrivia = true;
        }

        if (token.hasLeadingComment()) {
            result.hasLeadingComment = true;
        }

        if (token.hasLeadingNewLine()) {
            result.hasLeadingNewLine = true;
        }

        if (token.hasLeadingSkippedText()) {
            result.hasLeadingSkippedText = true;
        }

        if (token.hasTrailingTrivia()) {
            result.hasTrailingTrivia = true;
        }

        if (token.hasTrailingComment()) {
            result.hasTrailingComment = true;
        }

        if (token.hasTrailingNewLine()) {
            result.hasTrailingNewLine = true;
        }

        if (token.hasTrailingSkippedText()) {
            result.hasTrailingSkippedText = true;
        }

        var trivia = token.leadingTrivia();
        if (trivia.count() > 0) {
            result.leadingTrivia = trivia;
        }

        trivia = token.trailingTrivia();
        if (trivia.count() > 0) {
            result.trailingTrivia = trivia;
        }

        return result;
    }

    export function value(token: ISyntaxToken): any {
        return value1(token.tokenKind, token.text());
    }

    function hexValue(text: string, start: number, length: number): number {
        var intChar = 0
        for (var i = 0; i < length; i++) {
            var ch2 = text.charCodeAt(start + i);
            if (!CharacterInfo.isHexDigit(ch2)) {
                break;
            }

            intChar = (intChar << 4) + CharacterInfo.hexValue(ch2);
        }

        return intChar;
    }

    var characterArray: number[] = [];
    function convertEscapes(text: string): string {
        characterArray.length = 0;

        for (var i = 0, n = text.length; i < n; i++) {
            var ch = text.charCodeAt(i);

            if (ch === CharacterCodes.backslash) {
                i++;
                if (i < n) {
                    ch = text.charCodeAt(i);
                    switch (ch) {
                        case CharacterCodes._0:
                            characterArray.push(CharacterCodes.nullCharacter);
                            continue;

                        case CharacterCodes.b:
                            characterArray.push(CharacterCodes.backspace);
                            continue;

                        case CharacterCodes.f:
                            characterArray.push(CharacterCodes.formFeed);
                            continue;

                        case CharacterCodes.n:
                            characterArray.push(CharacterCodes.lineFeed);
                            continue;

                        case CharacterCodes.r:
                            characterArray.push(CharacterCodes.carriageReturn);
                            continue;

                        case CharacterCodes.t:
                            characterArray.push(CharacterCodes.tab);
                            continue;

                        case CharacterCodes.v:
                            characterArray.push(CharacterCodes.verticalTab);
                            continue;

                        case CharacterCodes.x:
                            characterArray.push(hexValue(text, /*start:*/ i + 1, /*length:*/ 2));
                            i += 2;
                            continue;

                        case CharacterCodes.u:
                            characterArray.push(hexValue(text, /*start:*/ i + 1, /*length:*/ 4));
                            i += 4;
                            continue;

                        default:
                            // Any other character is ok as well.  As per rule:
                            // EscapeSequence :: CharacterEscapeSequence
                            // CharacterEscapeSequence :: NonEscapeCharacter
                            // NonEscapeCharacter :: SourceCharacter but notEscapeCharacter or LineTerminator
                            //
                            // Intentional fall through
                        }
                }
            }

            characterArray.push(ch);
        }

        return String.fromCharCode.apply(null, characterArray);
    }

    function massageEscapes(text: string): string {
        return text.indexOf("\\") >= 0 ? convertEscapes(text) : text;
    }

    function value1(kind: SyntaxKind, text: string): any {
        if (kind === SyntaxKind.IdentifierName) {
            return massageEscapes(text);
        }

        switch (kind) {
            case SyntaxKind.TrueKeyword:
                return true;
            case SyntaxKind.FalseKeyword:
                return false;
            case SyntaxKind.NullKeyword:
                return null;
        }

        if (SyntaxFacts.isAnyKeyword(kind) || SyntaxFacts.isAnyPunctuation(kind)) {
            return SyntaxFacts.getText(kind);
        }

        if (kind === SyntaxKind.NumericLiteral) {
            return parseFloat(text);
        }
        else if (kind === SyntaxKind.StringLiteral) {
            if (text.length > 1 && text.charCodeAt(text.length - 1) === text.charCodeAt(0)) {
                // Properly terminated.  Remove the quotes, and massage any escape characters we see.
                return massageEscapes(text.substr(1, text.length - 2));
            }
            else {
                // Not property terminated.  Remove the first quote and massage any escape characters we see.
                return massageEscapes(text.substr(1));

            }
        }
        else if (kind === SyntaxKind.RegularExpressionLiteral) {
            try {
                var lastSlash = text.lastIndexOf("/");
                var body = text.substring(1, lastSlash);
                var flags = text.substring(lastSlash + 1);
                return new RegExp(body, flags);
            }
            catch (e) {
                return null;
            }
        }
        else if (kind === SyntaxKind.EndOfFileToken || kind === SyntaxKind.ErrorToken) {
            return null;
        }
        else {
            throw Errors.invalidOperation();
        }
    }

    function valueText1(kind: SyntaxKind, text: string): string {
        var value = value1(kind, text);
        return value === null ? "" : value.toString();
    }

    export function valueText(token: ISyntaxToken): string {
        var value = token.value();
        return value === null ? "" : value.toString();
    }

    class EmptyToken implements ISyntaxToken {
        public tokenKind: SyntaxKind;

        constructor(kind: SyntaxKind) {
            this.tokenKind = kind;
        }

        public clone(): ISyntaxToken {
            return new EmptyToken(this.tokenKind);
        }

        public kind() { return this.tokenKind; }

        public isToken(): bool { return true; }
        public isNode(): bool { return false; }
        public isList(): bool { return false; }
        public isSeparatedList(): bool { return false; }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): ISyntaxElement {
            throw Errors.argumentOutOfRange("index");
        }

        public toJSON(key) { return tokenToJSON(this); }
        private accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }

        private findTokenInternal(parent: PositionedElement, position: number, fullStart: number): PositionedToken {
            return new PositionedToken(parent, this, fullStart);
        }

        private firstToken() { return this; }
        private lastToken() { return this; }
        private isTypeScriptSpecific() { return false; }

        // Empty tokens are never incrementally reusable.
        private isIncrementallyReusable() { return false; }

        public fullWidth() { return 0; }
        public width() { return 0; }
        public text() { return ""; }
        public fullText(): string { return ""; }
        public value() { return null; }
        public valueText() { return ""; }

        public hasLeadingTrivia() { return false; }
        public hasLeadingComment() { return false; }
        public hasLeadingNewLine() { return false; }
        public hasLeadingSkippedText() { return false; }
        public leadingTriviaWidth() { return 0; }
        public hasTrailingTrivia() { return false; }
        public hasTrailingComment() { return false; }
        public hasTrailingNewLine() { return false; }
        public hasTrailingSkippedText() { return false; }
        public hasSkippedText() { return false; }

        public trailingTriviaWidth() { return 0; }
        public leadingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }
        public trailingTrivia(): ISyntaxTriviaList { return Syntax.emptyTriviaList; }
        public realize(): ISyntaxToken { return realizeToken(this); }
        private collectTextElements(elements: string[]): void { }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withLeadingTrivia(leadingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return this.realize().withTrailingTrivia(trailingTrivia);
        }
    }

    export function emptyToken(kind: SyntaxKind): ISyntaxToken {
        return new EmptyToken(kind);
    }

    class RealizedToken implements ISyntaxToken {
        public tokenKind: SyntaxKind;
        // public tokenKeywordKind: SyntaxKind;
        private _leadingTrivia: ISyntaxTriviaList;
        private _text: string;
        private _value: any;
        private _valueText: string;
        private _trailingTrivia: ISyntaxTriviaList;

        constructor(tokenKind: SyntaxKind,
                    leadingTrivia: ISyntaxTriviaList,
                    text: string,
                    value: any,
                    valueText: string,
                    trailingTrivia: ISyntaxTriviaList) {
            this.tokenKind = tokenKind;
            this._leadingTrivia = leadingTrivia;
            this._text = text;
            this._value = value;
            this._valueText = valueText;
            this._trailingTrivia = trailingTrivia;
        }

        public clone(): ISyntaxToken {
            return new RealizedToken(this.tokenKind, /*this.tokenKeywordKind,*/ this._leadingTrivia,
                this._text, this._value, this._valueText, this._trailingTrivia);
        }

        public kind(): SyntaxKind { return this.tokenKind; }
        public toJSON(key) { return tokenToJSON(this); }
        private firstToken() { return this; }
        private lastToken() { return this; }
        private isTypeScriptSpecific() { return false; }

        // Realized tokens are created from the parser.  They are *never* incrementally reusable.
        private isIncrementallyReusable() { return false; }

        private accept(visitor: ISyntaxVisitor): any { return visitor.visitToken(this); }

        public childCount(): number {
            return 0;
        }

        public childAt(index: number): ISyntaxElement {
            throw Errors.argumentOutOfRange("index");
        }

        public isToken(): bool { return true; }
        public isNode(): bool { return false; }
        public isList(): bool { return false; }
        public isSeparatedList(): bool { return false; }
        public isTrivia(): bool { return false; }
        public isTriviaList(): bool { return false; }

        public fullWidth(): number { return this._leadingTrivia.fullWidth() + this.width() + this._trailingTrivia.fullWidth(); }
        public width(): number { return this.text().length; }

        public text(): string { return this._text; }
        public fullText(): string { return this._leadingTrivia.fullText() + this.text() + this._trailingTrivia.fullText(); }

        public value(): any { return this._value; }
        public valueText(): string { return this._valueText; }

        public hasLeadingTrivia(): bool { return this._leadingTrivia.count() > 0; }
        public hasLeadingComment(): bool { return this._leadingTrivia.hasComment(); }
        public hasLeadingNewLine(): bool { return this._leadingTrivia.hasNewLine(); }
        public hasLeadingSkippedText(): bool { return this._leadingTrivia.hasSkippedText(); }
        public leadingTriviaWidth(): number { return this._leadingTrivia.fullWidth(); }

        public hasTrailingTrivia(): bool { return this._trailingTrivia.count() > 0; }
        public hasTrailingComment(): bool { return this._trailingTrivia.hasComment(); }
        public hasTrailingNewLine(): bool { return this._trailingTrivia.hasNewLine(); }
        public hasTrailingSkippedText(): bool { return this._trailingTrivia.hasSkippedText(); }
        public trailingTriviaWidth(): number { return this._trailingTrivia.fullWidth(); }

        public hasSkippedText(): bool { return this.hasLeadingSkippedText() || this.hasTrailingSkippedText(); }

        public leadingTrivia(): ISyntaxTriviaList { return this._leadingTrivia; }
        public trailingTrivia(): ISyntaxTriviaList { return this._trailingTrivia; }

        private findTokenInternal(parent: PositionedElement, position: number, fullStart: number): PositionedToken {
            return new PositionedToken(parent, this, fullStart);
        }

        private collectTextElements(elements: string[]): void {
            this.leadingTrivia().collectTextElements(elements);
            elements.push(this.text());
            this.trailingTrivia().collectTextElements(elements);
        }

        public withLeadingTrivia(leadingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this.tokenKind, leadingTrivia, this._text, this._value, this._valueText, this._trailingTrivia);
        }

        public withTrailingTrivia(trailingTrivia: ISyntaxTriviaList): ISyntaxToken {
            return new RealizedToken(
                this.tokenKind,  this._leadingTrivia, this._text, this._value, this._valueText, trailingTrivia);
        }
    }

    export function token(kind: SyntaxKind, info: ITokenInfo = null): ISyntaxToken {
        var text = (info !== null && info.text !== undefined) ? info.text : SyntaxFacts.getText(kind);

        return new RealizedToken(
            kind,
            Syntax.triviaList(info === null ? null : info.leadingTrivia),
            text,
            value1(kind, text),
            valueText1(kind, text),
            Syntax.triviaList(info === null ? null : info.trailingTrivia));
    }
    
    export function identifier(text: string, info: ITokenInfo = null): ISyntaxToken {
        info = info || {};
        info.text = text;
        return token(SyntaxKind.IdentifierName, info);
    }
}