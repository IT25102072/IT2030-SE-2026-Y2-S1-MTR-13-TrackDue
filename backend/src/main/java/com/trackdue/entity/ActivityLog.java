package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, STATUS_CHANGE

    @Column(nullable = false)
    private String module; // USER, BILL, EVENT, REMINDER, NOTIFICATION, SUPPORT, FEEDBACK

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;

    public ActivityLog() {}

    public ActivityLog(Long id, Long userId, String userName, String action, String module, Long entityId, String description, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.module = module;
        this.entityId = entityId;
        this.description = description;
        this.createdAt = createdAt;
    }

    public static ActivityLogBuilder builder() {
        return new ActivityLogBuilder();
    }

    public static class ActivityLogBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private String action;
        private String module;
        private Long entityId;
        private String description;
        private LocalDateTime createdAt;

        public ActivityLogBuilder id(Long id) { this.id = id; return this; }
        public ActivityLogBuilder userId(Long userId) { this.userId = userId; return this; }
        public ActivityLogBuilder userName(String userName) { this.userName = userName; return this; }
        public ActivityLogBuilder action(String action) { this.action = action; return this; }
        public ActivityLogBuilder module(String module) { this.module = module; return this; }
        public ActivityLogBuilder entityId(Long entityId) { this.entityId = entityId; return this; }
        public ActivityLogBuilder description(String description) { this.description = description; return this; }
        public ActivityLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ActivityLog build() {
            return new ActivityLog(id, userId, userName, action, module, entityId, description, createdAt);
        }
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
