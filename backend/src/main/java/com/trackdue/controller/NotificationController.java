package com.trackdue.controller;

import com.trackdue.entity.Notification;
import com.trackdue.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.create(notification));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcast(@RequestBody Map<String, String> payload) {
        String title = payload.getOrDefault("title", "System Announcement");
        String message = payload.getOrDefault("message", "");
        int count = notificationService.broadcastToAllUsers(title, message);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Broadcast sent successfully to " + count + " users",
                "recipientCount", count
        ));
    }

    @PostMapping("/dispatch-test")
    public ResponseEntity<Notification> dispatchTest(@RequestBody Map<String, Object> payload) {
        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : 1L;
        Long reminderId = payload.get("reminderId") != null ? Long.valueOf(payload.get("reminderId").toString()) : null;
        String title = (String) payload.getOrDefault("title", "Reminder Notification Alert");
        String message = (String) payload.getOrDefault("message", "This is an automated reminder notification.");
        String channel = (String) payload.getOrDefault("channel", "IN_APP");
        Notification notification = notificationService.sendNotification(userId, reminderId, title, message, channel);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> update(@PathVariable Long id, @RequestBody Notification updated) {
        return ResponseEntity.ok(notificationService.update(id, updated));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
