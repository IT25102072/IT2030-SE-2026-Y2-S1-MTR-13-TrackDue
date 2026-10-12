package com.trackdue.service;

import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.entity.Reminder;
import com.trackdue.repository.BillRepository;
import com.trackdue.repository.EventRepository;
import com.trackdue.repository.ReminderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class ReminderTriggerService {

    private final ReminderRepository reminderRepository;
    private final BillRepository billRepository;
    private final EventRepository eventRepository;
    private final NotificationTemplateService templateService;
    private final NotificationService notificationService;
    private final HistoryService historyService;

    public ReminderTriggerService(
            ReminderRepository reminderRepository,
            BillRepository billRepository,
            EventRepository eventRepository,
            NotificationTemplateService templateService,
            NotificationService notificationService,
            HistoryService historyService) {
        this.reminderRepository = reminderRepository;
        this.billRepository = billRepository;
        this.eventRepository = eventRepository;
        this.templateService = templateService;
        this.notificationService = notificationService;
        this.historyService = historyService;
    }

    /**
     * Periodic background check every 15 seconds to dispatch due reminders automatically.
     */
    @Scheduled(fixedRate = 15000)
    public void scheduledReminderCheck() {
        checkAndTriggerDueReminders();
    }

    public synchronized int checkAndTriggerDueReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Reminder> activeReminders = reminderRepository.findAll().stream()
                .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()))
                .filter(r -> isDue(r, today, now))
                .toList();

        int triggeredCount = 0;

        for (Reminder reminder : activeReminders) {
            boolean processed = processReminder(reminder);
            if (processed) {
                triggeredCount++;
            }
        }

        return triggeredCount;
    }

    private boolean isDue(Reminder r, LocalDate today, LocalTime now) {
        if (r.getReminderDate() == null) return false;
        if (r.getReminderDate().isBefore(today)) {
            return true;
        }
        if (r.getReminderDate().isEqual(today)) {
            return r.getReminderTime() == null || !r.getReminderTime().isAfter(now);
        }
        return false;
    }

    private boolean processReminder(Reminder reminder) {
        Long userId = reminder.getUserId();
        String title = "Reminder Alert";
        String message = "Your scheduled reminder is due.";

        if (reminder.getBillId() != null) {
            Bill bill = billRepository.findById(reminder.getBillId()).orElse(null);
            if (bill != null) {
                Map<String, String> formatted = templateService.formatBillNotification(bill, userId);
                title = formatted.get("title");
                message = formatted.get("message");
            } else {
                title = "Bill Reminder #" + reminder.getBillId();
                message = "Your scheduled bill reminder is due today.";
            }
        } else if (reminder.getEventId() != null) {
            Event event = eventRepository.findById(reminder.getEventId()).orElse(null);
            if (event != null) {
                Map<String, String> formatted = templateService.formatEventNotification(event, userId);
                title = formatted.get("title");
                message = formatted.get("message");
            } else {
                title = "Event Reminder #" + reminder.getEventId();
                message = "Your scheduled event reminder is due today.";
            }
        }

        // Send in-app notification to the user
        notificationService.sendNotification(userId, reminder.getId(), title, message, "IN_APP");

        // Update reminder status
        reminder.setStatus("TRIGGERED");
        reminderRepository.save(reminder);

        historyService.log(userId, "System", "STATUS_CHANGE", "REMINDER", reminder.getId(),
                "Automated in-app alert triggered for reminder #" + reminder.getId() + ": " + title);

        return true;
    }
}
