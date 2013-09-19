///<reference path="runnerbase.ts" />
///<reference path="compiler/runner.ts" />
///<reference path="fourslash/fsrunner.ts" />
///<reference path="rwc/runner.ts" />
///<reference path="projects/runner.ts" />
///<reference path="unittest/unittestrunner.ts" />

class RunnerFactory {
    private runners = {};

    public addTest(name: string) {
        var normalizedName = name.replace(/\\/g, "/"); // normalize slashes so either kind can be used on the command line
        if (/tests\/cases\/compiler/.test(normalizedName)) {
            this.runners['compiler'] = this.runners['compiler'] || new CompilerBaselineRunner();
            this.runners['compiler'].addTest(Harness.userSpecifiedroot + name);
        } else if (/tests\/cases\/conformance/.test(normalizedName)) {
            this.runners['conformance'] = this.runners['conformance'] || new CompilerBaselineRunner();
            this.runners['conformance'].addTest(Harness.userSpecifiedroot + name);
        } else if (/tests\/cases\/fourslash/.test(normalizedName)) {
            this.runners['fourslash'] = this.runners['fourslash'] || new FourslashRunner();
            this.runners['fourslash'].addTest(Harness.userSpecifiedroot + name);
        } else if (/tests\/cases\/fourslash\/generated/.test(normalizedName)) {
            this.runners['fourslash-generated'] = this.runners['fourslash-generated'] || new GeneratedFourslashRunner();
            this.runners['fourslash-generated'].addTest(Harness.userSpecifiedroot + name);
        } else if (/tests\/cases\/rwc/.test(normalizedName)) {
            this.runners['rwc'] = this.runners['rwc'] || new RWCRunner();
            this.runners['rwc'].addTest(Harness.userSpecifiedroot + name);
        } else {
            this.runners['unitTestRunner'] = this.runners['unitTestRunner'] || new UnitTestRunner();
            this.runners['unitTestRunner'].addTest(Harness.userSpecifiedroot + name);
        }
    }

    public getRunners() {
        var runners: RunnerBase[] = [];
        for (var p in this.runners) {
            runners.push(this.runners[p]);
        }
        return runners;
    }
}
