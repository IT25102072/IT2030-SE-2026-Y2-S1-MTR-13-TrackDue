-- ============================================================================
-- TRACKDUE - DATA MANIPULATION LANGUAGE (DML) SCRIPT
-- Module: Data Management / Database Design & Development (DDD)
-- DBMS: MySQL 8.0+
-- Purpose: Sample Data Insertion for All Tables & Modules
-- ============================================================================

USE trackdue_db;

-- ----------------------------------------------------------------------------
-- Clear existing data safely
-- ----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE feedback;
TRUNCATE TABLE support_requests;
TRUNCATE TABLE notifications;
TRUNCATE TABLE notification_templates;
TRUNCATE TABLE reminders;
TRUNCATE TABLE events;
TRUNCATE TABLE bills;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. INSERT DATA: USERS
-- ============================================================================
INSERT INTO users (id, first_name, last_name, email, password, phone, role, status, created_at) VALUES
(1, 'System', 'Administrator', 'admin@trackdue.com', '$2a$10$w095tX85y0kL81/4fG6DguZ935Bsp0zHk1g2u7/4j5qVf8.yNlV3m', '+94 11 234 5678', 'SYSTEM_ADMINISTRATOR', 'ACTIVE', '2025-01-01 08:00:00'),
(2, 'Chamath', 'Silva', 'user@trackdue.com', '$2a$10$w095tX85y0kL81/4fG6DguZ935Bsp0zHk1g2u7/4j5qVf8.yNlV3m', '+94 77 123 4567', 'GENERAL_EMPLOYEE', 'ACTIVE', '2025-01-02 09:30:00'),
(3, 'Isuru', 'Deshal', 'isuru2025@gmail.com', '$2a$10$w095tX85y0kL81/4fG6DguZ935Bsp0zHk1g2u7/4j5qVf8.yNlV3m', '+94 75 427 2541', 'GENERAL_EMPLOYEE', 'ACTIVE', '2025-01-05 10:15:00'),
(4, 'Nadeeka', 'Perera', 'nadeeka.p@trackdue.com', '$2a$10$w095tX85y0kL81/4fG6DguZ935Bsp0zHk1g2u7/4j5qVf8.yNlV3m', '+94 71 889 9112', 'FINANCE_OFFICER', 'ACTIVE', '2025-01-10 11:00:00'),
(5, 'Kavinda', 'Fernando', 'kavinda.f@trackdue.com', '$2a$10$w095tX85y0kL81/4fG6DguZ935Bsp0zHk1g2u7/4j5qVf8.yNlV3m', '+94 76 554 3210', 'OPERATIONS_MANAGER', 'ACTIVE', '2025-01-12 14:20:00');

-- ============================================================================
-- 2. INSERT DATA: BILLS
-- ============================================================================
INSERT INTO bills (id, bill_name, vendor, reference_no, description, category, amount, due_date, status, recurring_pattern, receipt_url, paid_date, created_by, created_at) VALUES
(1, 'Office Leased Line Internet', 'Dialog Enterprise', 'REF-DLG-84920', 'Dialog Enterprise high-speed fiber line for head office.', 'Internet', 35000.00, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'PENDING', 'MONTHLY', NULL, NULL, 2, '2025-02-01 09:00:00'),
(2, 'Ceylon Electricity Board Bill', 'Ceylon Electricity Board', 'REF-CEB-39102', 'Monthly commercial utility electricity bill.', 'Electricity', 14500.00, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 'PENDING', 'MONTHLY', NULL, NULL, 2, '2025-02-01 09:15:00'),
(3, 'Cloud AWS Infrastructure', 'Amazon Web Services', 'REF-AWS-10948', 'Production database and compute instances.', 'Software', 58200.00, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 'PENDING', 'MONTHLY', NULL, NULL, 2, '2025-02-01 09:30:00'),
(4, 'National Water Supply Bill', 'NWSDB', 'REF-WAT-00291', 'Head office water utility consumption.', 'Water', 4200.00, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'OVERDUE', 'MONTHLY', NULL, NULL, 4, '2025-01-15 10:00:00'),
(5, 'Corporate Office Rent - Jan', 'Access Real Estate Ltd', 'REF-RNT-202501', 'Monthly building rental lease payment.', 'Rent', 120000.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), 'PAID', 'MONTHLY', 'uploads/receipts/rent_jan2025.pdf', DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), 4, '2025-01-05 08:30:00'),
(6, 'Home Broadband Bill', 'SLT Mobitel', 'REF-SLT-202401', 'Fibre 100Mbps unlimited package for remote work.', 'Internet', 4890.00, DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 'PENDING', 'MONTHLY', NULL, NULL, 3, '2025-02-03 14:00:00');

-- ============================================================================
-- 3. INSERT DATA: EVENTS
-- ============================================================================
INSERT INTO events (id, event_name, description, category, event_date, event_time, location, status, created_by, created_at) VALUES
(1, 'Quarterly Business Review', 'Review financial reports and deliverables for Q1.', 'Meeting', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '10:00:00', 'Executive Boardroom', 'UPCOMING', 2, '2025-02-01 10:00:00'),
(2, 'Annual Security & ISO Audit', 'External auditor review for ISO compliance.', 'Audit', DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), '14:00:00', 'Floor 3 Meeting Room', 'UPCOMING', 2, '2025-02-01 10:30:00'),
(3, 'Agile Sprint Retro & Demo', 'Sprint 14 review and stakeholder demonstration.', 'Meeting', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '16:00:00', 'Virtual via Teams', 'UPCOMING', 3, '2025-02-02 11:00:00'),
(4, 'Annual Company Townhall', 'Annual CEO keynote and team awards ceremony.', 'Celebration', DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY), '18:30:00', 'Cinnamon Grand Ballroom', 'COMPLETED', 5, '2025-01-05 09:00:00');

-- ============================================================================
-- 4. INSERT DATA: REMINDERS
-- ============================================================================
INSERT INTO reminders (id, title, description, bill_id, event_id, user_id, reminder_date, reminder_time, recurrence_type, status, created_at) VALUES
(1, 'Reminder: Leased Line Bill Due', 'Settle Dialog Enterprise bill to prevent cutoff.', 1, NULL, 2, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '09:00:00', 'ONCE', 'ACTIVE', '2025-02-01 09:05:00'),
(2, 'Reminder: Electricity Bill Due', 'Pay CEB electricity bill.', 2, NULL, 2, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '09:00:00', 'ONCE', 'ACTIVE', '2025-02-01 09:20:00'),
(3, 'Reminder: Quarterly Review Meeting', 'Prepare Q1 presentation slides.', NULL, 1, 2, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '10:00:00', 'ONCE', 'ACTIVE', '2025-02-01 10:05:00'),
(4, 'Reminder: Home Internet Bill', 'SLT broadband bill settlement.', 6, NULL, 3, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), '08:30:00', 'ONCE', 'ACTIVE', '2025-02-03 14:10:00');

-- ============================================================================
-- 5. INSERT DATA: NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (id, user_id, reminder_id, title, message, channel, status, sent_at, read_at) VALUES
(1, 2, 2, 'Bill Due Reminder: Electricity Bill', 'Your monthly electricity bill of LKR 14,500.00 is due in 4 days.', 'EMAIL', 'SENT', DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL),
(2, 2, 3, 'Event Alert: Quarterly Business Review', 'Upcoming meeting: Quarterly Business Review in 5 days at Executive Boardroom.', 'SMS', 'SENT', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL),
(3, 2, 1, 'System Reminder: Internet Leased Line', 'Your Internet Leased Line renewal payment is scheduled for next week.', 'IN_APP', 'SENT', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(4, 3, 4, 'Welcome to TrackDue Notifications', 'Your notification delivery channels (Email & SMS) are configured and active.', 'EMAIL', 'SENT', DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL);

-- ============================================================================
-- 6. INSERT DATA: NOTIFICATION TEMPLATES
-- ============================================================================
INSERT INTO notification_templates (id, type, user_id, title_template, message_template, updated_at) VALUES
(1, 'BILL', NULL, 'Bill Due Reminder: {bill_name}', 'Dear User, your bill for {bill_name} of amount LKR {amount} is due on {due_date}. Please settle payment on time.', NOW()),
(2, 'EVENT', NULL, 'Event Alert: {event_name}', 'Reminder: The event {event_name} is scheduled for {event_date} at {event_time}. Location: {location}.', NOW());

-- ============================================================================
-- 7. INSERT DATA: SUPPORT REQUESTS
-- ============================================================================
INSERT INTO support_requests (id, user_id, user_name, subject, category, message, status, admin_response, created_at) VALUES
(1, 3, 'Isuru Deshal', 'Issue uploading payment receipt', 'Technical Issue', 'I am getting a timeout error when attaching PDF payment receipts greater than 5MB.', 'OPEN', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 2, 'Chamath Silva', 'Request recurring reminder for water bill', 'Bill Inquiry', 'Can we configure automated recurring bi-weekly alerts for corporate utility bills?', 'RESOLVED', 'Recurring reminder feature has been enabled in your dashboard preferences.', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ============================================================================
-- 8. INSERT DATA: FEEDBACK
-- ============================================================================
INSERT INTO feedback (id, user_id, user_name, type, rating, message, status, created_at) VALUES
(1, 2, 'Chamath Silva', 'FEEDBACK', 5, 'TrackDue has made tracking utility bills and project deadlines very easy!', 'REVIEWED', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 3, 'Isuru Deshal', 'SUGGESTION', 4, 'Please add dark mode and WhatsApp notifications in the future updates.', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================================================
-- 9. INSERT DATA: ACTIVITY LOGS
-- ============================================================================
INSERT INTO activity_logs (id, user_id, user_name, action, module, entity_id, description, created_at) VALUES
(1, 1, 'System Administrator', 'LOGIN', 'USER', 1, 'Admin logged into TrackDue Management Portal', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 'Chamath Silva', 'CREATE', 'BILL', 1, 'Created new bill: Office Leased Line Internet', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 'Chamath Silva', 'CREATE', 'REMINDER', 1, 'Created reminder for bill Dialog Enterprise', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 4, 'Nadeeka Perera', 'STATUS_CHANGE', 'BILL', 5, 'Marked bill Corporate Office Rent - Jan as PAID', DATE_SUB(NOW(), INTERVAL 1 DAY));
