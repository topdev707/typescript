/// <reference path="fourslash.ts" />

//// interface Sequence<T> {
////     each(iterator: (value: T) => void): void;
////     filter(): Sequence<T>;
////     groupBy<K>(keySelector: () => K): Sequence<{ items: T/**/[]; }>;
//// }

goTo.file(0);

// Marker in above file is placed at position 154
// Bug 773624: crash here
// diagnostics.validateTypesAtPositions(154);
