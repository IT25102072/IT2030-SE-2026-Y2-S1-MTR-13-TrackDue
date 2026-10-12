-- ============================================================================
-- TRACKDUE DATABASE - USEFUL SQL QUERIES FOR MYSQL WORKBENCH
-- Database Name: trackdue_db
-- ============================================================================

-- 1. SWITCH TO TRACKDUE DATABASE (මෙය මුලින්ම Run කරන්න)
USE trackdue_db;

-- ============================================================================
-- 2. USERS & ACCOUNTS (පරිශීලකයින්ගේ විස්තර)
-- ============================================================================
-- සියලුම Users ලා බැලීමට
SELECT * FROM users;

-- Users ලාගේ නම, Email, Phone, Role සහ Status පමණක් බැලීමට
SELECT id, email, first_name, last_name, phone, role, status, created_at 
FROM users;

-- Admin පරිශීලකයින් පමණක් බැලීමට
SELECT * FROM users WHERE role = 'SYSTEM_ADMINISTRATOR';


-- ============================================================================
-- 3. BILLS & PAYMENTS (බිල්පත් සහ ගෙවීම් රිසිට්පත්)
-- ============================================================================
-- සියලුම බිල්පත් බැලීමට
SELECT * FROM bills;

-- ගෙවීමට ඇති බිල්පත් (Pending Bills) පමණක් බැලීමට
SELECT id, bill_name, category, amount, due_date, status, recurring_pattern 
FROM bills 
WHERE status = 'PENDING';

-- ගෙවා අවසන් වූ (Paid) බිල්පත් සහ ඒවායේ රිසිට්පත් විස්තර බැලීමට
SELECT id, bill_name, category, amount, due_date, status, paid_date, receipt_url 
FROM bills 
WHERE status = 'PAID';

-- රිසිට්පත් Upload කර ඇති බිල්පත් පමණක් බැලීමට
SELECT id, bill_name, amount, paid_date, receipt_url 
FROM bills 
WHERE receipt_url IS NOT NULL AND receipt_url != '';

-- කල් ඉකුත් වූ (Overdue) බිල්පත් බැලීමට
SELECT * FROM bills 
WHERE due_date < CURRENT_DATE AND status != 'PAID';


-- ============================================================================
-- 4. ORGANIZATIONAL EVENTS & ATTENDANCE (ඉවෙන්ට්ස් සහ සහභාගීත්වය)
-- ============================================================================
-- සියලුම Events බැලීමට
SELECT * FROM events;

-- ඉදිරියට පැවැත්වීමට ඇති (Upcoming) Events බැලීමට
SELECT id, event_name, category, event_date, event_time, location, status 
FROM events 
WHERE status = 'UPCOMING';

-- සහභාගී වූ (Attended / Completed) Events බැලීමට
SELECT id, event_name, category, event_date, event_time, location, status 
FROM events 
WHERE status = 'COMPLETED';


-- ============================================================================
-- 5. REMINDERS (දින දර්ශනයේ Reminder Alerts)
-- ============================================================================
-- සියලුම Reminders බැලීමට
SELECT * FROM reminders;

-- සක්‍රීය (Active) Reminders බැලීමට
SELECT id, reminder_date, alert_time, recurrence_pattern, status, bill_id, event_id, custom_title 
FROM reminders 
WHERE status = 'ACTIVE';


-- ============================================================================
-- 6. NOTIFICATIONS (පද්ධතියේ දැනුම්දීම්)
-- ============================================================================
-- සියලුම Notifications බැලීමට
SELECT * FROM notifications ORDER BY created_at DESC;

-- කියවා නැති (Unread) Notifications බැලීමට
SELECT id, user_id, title, message, status, created_at 
FROM notifications 
WHERE status = 'SENT' OR status = 'UNREAD';

-- Custom Notification Message Templates (Bill & Event Template Formats)
SELECT * FROM notification_templates;


-- ============================================================================
-- 7. SUPPORT REQUESTS & USER FEEDBACK (පාරිභෝගික සහය සහ අදහස්)
-- ============================================================================
-- Support Tickets බැලීමට
SELECT id, user_id, user_name, subject, category, message, admin_response, status 
FROM support_requests;

-- විසඳීමට ඇති (Open / In Progress) Support Tickets
SELECT * FROM support_requests WHERE status != 'RESOLVED';

-- User Reviews & Feedback බැලීමට
SELECT id, user_id, user_name, type, rating, message, status 
FROM feedback;


-- ============================================================================
-- 8. SYSTEM ACTIVITY AUDIT LOGS (පද්ධතියේ සිදු වූ සියලු ක්‍රියාකාරකම්)
-- ============================================================================
-- මෑතකදී සිදු වූ සියලුම Activity Logs බැලීමට
SELECT id, user_name, action, module, description, timestamp 
FROM activity_logs 
ORDER BY timestamp DESC 
LIMIT 50;


-- ============================================================================
-- 9. ANALYTICS & SUMMARY QUERIES (විශ්ලේෂණ සහ එකතුව ගණනය කිරීම්)
-- ============================================================================
-- ගෙවීමට ඇති මුළු බිල්පත් ගණන සහ මුදලේ එකතුව:
SELECT 
    COUNT(*) AS total_pending_bills, 
    SUM(amount) AS total_pending_amount,
    AVG(amount) AS average_bill_amount
FROM bills 
WHERE status != 'PAID';

-- ගෙවා අවසන් කළ මුළු බිල්පත් ගණන සහ මුදලේ එකතුව:
SELECT 
    COUNT(*) AS total_paid_bills, 
    SUM(amount) AS total_paid_amount 
FROM bills 
WHERE status = 'PAID';

-- සහභාගී වූ ඉවෙන්ට්ස් ගණන සහ පැවැත්වීමට ඇති ඉවෙන්ට්ස් ගණන:
SELECT 
    status, 
    COUNT(*) AS event_count 
FROM events 
GROUP BY status;
