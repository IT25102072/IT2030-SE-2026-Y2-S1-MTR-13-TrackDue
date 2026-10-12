# MEMBER 4: Nihashini A. (IT25102080)
**Major Function 6.4:** Reminder Scheduling Management
**Branch Name:** eature/reminder-scheduling-it25102080

## Backend Files in this Folder:
- ackend/src/main/java/com/trackdue/entity/Reminder.java
- ackend/src/main/java/com/trackdue/repository/ReminderRepository.java
- ackend/src/main/java/com/trackdue/service/ReminderService.java
- ackend/src/main/java/com/trackdue/service/ReminderTriggerService.java (Automated engine & cron evaluator)
- ackend/src/main/java/com/trackdue/controller/ReminderController.java

## Frontend Files & Sections:
- rontend/pages/app.html (Reminders section #view-reminders, Reminder Schedule Modal #modal-reminder)
- rontend/assets/js/app.js (Functions: loadReminders(), saveReminder(), 	oggleReminderStatus(), deleteReminder(), 	riggerManualReminderCheck())
- rontend/services/api.js (API endpoints: /api/reminders, /api/reminders/trigger-check)

## CRUD Operations to Explain at Viva:
- **Create:** Configuring custom reminder timing (7 days, 3 days, 1 day before, or due date).
- **Read:** Viewing active schedules, upcoming scheduled alerts, triggered status.
- **Update:** Modifying reminder schedule intervals, toggling active/inactive.
- **Delete:** Removing reminder schedules.
