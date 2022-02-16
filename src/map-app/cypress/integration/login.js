describe("Login", () => {



  it("Ski resort employee logs in",() => {

    const email = "test@test.fi";
    const password = "testi";

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i },{timeout: 15000}).should("be.visible");

    //User login
    //

  });
});