describe('Guest House Quick Test', () => {
  it('opens booking page', () => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:5173/admin',{

      onBeforeLoad(win) {
        win.localStorage.setItem("adminToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZhcnphbnJhc2hpZDIwMDRAZ21haWwuY29tIiwiaWF0IjoxNzUwOTIyNjg0fQ.2ajiy7CAVcrTRO0SqWGtUUDnAPJuFi3_YNp4NwFa7rU");
      }
    });
    cy.get('body').should('be.visible');
    cy.contains("Booking Requests").click();
  })
})