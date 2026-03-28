describe('Guest House Quick Test', () => {
  it('opens booking page', () => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:5173/',{

      onBeforeLoad(win) {
        win.localStorage.setItem("guestToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjBkOGFkZWU5MTRjZTNhNzMzMTcyYyIsImlhdCI6MTc2MTkyMjIxNH0.OPMOgDvvGn9KjArYFPWN7g1B_3bhwDsvJbvDg2zXKYg");
      }
    });
    cy.get('body').should('be.visible');
    cy.get(".md\\:block")
      .contains("Regular")
      .parents("[class*='group']")
      .find("button")
      .contains("Book Now")
      .click();
    cy.wait(1000);
    
    // 2. fill dates
    cy.contains("Check-in")
      .parent()
      .find("input")
      .type("12/20/2025");   // React DatePicker expects MM/DD/YYYY

    // fill check-out date
    cy.contains("Check-out")
      .parent()
      .find("input")
      .type("12/22/2025");
    
    // cy.contains("Guests & Rooms").parent().find("button").click();

// Open Guests & Rooms dropdown
    cy.contains("Guests & Rooms")
      .parent()
      .find("button")
      .click();

    // Increase Guests by exactly 1 → from 1 to 2
    cy.contains("Guests")
      .parent()
      .find("button")
      .eq(2)   // 0 = -, 1 = count, 2 = +
      .click();

    // Assert it shows "2 Guests, 1 Rooms"
    cy.contains("Guests & Rooms")
      .parent()
      .find("button")
      .should("contain", "2 Guests");

    // (Optional) ensure rooms stayed at 1
    cy.contains("Guests & Rooms")
      .parent()
      .find("button")
      .should("contain", "1 Rooms");


    // Dropdown should update
    cy.contains("Guests & Rooms")
      .parent()
      .find("button")
      .should("contain", "2 Guests");
    cy.contains('Check Availability').click();

    cy.wait(2000);

    cy.contains("Book").click();

    cy.contains("Booking Category")
      .parent()
      .find("select")
      .select("Employee"); 
    cy.get("input[placeholder='Full Name']").type("John Doe");

    // Gender
    cy.get("select").eq(1).select("Male");

    // Age
    cy.get("input[placeholder='Age']").type("30");

    // Relation
    cy.get("select").eq(2).select("Friend");
    // Contact Number
    cy.get("input[placeholder='Contact Number']")
      .type("9876543210");
    
    cy.contains("Send Request").click();

    cy.wait(2000);
    cy.contains("Booking created successfully!").should("exist");

    cy.contains("Your Bookings").click();
    cy.contains("My Bookings").should("exist");

  });
});