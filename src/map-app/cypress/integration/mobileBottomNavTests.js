describe("Test bottom navigation options", ()=>{

    //Mobile application tests
    it("Mobile user opens weather tab", ()=>{

        cy.visit("/");
        cy.viewport('iphone-5');
        cy.findByRole('button', {  name: /tutustu lumitilanteeseen/i}).click();
        cy.findByRole('button', {  name: /sää/i}).click();
        cy.findByText(/toissapäivänä/i).should("be.visible");
        cy.findByText(/eilen/i).should("be.visible");
        cy.findByText(/nyt/i).should("be.visible");
        cy.findByRole('button', {  name: /previous/i}).click();
        cy.findByRole('button', {  name: /previous/i}).click();
        cy.findByRole('button', {  name: /next/i}).click();
        //cy.get('[variant="contained"]').click();
        //cy.findByRole('heading', {  name: /lähipäivien sää/i}).should("be.visible");
        //cy.findByRole('button', {  name: /next/i}).click();
        //cy.findByRole('heading', {  name: /talven säähavainnot/i}).should("be.visible");
      });
    
      it("Mobile user opens selitteet tab", ()=>{
  
        cy.visit("/");
        cy.viewport('iphone-5');
        cy.findByRole('button', {  name: /tutustu lumitilanteeseen/i}).click();
        cy.findByRole('button', {  name: /selitteet/i}).click();
        cy.get('.snow_tab').scrollTo('bottom');
        cy.findByRole('heading', {  name: /saturoitunut lumi/i}).should("be.visible");
      });
});
  
