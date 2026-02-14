/// <reference types="cypress" />

describe('Navigation', () => {
    const TEST_EMAIL = 'staff1@gmail.com';
    const TEST_PASSWORD = 'staff123';

    beforeEach(() => {
        cy.login(TEST_EMAIL, TEST_PASSWORD);
        cy.visit('/');
    });

    // ─── Sidebar Rendering ─────────────────────────────────

    it('renders the sidebar with navigation links', () => {
        // Check for common nav items
        cy.contains('Dashboard').should('be.visible');
    });

    // ─── Page Navigation ───────────────────────────────────

    it('navigates to Dashboard', () => {
        cy.visit('/');
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('navigates to App Orders', () => {
        cy.visit('/app-orders');
        cy.url().should('include', '/app-orders');
    });

    it('navigates to Manual Order', () => {
        cy.visit('/manual-order');
        cy.url().should('include', '/manual-order');
    });

    it('navigates to Order History', () => {
        cy.visit('/order-history');
        cy.url().should('include', '/order-history');
    });

    it('navigates to Inventory', () => {
        cy.visit('/inventory');
        cy.url().should('include', '/inventory');
    });

    it('navigates to Wallet', () => {
        cy.visit('/wallet');
        cy.url().should('include', '/wallet');
    });

    it('navigates to Reports', () => {
        cy.visit('/reports');
        cy.url().should('include', '/reports');
    });

    it('navigates to Settings', () => {
        cy.visit('/settings');
        cy.url().should('include', '/settings');
    });
});
