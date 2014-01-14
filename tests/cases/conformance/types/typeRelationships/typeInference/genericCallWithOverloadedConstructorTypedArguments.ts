// Function typed arguments with multiple signatures must be passed an implementation that matches all of them
// No inferences are made to or from such types

module NonGenericParameter {
    var a: {
        new(x: boolean): boolean;
        new(x: string): string;
    }

    function foo4(cb: typeof a) {
        return new cb(null);
    }

    var r = foo4(a);
    var b: { new <T>(x: T): T };
    var r2 = foo4(b);
}

module GenericParameter {
    function foo5<T>(cb: { new(x: T): string; new(x: number): T }) {
        return cb;
    }

    var a: {
        new (x: boolean): string;
        new (x: number): boolean;
    }
    var r5 = foo5(a); // new{} => string; new(x:number) => {}
    var b: { new<T>(x: T): string; new<T>(x: number): T; }
    var r7 = foo5(b); // new{} => string; new(x:number) => {}

    function foo6<T>(cb: { new(x: T): string; new(x: T, y?: T): string }) {
        return cb;
    }

    var r8 = foo6(a); // new{} => string; new(x:{}, y?:{}) => {}
    var r9 = foo6(b); // new{} => string; new(x:{}, y?:{}) => {}

    function foo7<T>(x:T, cb: { new(x: T): string; new(x: T, y?: T): string }) {
        return cb;
    }

    var r13 = foo7(1, b); // new{} => string; new(x:{}, y?:{}) => {}
    var c: { new <T>(x: T): string; <T>(x: number): T; }
    var c2: { new <T>(x: T): string; new<T>(x: number): T; }
    var r14 = foo7(1, c); // new{} => string; new(x:{}, y?:{}) => {}
    var r15 = foo7(1, c2); // new{} => string; new(x:{}, y?:{}) => {}
}