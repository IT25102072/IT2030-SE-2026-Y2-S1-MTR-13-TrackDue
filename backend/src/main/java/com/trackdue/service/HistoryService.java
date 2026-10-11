package com.trackdue.service;

import com.trackdue.entity.ActivityLog;
import com.trackdue.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoryService {

    private final ActivityLogRepository repository;

    public HistoryService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public ActivityLog log(Long userId, String userName, String action, String module, Long entityId, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .userName(userName != null ? userName : (userId != null ? "User #" + userId : "System"))
                .action(action)
                .module(module)
                .entityId(entityId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(log);
    }

    public List<ActivityLog> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public ActivityLog getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public List<ActivityLog> getByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ActivityLog> getByModule(String module) {
        if ("ALL".equalsIgnoreCase(module)) {
            return getAll();
        }
        return repository.findByModuleOrderByCreatedAtDesc(module);
    }

    public List<ActivityLog> getByAction(String action) {
        if ("ALL".equalsIgnoreCase(action)) {
            return getAll();
        }
        return repository.findByActionOrderByCreatedAtDesc(action);
    }

    public List<ActivityLog> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAll();
        }
        return repository.findByDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(query.trim());
    }

    public List<ActivityLog> filter(String module, String action, String query) {
        List<ActivityLog> logs = repository.findAllByOrderByCreatedAtDesc();
        return logs.stream()
                .filter(l -> module == null || module.equalsIgnoreCase("ALL") || l.getModule().equalsIgnoreCase(module))
                .filter(l -> action == null || action.equalsIgnoreCase("ALL") || l.getAction().equalsIgnoreCase(action))
                .filter(l -> query == null || query.trim().isEmpty() ||
                        (l.getDescription() != null && l.getDescription().toLowerCase().contains(query.toLowerCase())) ||
                        (l.getUserName() != null && l.getUserName().toLowerCase().contains(query.toLowerCase())))
                .toList();
    }
}
