describe("Login as administrator and operator", ()=>{

  it("Administrator login and get access to user managing tab", ()=>{
    const email = "test@test.fi";
    const password = "testi";

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i },{timeout: 15000}).click();
    cy.findByRole("button", {  name: /käyttäjät/i}).click();
    cy.findByText(/lisää käyttäjä/i).should("be.visible");

    
  });

  it("Operator login and doesn't have admin rights", ()=> {
    const email = "operator@operator.fi";
    const password = "operator";

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i },{timeout: 15000}).click();
    cy.findByRole("button", {  name: /käyttäjät/i}).click();
    cy.findByRole("heading", { name: /käyttäjähallinta vaatii admin-oikeudet/i });
  });

});
