var __test1__;
(function (__test1__) {
    ;
    var obj4 = { one: 1 };
    ;
    __test1__.__val__obj4 = obj4;
})(__test1__ || (__test1__ = {}));
var __test2__;
(function (__test2__) {
    var classWithPublicPrivate = (function () {
        function classWithPublicPrivate(one, two) {
            this.one = one;
            this.two = two;
        }
        return classWithPublicPrivate;
    })();
    __test2__.classWithPublicPrivate = classWithPublicPrivate;
    var x7 = new classWithPublicPrivate(1, "a");
    ;
    __test2__.__val__x7 = x7;
})(__test2__ || (__test2__ = {}));
__test2__.__val__x7 = __test1__.__val__obj4;
