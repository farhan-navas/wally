describe("Navigation - Not Logged In", () => {
  it("Should navigate to the plans page", () => {
    // start from the index page
    cy.visit("/");

    // find link with an href attribute containing "plans" and click it
    cy.get('a[href*="plans"]').click({ multiple: true });

    // new url should include "/about"
    cy.url().should("include", "/plans");

    // The new page should contain an h1 with "About"
    cy.get("h2").contains("Pricing");
  });

  it("Should navigate to the sign-in page", () => {
    // start from the index page
    cy.visit("/");

    // find button containing "sign-in" and click it
    cy.contains("button", "Sign In").click();

    // new url should include "/sign-in"
    cy.url().should("include", "/sign-in");

    // The new page should contain an h1 with "About"
    cy.get(".cl-headerTitle").contains("Sign in to Wally");

    // Should contain a form with email input field
    cy.get("form").should("exist");

    // Should contain NextAuth providers buttons
    cy.get(".cl-socialButtonsIconButton__apple").should("exist");
    cy.get(".cl-socialButtonsIconButton__google").should("exist");
    cy.get(".cl-socialButtonsIconButton__microsoft").should("exist");
  });
});
