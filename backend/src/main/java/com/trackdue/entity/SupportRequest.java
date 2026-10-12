package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_requests")
public class SupportRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String subject;

    private String category; // Technical Issue, Account Issue, Bill Inquiry, Event Question, Other

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Column(columnDefinition = "TEXT")
    private String adminResponse;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SupportRequest() {}

    public SupportRequest(Long id, Long userId, String userName, String subject, String category, String message, String status, String adminResponse, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.subject = subject;
        this.category = category;
        this.message = message;
        this.status = status;
        this.adminResponse = adminResponse;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SupportRequestBuilder builder() {
        return new SupportRequestBuilder();
    }

    public static class SupportRequestBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private String subject;
        private String category;
        private String message;
        private String status;
        private String adminResponse;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SupportRequestBuilder id(Long id) { this.id = id; return this; }
        public SupportRequestBuilder userId(Long userId) { this.userId = userId; return this; }
        public SupportRequestBuilder userName(String userName) { this.userName = userName; return this; }
        public SupportRequestBuilder subject(String subject) { this.subject = subject; return this; }
        public SupportRequestBuilder category(String category) { this.category = category; return this; }
        public SupportRequestBuilder message(String message) { this.message = message; return this; }
        public SupportRequestBuilder status(String status) { this.status = status; return this; }
        public SupportRequestBuilder adminResponse(String adminResponse) { this.adminResponse = adminResponse; return this; }
        public SupportRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public SupportRequestBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public SupportRequest build() {
            return new SupportRequest(id, userId, userName, subject, category, message, status, adminResponse, createdAt, updatedAt);
        }
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "OPEN";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
