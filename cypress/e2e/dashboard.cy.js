/// <reference types="cypress" />

describe('Dashboard', () => {
    const TEST_EMAIL = 'staff1@gmail.com';
    const TEST_PASSWORD = 'staff123';

    beforeEach(() => {
        cy.login(TEST_EMAIL, TEST_PASSWORD);
        cy.visit('/');
    });

    // ─── Dashboard Loading ─────────────────────────────────

    it('loads the dashboard successfully', () => {
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
        // Dashboard should not show sign-in form
        cy.get('input[name="email"]').should('not.exist');
    });

    it('displays dashboard content sections', () => {
        // The page should contain some dashboard content
        // (stats cards, charts, recent orders etc.)
        cy.get('body').should('not.be.empty');

        // Should have at least a heading or welcome text
        cy.contains(/dashboard|welcome|overview|today/i).should('exist');
    });

    it('displays stats cards or summary data', () => {
        // Dashboard typically has stat/metric cards
        // Check for the presence of card-like containers
        cy.get('[class*="card"], [class*="Card"], [class*="stat"], [class*="Stat"]')
            .should('have.length.greaterThan', 0);
    });
});
