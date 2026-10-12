package com.trackdue.controller;

import com.trackdue.entity.Reminder;
import com.trackdue.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.trackdue.service.ReminderTriggerService;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    private final ReminderService reminderService;
    private final ReminderTriggerService triggerService;

    public ReminderController(ReminderService reminderService, ReminderTriggerService triggerService) {
        this.reminderService = reminderService;
        this.triggerService = triggerService;
    }

    @PostMapping("/trigger-check")
    public ResponseEntity<Map<String, Object>> triggerCheck() {
        int count = triggerService.checkAndTriggerDueReminders();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "triggeredCount", count,
                "message", count + " due reminders processed and dispatched to notifications"
        ));
    }

    @PostMapping
    public ResponseEntity<Reminder> create(
            @RequestBody Reminder reminder,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        Reminder created = reminderService.create(reminder, userId, userName);
        triggerService.checkAndTriggerDueReminders();
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Reminder>> getAll() {
        return ResponseEntity.ok(reminderService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reminder> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.getById(id));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Reminder>> getUpcoming() {
        return ResponseEntity.ok(reminderService.getUpcoming());
    }

    @GetMapping("/history")
    public ResponseEntity<List<Reminder>> getHistory() {
        return ResponseEntity.ok(reminderService.getHistory());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reminder>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reminderService.getByUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> update(
            @PathVariable Long id,
            @RequestBody Reminder reminder,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        return ResponseEntity.ok(reminderService.update(id, reminder, userId, userName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        reminderService.delete(id, userId, userName);
        return ResponseEntity.noContent().build();
    }
}
