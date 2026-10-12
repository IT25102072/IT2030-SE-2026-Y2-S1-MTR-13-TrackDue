package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String type; // FEEDBACK, SUGGESTION, COMPLAINT

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String status; // SUBMITTED, REVIEWED, ACTIONED

    private LocalDateTime createdAt;

    public Feedback() {}

    public Feedback(Long id, Long userId, String userName, String type, Integer rating, String message, String status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.type = type;
        this.rating = rating;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static FeedbackBuilder builder() {
        return new FeedbackBuilder();
    }

    public static class FeedbackBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private String type;
        private Integer rating;
        private String message;
        private String status;
        private LocalDateTime createdAt;

        public FeedbackBuilder id(Long id) { this.id = id; return this; }
        public FeedbackBuilder userId(Long userId) { this.userId = userId; return this; }
        public FeedbackBuilder userName(String userName) { this.userName = userName; return this; }
        public FeedbackBuilder type(String type) { this.type = type; return this; }
        public FeedbackBuilder rating(Integer rating) { this.rating = rating; return this; }
        public FeedbackBuilder message(String message) { this.message = message; return this; }
        public FeedbackBuilder status(String status) { this.status = status; return this; }
        public FeedbackBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Feedback build() {
            return new Feedback(id, userId, userName, type, rating, message, status, createdAt);
        }
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "SUBMITTED";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
