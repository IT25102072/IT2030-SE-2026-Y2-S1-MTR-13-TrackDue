package com.trackdue.service;

import com.trackdue.entity.Notification;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.trackdue.entity.User;
import com.trackdue.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final UserRepository userRepository;
    private final HistoryService historyService;

    public NotificationService(NotificationRepository repository, UserRepository userRepository, HistoryService historyService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.historyService = historyService;
    }

    public Notification sendNotification(Long userId, Long reminderId, String title, String message, String channel) {
        Notification notification = Notification.builder()
                .userId(userId)
                .reminderId(reminderId)
                .title(title)
                .message(message)
                .channel(channel != null ? channel : "IN_APP")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        Notification saved = repository.save(notification);

        historyService.log(userId, "System", "CREATE", "NOTIFICATION", saved.getId(),
                "Notification dispatched via " + saved.getChannel() + ": " + saved.getTitle());

        return saved;
    }

    public Notification create(Notification notification) {
        if (notification.getSentAt() == null) {
            notification.setSentAt(LocalDateTime.now());
        }
        if (notification.getStatus() == null) {
            notification.setStatus("SENT");
        }
        if (notification.getChannel() == null) {
            notification.setChannel("IN_APP");
        }
        Notification saved = repository.save(notification);
        historyService.log(notification.getUserId() != null ? notification.getUserId() : 1L, "System", "CREATE", "NOTIFICATION", saved.getId(),
                "Notification created via " + saved.getChannel() + ": " + saved.getTitle());
        return saved;
    }

    public List<Notification> getAll() {
        return repository.findAllByOrderBySentAtDesc();
    }

    public List<Notification> getByUser(Long userId) {
        return repository.findByUserIdOrderBySentAtDesc(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        return repository.save(notification);
    }

    public Notification update(Long id, Notification updated) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (updated.getTitle() != null) notification.setTitle(updated.getTitle());
        if (updated.getMessage() != null) notification.setMessage(updated.getMessage());
        if (updated.getStatus() != null) notification.setStatus(updated.getStatus());
        if (updated.getChannel() != null) notification.setChannel(updated.getChannel());
        if ("READ".equalsIgnoreCase(updated.getStatus()) && notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
        }
        Notification saved = repository.save(notification);
        historyService.log(saved.getUserId(), "User", "UPDATE", "NOTIFICATION", saved.getId(),
                "Updated notification message: " + saved.getTitle());
        return saved;
    }

    public void markAllAsRead(Long userId) {
        List<Notification> list = repository.findByUserIdOrderBySentAtDesc(userId);
        for (Notification n : list) {
            if (!"READ".equalsIgnoreCase(n.getStatus())) {
                n.setStatus("READ");
                n.setReadAt(LocalDateTime.now());
            }
        }
        repository.saveAll(list);
    }

    public long getUnreadCount(Long userId) {
        return repository.countByUserIdAndStatus(userId, "SENT");
    }

    public int broadcastToAllUsers(String title, String message) {
        List<User> users = userRepository.findAll();
        int count = 0;
        for (User u : users) {
            if ("ACTIVE".equalsIgnoreCase(u.getStatus())) {
                Notification n = Notification.builder()
                        .userId(u.getId())
                        .title(title)
                        .message(message)
                        .channel("IN_APP")
                        .status("SENT")
                        .sentAt(LocalDateTime.now())
                        .build();
                repository.save(n);
                count++;
            }
        }
        historyService.log(1L, "System Administrator", "CREATE", "NOTIFICATION", null,
                "Broadcasted system announcement to " + count + " users: " + title);
        return count;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
