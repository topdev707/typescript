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
///<reference path='typescriptServices.ts' />

module Services {
    // Information about a specific host file.
    class HostFileInformation {
        private _sourceText: TypeScript.IScriptSnapshot;

        constructor(
            public fileName: string,
            private host: ILanguageServiceHost,
            public version: number,
            public isOpen: boolean,
            public byteOrderMark: ByteOrderMark) {
            this._sourceText = null;
        }
        
        public getScriptSnapshot(): TypeScript.IScriptSnapshot {
            if (this._sourceText === null) {
                this._sourceText = this.host.getScriptSnapshot(this.fileName);
            }

            return this._sourceText;
        }
    }

    // Cache host information about scripts. Should be refreshed 
    // at each language service public entry point, since we don't know when 
    // set of scripts handled by the host changes.
    class HostCache {
        private _fileNameToEntry: TypeScript.StringHashTable<HostFileInformation>;
        private _compilationSettings: TypeScript.ImmutableCompilationSettings;

        constructor(host: ILanguageServiceHost) {
            // script id => script index
            this._fileNameToEntry = new TypeScript.StringHashTable<HostFileInformation>();

            var fileNames = host.getScriptFileNames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                var fileName = fileNames[i];
                this._fileNameToEntry.add(TypeScript.switchToForwardSlashes(fileName), new HostFileInformation(
                    fileName, host, host.getScriptVersion(fileName), host.getScriptIsOpen(fileName), host.getScriptByteOrderMark(fileName)));
            }

            var settings = host.getCompilationSettings();
            if (!settings) {
                // Set "ES5" target by default for language service
                settings = new TypeScript.CompilationSettings();
                settings.codeGenTarget = TypeScript.LanguageVersion.EcmaScript5;
            }

            this._compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings);
        }

        public compilationSettings() {
            return this._compilationSettings;
        }

        public contains(fileName: string): boolean {
            return this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName)) !== null;
        }

        public getHostFileName(fileName: string) {
            var hostCacheEntry = this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName));
            if (hostCacheEntry) {
                return hostCacheEntry.fileName;
            }
            return fileName;
        }

        public getFileNames(): string[]{
            return this._fileNameToEntry.getAllKeys();
        }

        public getVersion(fileName: string): number {
            return this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName)).version;
        }

        public isOpen(fileName: string): boolean {
            return this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName)).isOpen;
        }

        public getByteOrderMark(fileName: string): ByteOrderMark {
            return this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName)).byteOrderMark;
        }

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            return this._fileNameToEntry.lookup(TypeScript.switchToForwardSlashes(fileName)).getScriptSnapshot();
        }

        public getScriptTextChangeRangeSinceVersion(fileName: string, lastKnownVersion: number): TypeScript.TextChangeRange {
            var currentVersion = this.getVersion(fileName);
            if (lastKnownVersion === currentVersion) {
                return TypeScript.TextChangeRange.unchanged; // "No changes"
            }

            var scriptSnapshot = this.getScriptSnapshot(fileName);
            return scriptSnapshot.getTextChangeRangeSinceVersion(lastKnownVersion);
        }
    }

    export class SyntaxTreeCache {
        private _hostCache: HostCache;

        // For our syntactic only features, we also keep a cache of the syntax tree for the 
        // currently edited file.  
        private _currentFileName: string = "";
        private _currentFileVersion: number = -1;
        private _currentFileSyntaxTree: TypeScript.SyntaxTree = null;
        private _currentFileScriptSnapshot: TypeScript.IScriptSnapshot = null;

        constructor(private _host: ILanguageServiceHost) {
            this._hostCache = new HostCache(_host);
        }

        public getCurrentFileSyntaxTree(fileName: string): TypeScript.SyntaxTree {
            this._hostCache = new HostCache(this._host);

            var version = this._hostCache.getVersion(fileName);
            var syntaxTree: TypeScript.SyntaxTree = null;

            if (this._currentFileSyntaxTree === null || this._currentFileName !== fileName) {
                var scriptSnapshot = this._hostCache.getScriptSnapshot(fileName);
                syntaxTree = this.createSyntaxTree(fileName, scriptSnapshot);
            }
            else if (this._currentFileVersion !== version) {
                var scriptSnapshot = this._hostCache.getScriptSnapshot(fileName);
                syntaxTree = this.updateSyntaxTree(fileName, scriptSnapshot, this._currentFileSyntaxTree, this._currentFileVersion);
            }

            if (syntaxTree !== null) {
                // All done, ensure state is up to date
                this._currentFileScriptSnapshot = scriptSnapshot;
                this._currentFileVersion = version;
                this._currentFileName = fileName;
                this._currentFileSyntaxTree = syntaxTree;
            }

            return this._currentFileSyntaxTree;
        }

        private createSyntaxTree(fileName: string, scriptSnapshot: TypeScript.IScriptSnapshot): TypeScript.SyntaxTree {
            var text = TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot);

            // For the purposes of features that use this syntax tree, we can just use the default
            // compilation settings.  The features only use the syntax (and not the diagnostics),
            // and the syntax isn't affected by the compilation settings.
            var syntaxTree = TypeScript.Parser.parse(fileName, text, TypeScript.isDTSFile(fileName),
                TypeScript.getParseOptions(TypeScript.ImmutableCompilationSettings.defaultSettings()));

            return syntaxTree;
        }

        private updateSyntaxTree(fileName: string, scriptSnapshot: TypeScript.IScriptSnapshot, previousSyntaxTree: TypeScript.SyntaxTree, previousFileVersion: number): TypeScript.SyntaxTree {
            var editRange = this._hostCache.getScriptTextChangeRangeSinceVersion(fileName, previousFileVersion);

            // Debug.assert(newLength >= 0);

            // The host considers the entire buffer changed.  So parse a completely new tree.
            if (editRange === null) {
                return this.createSyntaxTree(fileName, scriptSnapshot);
            }

            var nextSyntaxTree = TypeScript.Parser.incrementalParse(previousSyntaxTree, editRange,
                TypeScript.SimpleText.fromScriptSnapshot(scriptSnapshot));

            this.ensureInvariants(fileName, editRange, nextSyntaxTree, this._currentFileScriptSnapshot, scriptSnapshot);

            return nextSyntaxTree;
        }

        private ensureInvariants(fileName: string, editRange: TypeScript.TextChangeRange, incrementalTree: TypeScript.SyntaxTree, oldScriptSnapshot: TypeScript.IScriptSnapshot, newScriptSnapshot: TypeScript.IScriptSnapshot) {
            // First, verify that the edit range and the script snapshots make sense.

            // If this fires, then the edit range is completely bogus.  Somehow the lengths of the
            // old snapshot, the change range and the new snapshot aren't in sync.  This is very
            // bad.
            var expectedNewLength = oldScriptSnapshot.getLength() - editRange.span().length() + editRange.newLength();
            var actualNewLength = newScriptSnapshot.getLength();
            TypeScript.Debug.assert(expectedNewLength === actualNewLength);

            // The following checks are quite expensive.  Don't perform them by default.
            return;

            // If this fires, the text change range is bogus.  It says the change starts at point 
            // 'X', but we can see a text difference *before* that point.
            var oldPrefixText = oldScriptSnapshot.getText(0, editRange.span().start());
            var newPrefixText = newScriptSnapshot.getText(0, editRange.span().start());
            TypeScript.Debug.assert(oldPrefixText === newPrefixText);

            // If this fires, the text change range is bogus.  It says the change goes only up to
            // point 'X', but we can see a text difference *after* that point.
            var oldSuffixText = oldScriptSnapshot.getText(editRange.span().end(), oldScriptSnapshot.getLength());
            var newSuffixText = newScriptSnapshot.getText(editRange.newSpan().end(), newScriptSnapshot.getLength());
            TypeScript.Debug.assert(oldSuffixText === newSuffixText);

            // Ok, text change range and script snapshots look ok.  Let's verify that our 
            // incremental parsing worked properly.
            var normalTree = this.createSyntaxTree(fileName, newScriptSnapshot);
            TypeScript.Debug.assert(normalTree.structuralEquals(incrementalTree));

            // Ok, the trees looked good.  So at least our incremental parser agrees with the 
            // normal parser.  Now, verify that the incremental tree matches the contents of the 
            // script snapshot.
            var incrementalTreeText = incrementalTree.sourceUnit().fullText();
            var actualSnapshotText = newScriptSnapshot.getText(0, newScriptSnapshot.getLength());
            TypeScript.Debug.assert(incrementalTreeText === actualSnapshotText);
        }
    }

    export class LanguageServiceCompiler {
        private logger: TypeScript.ILogger;

        // The underlying typescript compiler we defer most operations to.
        private compiler: TypeScript.TypeScriptCompiler = null;

        // A cache of all the information about the files on the host side.
        private hostCache: HostCache = null;

        constructor(private host: ILanguageServiceHost) {
            this.logger = this.host;
        }

        public getResolver(): TypeScript.PullTypeResolver {
            return null;
        }

        private synchronizeHostData(): void {
            TypeScript.timeFunction(this.logger, "refresh()", () => {
                this.synchronizeHostDataWorker();
            });
        }

        private synchronizeHostDataWorker(): void {
            // Reset the cache at start of every refresh
            this.hostCache = new HostCache(this.host);

            var compilationSettings = this.hostCache.compilationSettings();

                // If we don't have a compiler, then create a new one.
            if (this.compiler === null) {
                this.compiler = new TypeScript.TypeScriptCompiler(this.logger, compilationSettings);
            }

            // let the compiler know about the current compilation settings.  
            this.compiler.setCompilationSettings(compilationSettings);

            // Now, remove any files from the compiler that are no longer in hte host.
            var compilerFileNames = this.compiler.fileNames();
            for (var i = 0, n = compilerFileNames.length; i < n; i++) {
                var fileName = compilerFileNames[i];

                if (!this.hostCache.contains(fileName)) {
                    this.compiler.removeFile(fileName);
                }
            }

            // Now, for every file the host knows about, either add the file (if the compiler
            // doesn't know about it.).  Or notify the compiler about any changes (if it does
            // know about it.)
            var cache = this.hostCache;
            var hostFileNames = cache.getFileNames();
            for (var i = 0, n = hostFileNames.length; i < n; i++) {
                var fileName = hostFileNames[i];

                if (this.compiler.getDocument(fileName)) {
                    this.tryUpdateFile(this.compiler, fileName);
                }
                else {
                    this.compiler.addFile(fileName,
                        cache.getScriptSnapshot(fileName), cache.getByteOrderMark(fileName), cache.getVersion(fileName), cache.isOpen(fileName));
                }
            }
        }

        private tryUpdateFile(compiler: TypeScript.TypeScriptCompiler, fileName: string): void {
            var document: TypeScript.Document = this.compiler.getDocument(fileName);

            //
            // If the document is the same, assume no update
            //
            var version = this.hostCache.getVersion(fileName);
            var isOpen = this.hostCache.isOpen(fileName);
            if (document.version === version && document.isOpen === isOpen) {
                return;
            }

            var textChangeRange = this.hostCache.getScriptTextChangeRangeSinceVersion(fileName, document.version);
            compiler.updateFile(fileName,
                this.hostCache.getScriptSnapshot(fileName),
                version, isOpen, textChangeRange);
        }

        // Methods that defer to the host cache to get the result.

        public getScriptSnapshot(fileName: string): TypeScript.IScriptSnapshot {
            this.synchronizeHostData();
            return this.hostCache.getScriptSnapshot(fileName);
        }

        public getHostFileName(fileName: string) {
            this.synchronizeHostData();
            return this.hostCache.getHostFileName(fileName);
        }

        public getScriptVersion(fileName: string) {
            this.synchronizeHostData();
            return this.hostCache.getVersion(fileName);
        }

        // Methods that defer to the compiler to get the result.

        public compilationSettings(): TypeScript.ImmutableCompilationSettings {
            this.synchronizeHostData();
            return this.compiler.compilationSettings();
        }

        public fileNames(): string[] {
            this.synchronizeHostData();
            return this.compiler.fileNames();
        }

        public getDocument(fileName: string): TypeScript.Document {
            this.synchronizeHostData();
            return this.compiler.getDocument(fileName);
        }

        public getSyntacticDiagnostics(fileName: string): TypeScript.Diagnostic[] {
            this.synchronizeHostData();
            return this.compiler.getSyntacticDiagnostics(fileName);
        }

        public getSemanticDiagnostics(fileName: string): TypeScript.Diagnostic[] {
            this.synchronizeHostData();
            return this.compiler.getSemanticDiagnostics(fileName);
        }

        public getSymbolInformationFromAST(ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetSymbolInformationFromAST(ast, document);
        }

        public getCallInformationFromAST(ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetCallInformationFromAST(ast, document);
        }

        public getVisibleMemberSymbolsFromAST(ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetVisibleMemberSymbolsFromAST(ast, document);
        }

        public getVisibleDeclsFromAST(ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetVisibleDeclsFromAST(ast, document);
        }

        public getContextualMembersFromAST(ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetContextualMembersFromAST(ast, document);
        }

        public pullGetDeclInformation(decl: TypeScript.PullDecl, ast: TypeScript.AST, document: TypeScript.Document) {
            this.synchronizeHostData();
            return this.compiler.pullGetDeclInformation(decl, ast, document);
        }

        public topLevelDeclaration(fileName: string) {
            this.synchronizeHostData();
            return this.compiler.topLevelDeclaration(fileName);
        }

        public getDeclForAST(ast: TypeScript.AST): TypeScript.PullDecl {
            this.synchronizeHostData();
            return this.compiler.getDeclForAST(ast);
        }

        public emit(fileName: string, resolvePath: (path: string) => string, sourceMapEmitterCallback: TypeScript.SourceMapEmitterCallback = null): TypeScript.EmitOutput {
            this.synchronizeHostData();
            return this.compiler.emit(fileName, resolvePath, sourceMapEmitterCallback);
        }

        public emitDeclarations(fileName: string, resolvePath: (path: string) => string, sourceMapEmitterCallback: TypeScript.SourceMapEmitterCallback = null): TypeScript.EmitOutput {
            this.synchronizeHostData();
            return this.compiler.emitDeclarations(fileName, resolvePath, sourceMapEmitterCallback);
        }
    }
}
