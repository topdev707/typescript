/// Copyright (c) 2012 Ecma International.  All rights reserved. 
/// Ecma International makes this code available under the terms and conditions set
/// forth on http://hg.ecmascript.org/tests/test262/raw-file/tip/LICENSE (the 
/// "Use Terms").   Any redistribution of this code must retain the above 
/// copyright and this notice and otherwise comply with the Use Terms.
/**
 * @path ch15/15.2/15.2.3/15.2.3.2/15.2.3.2-2-30.js
 * @description Object.getPrototypeOf returns the [[Prototype]] of its parameter (the global object)
 */


function testcase() {
        var proto = Object.getPrototypeOf(fnGlobalObject());

        return proto.isPrototypeOf(fnGlobalObject()) === true;
    }
runTestCase(testcase);
