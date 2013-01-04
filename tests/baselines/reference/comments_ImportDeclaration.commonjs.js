goTo.marker('1');
verify.quickInfoIs("extMod\nExtMod - contains m1");
goTo.marker('2');
verify.quickInfoIs("m1\nModuleComment");
goTo.marker('3');
verify.quickInfoIs("extMod\nExtMod - contains m1");
goTo.marker('4');
verify.quickInfoIs("extMod\nExtMod - contains m1");
goTo.marker('5');
verify.completionListContains("extMod", "extMod", "Import declaration");
goTo.marker('6');
verify.memberListContains("m1", "extMod.m1", "ModuleComment");
goTo.marker('7');
verify.memberListContains("b", "number", "b's comment");
verify.memberListContains("fooExport", "() => number", "exported function");
verify.memberListContains("m2", "extMod.m1.m2", "m2 comments");
goTo.marker('8');
verify.currentSignatureHelpDocCommentIs("exported function");
goTo.marker('9');
verify.quickInfoIs("extMod.m1.m2.c\nclass comment;");
goTo.marker('10');
verify.memberListContains("c", "new() => extMod.m1.m2.c", "class comment;");
verify.memberListContains("i", "extMod.m1.m2.c", "i");