-- ============================================================================
-- TRACKDUE - DATABASE DEFINITION LANGUAGE (DDL) SCRIPT
-- Module: Data Management / Database Design & Development (DDD)
-- DBMS: MySQL 8.0+
-- Purpose: Schema, Tables, Constraints, Primary Keys & Foreign Keys
-- ============================================================================

CREATE DATABASE IF NOT EXISTS trackdue_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE trackdue_db;

-- ----------------------------------------------------------------------------
-- Drop tables in reverse order of foreign key dependencies
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS support_requests;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS notification_templates;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 1. USERS TABLE (User Authentication & Profiles)
-- ============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'GENERAL_EMPLOYEE',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT chk_user_role CHECK (role IN ('GENERAL_EMPLOYEE', 'FINANCE_OFFICER', 'OPERATIONS_MANAGER', 'SYSTEM_ADMINISTRATOR'))
) ENGINE=InnoDB;

-- ============================================================================
-- 2. BILLS TABLE (Utility & Corporate Bill Tracking)
-- ============================================================================
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_name VARCHAR(150) NOT NULL,
    vendor VARCHAR(150) NOT NULL,
    reference_no VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    recurring_pattern VARCHAR(30) DEFAULT 'NONE',
    receipt_url LONGTEXT,
    paid_date DATE,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_bill_amount CHECK (amount > 0),
    CONSTRAINT chk_bill_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    CONSTRAINT chk_bill_recurrence CHECK (recurring_pattern IN ('NONE', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'))
) ENGINE=InnoDB;

-- ============================================================================
-- 3. EVENTS TABLE (Corporate Events & Attendance)
-- ============================================================================
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'UPCOMING',
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_event_status CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED'))
) ENGINE=InnoDB;

-- ============================================================================
-- 4. REMINDERS TABLE (Schedules for Bills & Events)
-- ============================================================================
CREATE TABLE reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    bill_id BIGINT,
    event_id BIGINT,
    user_id BIGINT NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    recurrence_type VARCHAR(30) DEFAULT 'ONCE',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminders_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminders_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT chk_reminder_status CHECK (status IN ('ACTIVE', 'TRIGGERED', 'DISMISSED', 'CANCELLED')),
    CONSTRAINT chk_reminder_recurrence CHECK (recurrence_type IN ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'))
) ENGINE=InnoDB;

-- ============================================================================
-- 5. NOTIFICATIONS TABLE (Sent Alerts via Email / SMS / In-App)
-- ============================================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reminder_id BIGINT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at DATETIME,
    read_at DATETIME,
    failure_reason VARCHAR(255),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_reminder FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE SET NULL,
    CONSTRAINT chk_notif_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS')),
    CONSTRAINT chk_notif_status CHECK (status IN ('PENDING', 'SENT', 'READ', 'FAILED'))
) ENGINE=InnoDB;

-- ============================================================================
-- 6. NOTIFICATION TEMPLATES TABLE (Custom Message Templates)
-- ============================================================================
CREATE TABLE notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    user_id BIGINT,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_template_type CHECK (type IN ('BILL', 'EVENT'))
) ENGINE=InnoDB;

-- ============================================================================
-- 7. SUPPORT REQUESTS TABLE (Customer Support Tickets)
-- ============================================================================
CREATE TABLE support_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(150),
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_support_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
) ENGINE=InnoDB;

-- ============================================================================
-- 8. FEEDBACK TABLE (User Ratings & Reviews)
-- ============================================================================
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(150),
    type VARCHAR(30) NOT NULL DEFAULT 'FEEDBACK',
    rating INT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_feedback_type CHECK (type IN ('FEEDBACK', 'SUGGESTION', 'COMPLAINT')),
    CONSTRAINT chk_feedback_status CHECK (status IN ('SUBMITTED', 'REVIEWED', 'ACTIONED'))
) ENGINE=InnoDB;

-- ============================================================================
-- 9. ACTIVITY LOGS TABLE (Audit Trail)
-- ============================================================================
CREATE TABLE activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(150),
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
