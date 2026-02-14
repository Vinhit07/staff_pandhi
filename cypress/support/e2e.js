// ***********************************************************
// This file is loaded automatically before every e2e test.
// It imports custom commands and sets up global hooks.
// ***********************************************************

import './commands';

// Clear localStorage before each test for a clean slate
beforeEach(() => {
    cy.window().then((win) => {
        win.localStorage.clear();
    });
});
