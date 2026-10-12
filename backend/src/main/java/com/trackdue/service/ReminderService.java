package com.trackdue.service;

import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.entity.Reminder;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.BillRepository;
import com.trackdue.repository.EventRepository;
import com.trackdue.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository repository;
    private final BillRepository billRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final HistoryService historyService;

    public ReminderService(
            ReminderRepository repository,
            BillRepository billRepository,
            EventRepository eventRepository,
            NotificationService notificationService,
            HistoryService historyService) {
        this.repository = repository;
        this.billRepository = billRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.historyService = historyService;
    }

    public Reminder create(Reminder reminder, Long userId, String userName) {
        if (reminder.getUserId() == null) {
            reminder.setUserId(userId != null ? userId : 1L);
        }
        if (reminder.getStatus() == null) {
            reminder.setStatus("ACTIVE");
        }
        Reminder saved = repository.save(reminder);

        String context = "Reminder";
        if (saved.getBillId() != null) {
            context = "Bill Reminder #" + saved.getBillId();
        } else if (saved.getEventId() != null) {
            context = "Event Reminder #" + saved.getEventId();
        }

        historyService.log(userId, userName, "CREATE", "REMINDER", saved.getId(),
                "Scheduled reminder for " + saved.getReminderDate() + " (" + context + ")");

        return saved;
    }

    public List<Reminder> getAll() {
        return repository.findAll();
    }

    public Reminder getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));
    }

    public List<Reminder> getUpcoming() {
        return repository.findByReminderDateGreaterThanEqual(LocalDate.now());
    }

    public List<Reminder> getHistory() {
        return repository.findAll();
    }

    public List<Reminder> getByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public Reminder update(Long id, Reminder newData, Long userId, String userName) {
        Reminder rem = getById(id);
        rem.setReminderDate(newData.getReminderDate());
        rem.setReminderTime(newData.getReminderTime());
        rem.setRecurrenceType(newData.getRecurrenceType());
        if (newData.getStatus() != null) {
            rem.setStatus(newData.getStatus());
        }
        if (newData.getBillId() != null) {
            rem.setBillId(newData.getBillId());
            rem.setEventId(null);
        } else if (newData.getEventId() != null) {
            rem.setEventId(newData.getEventId());
            rem.setBillId(null);
        }
        Reminder saved = repository.save(rem);

        historyService.log(userId, userName, "UPDATE", "REMINDER", saved.getId(),
                "Updated reminder for date " + saved.getReminderDate());

        return saved;
    }

    public void delete(Long id, Long userId, String userName) {
        Reminder rem = getById(id);
        repository.delete(rem);

        historyService.log(userId, userName, "DELETE", "REMINDER", id,
                "Deleted reminder #" + id);
    }
}
