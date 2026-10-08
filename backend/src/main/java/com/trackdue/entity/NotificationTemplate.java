package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // BILL or EVENT

    private Long userId; // null for SYSTEM_DEFAULT, or specific userId for user override

    @Column(nullable = false)
    private String titleTemplate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageTemplate;

    private LocalDateTime updatedAt;

    public NotificationTemplate() {}

    public NotificationTemplate(Long id, String type, Long userId, String titleTemplate, String messageTemplate, LocalDateTime updatedAt) {
        this.id = id;
        this.type = type;
        this.userId = userId;
        this.titleTemplate = titleTemplate;
        this.messageTemplate = messageTemplate;
        this.updatedAt = updatedAt;
    }

    public static NotificationTemplateBuilder builder() {
        return new NotificationTemplateBuilder();
    }

    public static class NotificationTemplateBuilder {
        private Long id;
        private String type;
        private Long userId;
        private String titleTemplate;
        private String messageTemplate;
        private LocalDateTime updatedAt;

        public NotificationTemplateBuilder id(Long id) { this.id = id; return this; }
        public NotificationTemplateBuilder type(String type) { this.type = type; return this; }
        public NotificationTemplateBuilder userId(Long userId) { this.userId = userId; return this; }
        public NotificationTemplateBuilder titleTemplate(String titleTemplate) { this.titleTemplate = titleTemplate; return this; }
        public NotificationTemplateBuilder messageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; return this; }
        public NotificationTemplateBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public NotificationTemplate build() {
            return new NotificationTemplate(id, type, userId, titleTemplate, messageTemplate, updatedAt);
        }
    }

    @PrePersist
    @PreUpdate
    public void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitleTemplate() { return titleTemplate; }
    public void setTitleTemplate(String titleTemplate) { this.titleTemplate = titleTemplate; }
    public String getMessageTemplate() { return messageTemplate; }
    public void setMessageTemplate(String messageTemplate) { this.messageTemplate = messageTemplate; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
