function importTest(name, path) {
    describe(name, function() {
        require(path);
    });
}

describe("Running all tests ...", function() {
    importTest("Uber client general tests", './general');
    importTest("Localization tests", './localization');
    importTest("OAuth2 authorization methods", './oauth');
    importTest("OAuth2 authorization methods (Async)", './oauthAsync');
    importTest("/Estimates", './estimates');
    importTest("/Estimates (Async)", './estimatesAsync');
    importTest("/Payment-Methods", './payment-methods');
    importTest("/Payment-Methods (Async)", './payment-methodsAsync');
    importTest("/Places", './places');
    importTest("/Places (Async)", './placesAsync');
    importTest("/Products", './products');
    importTest("/Products (Async)", './productsAsync');
    importTest("/Reminders", './reminders');
    importTest("/Reminders (Async)", './remindersAsync');
    importTest("/Requests", './requests');
    importTest("/Requests (Async)", './requestsAsync');
    importTest("/User", './user');
    importTest("/User (Async)", './userAsync');
    importTest("Deprecated methods", './deprecated');
});
