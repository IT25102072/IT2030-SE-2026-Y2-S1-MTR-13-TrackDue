# MEMBER 5: Amarasingha A.D.P.V. (IT25102077)
**Major Function 6.5:** Notification Management
**Branch Name:** eature/notification-management-it25102077

## Backend Files in this Folder:
- ackend/src/main/java/com/trackdue/entity/Notification.java
- ackend/src/main/java/com/trackdue/entity/NotificationTemplate.java
- ackend/src/main/java/com/trackdue/repository/NotificationRepository.java
- ackend/src/main/java/com/trackdue/repository/NotificationTemplateRepository.java
- ackend/src/main/java/com/trackdue/service/NotificationService.java
- ackend/src/main/java/com/trackdue/service/NotificationTemplateService.java
- ackend/src/main/java/com/trackdue/controller/NotificationController.java
- ackend/src/main/java/com/trackdue/controller/NotificationTemplateController.java

## Frontend Files & Sections:
- rontend/pages/app.html (Notification Center #view-notifications, Top navbar bell icon dropdown & badge, Template modal)
- rontend/assets/js/app.js (Functions: loadNotifications(), enderNotificationBell(), markAsRead(), saveTemplate())
- rontend/services/api.js (API endpoints: /api/notifications, /api/notifications/mark-read/{id}, /api/templates)

## CRUD Operations to Explain at Viva:
- **Create:** Dispatching in-app alerts and SMS/Email notification logs when reminders trigger.
- **Read:** Viewing unread/read alert history and template list.
- **Update:** Marking notifications as read, editing notification templates and channel preferences.
- **Delete:** Clearing read notifications from notification box.
