// eslint-disable-next-line no-undef
describe("Login", () => {


  // eslint-disable-next-line no-undef
  it("Ski resort employee logs in",() => {

    const email = "test@test.fi";
    const password = "testi";

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i }).should("be.visible");

    //User login
    //

  });
});