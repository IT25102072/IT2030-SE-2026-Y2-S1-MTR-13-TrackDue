# MEMBER 6: Koongahagoda K. A. K. D. (IT25102069)
**Major Function 6.6:** Reports, History & Support
**Branch Name:** eature/reports-history-support-it25102069

## Backend Files in this Folder:
- ackend/src/main/java/com/trackdue/entity/ActivityLog.java
- ackend/src/main/java/com/trackdue/entity/Feedback.java
- ackend/src/main/java/com/trackdue/entity/SupportRequest.java
- ackend/src/main/java/com/trackdue/dto/ReportFilterDTO.java
- ackend/src/main/java/com/trackdue/dto/SummaryReportDTO.java
- ackend/src/main/java/com/trackdue/repository/ActivityLogRepository.java
- ackend/src/main/java/com/trackdue/repository/FeedbackRepository.java
- ackend/src/main/java/com/trackdue/repository/SupportRequestRepository.java
- ackend/src/main/java/com/trackdue/service/ReportService.java
- ackend/src/main/java/com/trackdue/service/HistoryService.java
- ackend/src/main/java/com/trackdue/service/SupportService.java
- ackend/src/main/java/com/trackdue/service/FeedbackService.java
- ackend/src/main/java/com/trackdue/controller/ReportController.java
- ackend/src/main/java/com/trackdue/controller/HistoryController.java
- ackend/src/main/java/com/trackdue/controller/SupportController.java
- ackend/src/main/java/com/trackdue/controller/FeedbackController.java

## Frontend Files & Sections:
- rontend/pages/app.html (Sections: #view-reports, #view-history, #view-support, Feedback Modal #modal-feedback)
- rontend/assets/js/app.js (Functions: loadReports(), enderCharts(), loadHistory(), loadSupportTickets(), submitSupportTicket(), submitFeedback())
- rontend/services/api.js (API endpoints: /api/reports/summary, /api/history, /api/support, /api/feedback)

## CRUD Operations to Explain at Viva:
- **Create:** Submitting new support tickets, questions, and user feedback ratings.
- **Read:** Generating monthly financial & event summary reports, audit trail logs.
- **Update:** Updating ticket status (Open/In-Progress/Resolved) and adding admin replies.
- **Delete:** Removing resolved support tickets or obsolete feedback.
