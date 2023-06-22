describe('Firebase UI for web', () => {
  it('loads web example app', () => {
    cy.visit('https://fir-ui-demo-84a6c.firebaseapp.com/');
    cy.wait(2000);
    cy.percySnapshot();
  })
})