///<reference path='ArrayUtilities.ts' />
///<reference path='Errors.ts' />
///<reference path='ISyntaxTriviaList.ts' />
///<reference path='SyntaxTrivia.ts' />

module Syntax {
    function collectSyntaxTriviaListTextElements(elements: string[], list: ISyntaxTriviaList): void {
        for (var i = 0, n = list.count(); i < n; i++) {
            list.syntaxTriviaAt(i).collectTextElements(elements);
        }
    }

    export var emptyTriviaList: ISyntaxTriviaList = {
        kind: (): SyntaxKind => SyntaxKind.TriviaList,
        isToken: (): bool => false,
        isNode: (): bool => false,
        isList: (): bool => false,
        isSeparatedList: (): bool => false,
        isTriviaList: (): bool => true,
        isTrivia: (): bool => false,
        isMissing: (): bool => true,

        count: (): number => 0,

        syntaxTriviaAt: (index: number): ISyntaxTrivia => {
            throw Errors.argumentOutOfRange("index");
        },

        last: (): ISyntaxTrivia => {
            throw Errors.argumentOutOfRange("index");
        },

        fullWidth: (): number => 0,
        fullText: (): string => "",

        hasComment: (): bool => false,
        hasNewLine: (): bool => false,
        hasSkippedText: (): bool => false,

        toJSON: (key) => [],

        collectTextElements: (elements: string[]): void => { },

        toArray: (): ISyntaxTrivia[] => [],

        concat: (trivia: ISyntaxTriviaList): ISyntaxTriviaList => trivia,
    };

    function concatTrivia(list1: ISyntaxTriviaList, list2: ISyntaxTriviaList): ISyntaxTriviaList {
        if (list1.count() === 0) {
            return list2;
        }

        if (list2.count() === 0) {
            return list1;
        }

        var trivia = list1.toArray();
        trivia.push.apply(trivia, list2.toArray());

        return triviaList(trivia);
    }

    function isComment(trivia: ISyntaxTrivia): bool {
        return trivia.kind() === SyntaxKind.MultiLineCommentTrivia || trivia.kind() === SyntaxKind.SingleLineCommentTrivia;
    }

    class SingletonSyntaxTriviaList implements ISyntaxTriviaList {
        private item: ISyntaxTrivia;
        public isToken(): bool { return false; }
        public isNode(): bool { return false; }
        public isList(): bool { return false; }
        public isSeparatedList(): bool { return false; }
        public isTriviaList(): bool { return true; }
        public isTrivia(): bool { return false; }
        public isMissing(): bool { return this.item.isMissing(); }
        
        constructor(item: ISyntaxTrivia) {
            this.item = item;
        }

        public kind(): SyntaxKind { return SyntaxKind.TriviaList; }

        public count(): number {
            return 1;
        }

        public syntaxTriviaAt(index: number): ISyntaxTrivia {
            if (index !== 0) {
                throw Errors.argumentOutOfRange("index");
            }

            return this.item;
        }

        public last(): ISyntaxTrivia {
            return this.item;
        }

        public fullWidth(): number {
            return this.item.fullWidth();
        }

        public fullText(): string {
            return this.item.fullText();
        }

        public hasComment(): bool {
            return isComment(this.item);
        }

        public hasNewLine(): bool {
            return this.item.kind() === SyntaxKind.NewLineTrivia;
        }

        public hasSkippedText(): bool {
            return this.item.kind() === SyntaxKind.SkippedTextTrivia;
        }

        public toJSON(key) {
            return [this.item];
        }

        public collectTextElements(elements: string[]): void { collectSyntaxTriviaListTextElements(elements, this); }

        public toArray(): ISyntaxTrivia[] {
            return [this.item];
        }

        public concat(trivia: ISyntaxTriviaList): ISyntaxTriviaList {
            return concatTrivia(this, trivia);
        }
    }

    class NormalSyntaxTriviaList implements ISyntaxTriviaList {
        private trivia: ISyntaxTrivia[];

        constructor(trivia: ISyntaxTrivia[]) {
            this.trivia = trivia;
        }

        public kind(): SyntaxKind { return SyntaxKind.TriviaList; }
        public isToken(): bool { return false; }
        public isNode(): bool { return false; }
        public isList(): bool { return false; }
        public isSeparatedList(): bool { return false; }
        public isTriviaList(): bool { return true; }
        public isTrivia(): bool { return false; }

        public isMissing(): bool {
            for (var i = 0, n = this.trivia.length; i < n; i++) {
                if (!this.trivia[i].isMissing()) {
                    return false;
                }
            }

            return true;
        }

        public count() {
            return this.trivia.length;
        }

        public syntaxTriviaAt(index: number): ISyntaxTrivia {
            if (index < 0 || index >= this.trivia.length) {
                throw Errors.argumentOutOfRange("index");
            }

            return this.trivia[index];
        }
        
        public last(): ISyntaxTrivia {
            return this.trivia[this.trivia.length - 1];
        }

        public fullWidth(): number {
            return ArrayUtilities.sum(this.trivia, t => t.fullWidth());
        }

        public fullText(): string {
            var result = "";

            for (var i = 0, n = this.trivia.length; i < n; i++) {
                result += this.trivia[i].fullText();
            }

            return result;
        }

        public hasComment(): bool {
            for (var i = 0; i < this.trivia.length; i++) {
                if (isComment(this.trivia[i])) {
                    return true;
                }
            }

            return false;
        }

        public hasNewLine(): bool {
            for (var i = 0; i < this.trivia.length; i++) {
                if (this.trivia[i].kind() === SyntaxKind.NewLineTrivia) {
                    return true;
                }
            }

            return false;
        }

        public hasSkippedText(): bool {
            for (var i = 0; i < this.trivia.length; i++) {
                if (this.trivia[i].kind() === SyntaxKind.SkippedTextTrivia) {
                    return true;
                }
            }

            return false;
        }

        public toJSON(key) {
            return this.trivia;
        }

        public collectTextElements(elements: string[]): void { collectSyntaxTriviaListTextElements(elements, this); }

        public toArray(): ISyntaxTrivia[] {
            return this.trivia.slice(0);
        }

        public concat(trivia: ISyntaxTriviaList): ISyntaxTriviaList {
            return concatTrivia(this, trivia);
        }
    }

    export function triviaList(trivia: ISyntaxTrivia[]): ISyntaxTriviaList {
        if (trivia === undefined || trivia === null || trivia.length === 0) {
            return Syntax.emptyTriviaList;
        }

        if (trivia.length === 1) {
            return new SingletonSyntaxTriviaList(trivia[0]);
        }

        return new NormalSyntaxTriviaList(trivia);
    }

    export var spaceTriviaList: ISyntaxTriviaList = triviaList([Syntax.spaceTrivia]);
}