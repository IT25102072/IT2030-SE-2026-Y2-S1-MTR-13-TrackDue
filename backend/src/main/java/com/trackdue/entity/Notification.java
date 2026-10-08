package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long reminderId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String channel; // IN_APP, EMAIL, SMS

    @Column(nullable = false)
    private String status; // PENDING, SENT, READ, FAILED

    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private String failureReason;

    public Notification() {}

    public Notification(Long id, Long userId, Long reminderId, String title, String message, String channel, String status, LocalDateTime sentAt, LocalDateTime readAt, String failureReason) {
        this.id = id;
        this.userId = userId;
        this.reminderId = reminderId;
        this.title = title;
        this.message = message;
        this.channel = channel;
        this.status = status;
        this.sentAt = sentAt;
        this.readAt = readAt;
        this.failureReason = failureReason;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private Long id;
        private Long userId;
        private Long reminderId;
        private String title;
        private String message;
        private String channel;
        private String status;
        private LocalDateTime sentAt;
        private LocalDateTime readAt;
        private String failureReason;

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder userId(Long userId) { this.userId = userId; return this; }
        public NotificationBuilder reminderId(Long reminderId) { this.reminderId = reminderId; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder channel(String channel) { this.channel = channel; return this; }
        public NotificationBuilder status(String status) { this.status = status; return this; }
        public NotificationBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public NotificationBuilder readAt(LocalDateTime readAt) { this.readAt = readAt; return this; }
        public NotificationBuilder failureReason(String failureReason) { this.failureReason = failureReason; return this; }

        public Notification build() {
            return new Notification(id, userId, reminderId, title, message, channel, status, sentAt, readAt, failureReason);
        }
    }

    @PrePersist
    public void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "SENT";
        }
        if (channel == null) {
            channel = "IN_APP";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getReminderId() { return reminderId; }
    public void setReminderId(Long reminderId) { this.reminderId = reminderId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
}
