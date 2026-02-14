// ***********************************************
// Custom Cypress Commands for staff_pandhi
// ***********************************************

/**
 * cy.login(email, password)
 * Programmatic login via API — bypasses the UI for faster test setup.
 * Stores the JWT token in localStorage so the app recognizes the session.
 */
Cypress.Commands.add('login', (email, password) => {
    const apiUrl = Cypress.env('API_URL') || 'http://localhost:5500/api';

    cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/staff-signin`,
        body: { email, password },
        failOnStatusCode: false,
    }).then((response) => {
        cy.log(`Login API status: ${response.status}`);
        if (response.status !== 200) {
            throw new Error(`Login failed (${response.status}): ${JSON.stringify(response.body)}`);
        }
        const { token } = response.body;
        window.localStorage.setItem('token', token);

        // Store outlet details if present
        if (response.body.user?.outlet) {
            window.localStorage.setItem(
                'outletDetails',
                JSON.stringify(response.body.user.outlet)
            );
        }
    });
});

/**
 * cy.logout()
 * Clears auth state from localStorage.
 */
Cypress.Commands.add('logout', () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('outletDetails');
});
