//@module: amd
// @Filename: moduleAliasAsFunctionArgument_0.ts
declare module 'aMod' {
    export var x: number;
}

// @Filename: moduleAliasAsFunctionArgument_1.ts
///<reference path='moduleAliasAsFunctionArgument_0.ts'/>
import a = require('aMod');

function fn(arg: { x: number }) {
}

a.x; // OK
fn(a); // Error: property 'x' is missing from 'a'
