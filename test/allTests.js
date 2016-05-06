function importTest(name, path) {
    describe(name, function() {
        require(path);
    });
}

describe("Running all tests ...", function() {
    importTest("Uber client general tests", './general');
    importTest("Localization tests", './localization');
    importTest("OAuth2 authorization methods", './oauth');
    importTest("/Estimates", './estimates');
    importTest("/Payment-Methods", './payment-methods');
    importTest("/Places", './places');
    importTest("/Products", './products');
    importTest("/Reminders", './reminders');
    importTest("/Requests", './requests');
    importTest("/User", './user');
    importTest("Deprecated methods", './deprecated');
});
