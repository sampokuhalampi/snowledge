describe("Test bottom navigation options", ()=>{

    //Desktop application tests
    it("User opens weather tab", ()=>{

      cy.visit("/");
      cy.findByRole('button', {  name: /sää/i}).click();
      cy.findByText(/toissapäivänä/i).should("be.visible");
      cy.findByText(/eilen/i).should("be.visible");
      cy.findByText(/nyt/i).should("be.visible");
      cy.findByRole('button', {  name: /lisätietoja/i}).click();
      cy.findByRole('heading', {  name: /lähipäivien sää/i}).should("be.visible");
      cy.findByRole('heading', {  name: /talven säähavainnot/i}).should("be.visible");
      cy.findByRole('button', {  name: /takaisin/i}).click();
      cy.findByRole('button', {  name: /kartta/i}).click();
    });

    
    it("User opens selitteet tab", ()=>{

      cy.visit("/");
      cy.findByRole('button', {  name: /selitteet/i}).click();
      cy.get('.snow_tab').scrollTo('bottom');
      cy.findByRole('heading', {  name: /sohjo/i}).should("be.visible");
    });

  });
  