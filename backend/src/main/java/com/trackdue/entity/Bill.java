package com.trackdue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String billName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // Electricity, Water, Internet, Software, Rent, Insurance, Other

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String status; // PENDING, PAID, OVERDUE, CANCELLED

    private String recurringPattern; // NONE, MONTHLY, QUARTERLY, ANNUALLY

    @Column(columnDefinition = "LONGTEXT")
    private String receiptUrl;

    private LocalDate paidDate;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Bill() {}

    public Bill(Long id, String billName, String description, String category, BigDecimal amount, LocalDate dueDate, String status, String recurringPattern, Long createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.billName = billName;
        this.description = description;
        this.category = category;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
        this.recurringPattern = recurringPattern;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static BillBuilder builder() {
        return new BillBuilder();
    }

    public static class BillBuilder {
        private Long id;
        private String billName;
        private String description;
        private String category;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String status;
        private String recurringPattern;
        private Long createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public BillBuilder id(Long id) { this.id = id; return this; }
        public BillBuilder billName(String billName) { this.billName = billName; return this; }
        public BillBuilder description(String description) { this.description = description; return this; }
        public BillBuilder category(String category) { this.category = category; return this; }
        public BillBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public BillBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public BillBuilder status(String status) { this.status = status; return this; }
        public BillBuilder recurringPattern(String recurringPattern) { this.recurringPattern = recurringPattern; return this; }
        public BillBuilder createdBy(Long createdBy) { this.createdBy = createdBy; return this; }
        public BillBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BillBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Bill build() {
            return new Bill(id, billName, description, category, amount, dueDate, status, recurringPattern, createdBy, createdAt, updatedAt);
        }
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (recurringPattern == null) {
            recurringPattern = "NONE";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBillName() { return billName; }
    public void setBillName(String billName) { this.billName = billName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRecurringPattern() { return recurringPattern; }
    public void setRecurringPattern(String recurringPattern) { this.recurringPattern = recurringPattern; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
}
