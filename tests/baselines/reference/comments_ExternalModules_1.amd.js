////[comments_ExternalModules_1.js]
define(["require", "exports", "comments_ExternalModules_0"], function(require, exports, __extMod__) {
    var extMod = __extMod__;

    extMod.m1.fooExport();
    exports.newVar = new extMod.m1.m2.c();
})
////[comments_ExternalModules_1.d.ts]
import extMod = module ("comments_ExternalModules_0");
export var newVar: extMod.m1.m2.c;