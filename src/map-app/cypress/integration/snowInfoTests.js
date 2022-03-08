// eslint-disable-next-line no-undef
describe("Snow information", () => {

  const email = "test@test.fi";
  const password = "testi";

  //Desktop tests

  // eslint-disable-next-line no-undef
  it("Ski resort employee updates main snow type of a segment",() => {

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i },{timeout: 15000}).should("be.visible");

    cy.findByRole("region", {name: /map/i}).click(200, 300);
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.findByRole("button", {  name: /lisää/i}).click();
    cy.findByRole("option", {  name: /ensisijainen/i}).click();
    cy.findByRole("option", {  name: /sohjo/i}).click();
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.findByText(/sohjo/i).should("be.visible");

  });

  it("Ski resort employee updates main and secondary snow type of a segment",() => {

    cy.visit("/");
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i },{timeout: 15000}).should("be.visible");

    cy.findByRole("region", {name: /map/i}).click(500, 500);
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.findByRole("button", {  name: /lisää/i}).click();
    cy.findByRole("option", {  name: /ensisijainen/i}).click();
    cy.findByRole("option", {  name: /tuulen pieksemä lumi/i}).click();
    cy.findByRole("button", {  name: /lisää/i}).click();
    cy.findByRole("option", {  name: /toissijainen/i}).click();
    cy.findByRole("option", {  name: /ohut korppu/i}).click();
    cy.get("[placeholder=\"Kirjoita...\"]").type("Hello world");
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.findByText(/tuulen pieksemä lumi/i).should("be.visible");
    cy.findByText(/ohut korppu/i).should("be.visible");
    cy.findByText(/Hello world/i).should("be.visible");

  });


  it("Refresh page and do login",() => {

    cy.reload();
    cy.findByRole("button", {  name: /openloginwindow/i}).click();
    cy.findByRole("textbox", {  name: /email/i}).type(email);
    cy.findByLabelText(/salasana/i).type(password);
    cy.findByRole("button", { name: /kirjaudu/i }).click();
    cy.findByRole("button", { name: /hallitse/i }, {timeout: 15000}).should("be.visible");
  });

  //Remove all snow data here!
  it("Ski resort employee removes snow information",() => {

    cy.findByRole("region", {name: /map/i}).click(200, 300);
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.get("#deleteSnowType").click();
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.get("[aria-label=\"close\"]").click();

    cy.findByRole("region", {name: /map/i}).click(500, 500);
    cy.findByRole("button", {  name: /päivitä/i}).click();
    cy.get("#deleteSnowType").click();
    cy.get("#deleteSnowType").click();
    cy.get("[placeholder=\"Kirjoita...\"]").clear();
    cy.findByRole("button", {  name: /päivitä/i}).click();
    
    cy.findByText(/tuulen pieksemä lumi/i).should("not.exist");
    cy.findByText(/ohut korppu/i).should("not.exist");
    cy.findByText(/Hello world/i).should("not.exist");
  
  });


});