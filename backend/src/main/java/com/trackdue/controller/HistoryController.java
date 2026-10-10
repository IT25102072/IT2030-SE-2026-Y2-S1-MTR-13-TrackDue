package com.trackdue.controller;

import com.trackdue.entity.ActivityLog;
import com.trackdue.service.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAll() {
        return ResponseEntity.ok(historyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityLog> getById(@PathVariable Long id) {
        ActivityLog log = historyService.getById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(log);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityLog>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(historyService.getByUserId(userId));
    }

    @GetMapping("/module/{module}")
    public ResponseEntity<List<ActivityLog>> getByModule(@PathVariable String module) {
        return ResponseEntity.ok(historyService.getByModule(module));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ActivityLog>> filter(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(historyService.filter(module, action, query));
    }
}
