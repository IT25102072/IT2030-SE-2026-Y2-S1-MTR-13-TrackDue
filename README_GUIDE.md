# MEMBER 3: Manikkaarachchi M.A.D.N.H. (IT25102067)
**Major Function 6.3:** Event Management
**Branch Name:** eature/event-management-it25102067

## Backend Files in this Folder:
- ackend/src/main/java/com/trackdue/entity/Event.java
- ackend/src/main/java/com/trackdue/repository/EventRepository.java
- ackend/src/main/java/com/trackdue/service/EventService.java
- ackend/src/main/java/com/trackdue/controller/EventController.java

## Frontend Files & Sections:
- rontend/pages/app.html (Events section #view-events, Calendar view container, Event Modal #modal-event)
- rontend/assets/js/app.js (Functions: loadEvents(), 
enderEvents(), saveEvent(), editEvent(), deleteEvent(), 
enderCalendar())
- rontend/services/api.js (API endpoints: /api/events, /api/events/{id})

## CRUD Operations to Explain at Viva:
- **Create:** Creating new corporate/personal events with date, location, priority.
- **Read:** Listing upcoming events and rendering interactive month calendar view.
- **Update:** Rescheduling events, modifying venue/attendees/notes.
- **Delete:** Removing cancelled events from system.
# MEMBER 2: Rathnayake R.M.C.S. (IT25102072)
**Major Function 6.2:** Bill Management
**Branch Name:** eature/bill-management-it25102072

## Backend Files in this Folder:
- ackend/src/main/java/com/trackdue/entity/Bill.java
- ackend/src/main/java/com/trackdue/repository/BillRepository.java
- ackend/src/main/java/com/trackdue/service/BillService.java
- ackend/src/main/java/com/trackdue/controller/BillController.java

## Frontend Files & Sections:
- rontend/pages/app.html (Bills section #view-bills, Bill Add/Edit Modal #modal-bill, Payment settlement modal)
- rontend/assets/js/app.js (Functions: loadBills(), 
enderBills(), saveBill(), editBill(), deleteBill(), settleBillPayment())
- rontend/services/api.js (API endpoints: /api/bills, /api/bills/{id}, /api/bills/category/{category})

## CRUD Operations to Explain at Viva:
- **Create:** Adding a new bill with amount, category, recurrence, due date.
- **Read:** Viewing bill cards/table, overdue status badges, category filters.
- **Update:** Editing bill details, changing amount, marking bill as Paid/Settled.
- **Delete:** Deleting obsolete or cancelled bills.
