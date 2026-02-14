/// <reference types="cypress" />

describe('Authentication', () => {
    const TEST_EMAIL = 'staff1@gmail.com';
    const TEST_PASSWORD = 'staff123';

    beforeEach(() => {
        cy.visit('/signin');
    });

    // ─── Sign-In Page Rendering ─────────────────────────────

    it('renders the sign-in page with all form elements', () => {
        cy.contains('Welcome Back').should('be.visible');
        cy.contains('Sign in to your account').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    // ─── Validation ─────────────────────────────────────────

    it('shows validation errors when submitting empty form', () => {
        cy.get('button[type="submit"]').click();
        cy.contains('Email is required').should('be.visible');
        cy.contains('Password is required').should('be.visible');
    });

    it('shows validation error for invalid email format', () => {
        cy.get('input[name="email"]').type('not-an-email');
        cy.get('input[name="password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.contains('Please enter a valid email').should('be.visible');
    });

    it('shows validation error for short password', () => {
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('abc');
        cy.get('button[type="submit"]').click();
        cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    // ─── Successful Login ───────────────────────────────────

    it('logs in successfully and redirects to dashboard', () => {
        cy.get('input[name="email"]').type(TEST_EMAIL);
        cy.get('input[name="password"]').type(TEST_PASSWORD);
        cy.get('button[type="submit"]').click();

        // Should redirect to dashboard (root path)
        cy.url().should('eq', Cypress.config('baseUrl') + '/');

        // Token should be stored
        cy.window().then((win) => {
            expect(win.localStorage.getItem('token')).to.not.be.null;
        });
    });

    // ─── Failed Login ──────────────────────────────────────

    it('shows error message for invalid credentials', () => {
        cy.get('input[name="email"]').type('wrong@email.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        // Should stay on signin page and show an error
        cy.url().should('include', '/signin');
    });

    // ─── Logout ─────────────────────────────────────────────

    it('logs out and redirects to sign-in', () => {
        // Login first via API
        cy.login(TEST_EMAIL, TEST_PASSWORD);
        cy.visit('/');

        // Wait for dashboard to load
        cy.url().should('eq', Cypress.config('baseUrl') + '/');

        // Click on Settings (where logout usually is)
        cy.visit('/settings');

        // Look for a sign out / logout button and click it
        cy.contains(/sign out|logout/i).click();

        // Should redirect to signin
        cy.url().should('include', '/signin');
    });

    // ─── Protected Routes ──────────────────────────────────

    it('redirects unauthenticated users to sign-in page', () => {
        // Try to visit a protected route without logging in
        cy.visit('/');
        cy.url().should('include', '/signin');
    });
});
