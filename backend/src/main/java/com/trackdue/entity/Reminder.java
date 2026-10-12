package com.trackdue.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long billId;

    private Long eventId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate reminderDate;

    private LocalTime reminderTime;

    private String recurrenceType; // ONCE, DAILY, WEEKLY, MONTHLY

    @Column(nullable = false)
    private String status; // ACTIVE, TRIGGERED, DISMISSED, CANCELLED

    private LocalDateTime createdAt;

    public Reminder() {}

    public Reminder(Long id, Long billId, Long eventId, Long userId, LocalDate reminderDate, LocalTime reminderTime, String recurrenceType, String status, LocalDateTime createdAt) {
        this.id = id;
        this.billId = billId;
        this.eventId = eventId;
        this.userId = userId;
        this.reminderDate = reminderDate;
        this.reminderTime = reminderTime;
        this.recurrenceType = recurrenceType;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static ReminderBuilder builder() {
        return new ReminderBuilder();
    }

    public static class ReminderBuilder {
        private Long id;
        private Long billId;
        private Long eventId;
        private Long userId;
        private LocalDate reminderDate;
        private LocalTime reminderTime;
        private String recurrenceType;
        private String status;
        private LocalDateTime createdAt;

        public ReminderBuilder id(Long id) { this.id = id; return this; }
        public ReminderBuilder billId(Long billId) { this.billId = billId; return this; }
        public ReminderBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public ReminderBuilder userId(Long userId) { this.userId = userId; return this; }
        public ReminderBuilder reminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; return this; }
        public ReminderBuilder reminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; return this; }
        public ReminderBuilder recurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; return this; }
        public ReminderBuilder status(String status) { this.status = status; return this; }
        public ReminderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Reminder build() {
            return new Reminder(id, billId, eventId, userId, reminderDate, reminderTime, recurrenceType, status, createdAt);
        }
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
        if (recurrenceType == null) {
            recurrenceType = "ONCE";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }
    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }
    public String getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(String recurrenceType) { this.recurrenceType = recurrenceType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
