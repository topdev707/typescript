// @target: ES5
// @declaration: true
// @comments: true

/** This is class c2 without constuctor*/
class c2 {
}
var i2 = new c2();
var i2_c = c2;
class c3 {
    /** Constructor comment*/
    constructor() {
    }
}
var i3 = new c3();
var i3_c = c3;
/** Class comment*/
class c4 {
    /** Constructor comment*/
    constructor() {
    }
}
var i4 = new c4();
var i4_c = c4;
/** Class with statics*/
class c5 {
    static s1: number;
}
var i5 = new c5();
var i5_c = c5;
/** class with statics and constructor*/
class c6 {
    /** s1 comment*/
    static s1: number;
    /** constructor comment*/
    constructor() {
    }
}
var i6 = new c6();
var i6_c = c6;
