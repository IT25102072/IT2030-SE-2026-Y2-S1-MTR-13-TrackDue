package com.trackdue.service;

import com.trackdue.entity.SupportRequest;
import com.trackdue.entity.User;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.SupportRequestRepository;
import com.trackdue.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {

    private final SupportRequestRepository repository;
    private final HistoryService historyService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public SupportService(SupportRequestRepository repository,
                          HistoryService historyService,
                          NotificationService notificationService,
                          UserRepository userRepository) {
        this.repository = repository;
        this.historyService = historyService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public SupportRequest create(SupportRequest request, Long userId, String userName) {
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject is required");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message is required");
        }
        if (userId != null) {
            request.setUserId(userId);
        }
        if (userName != null) {
            request.setUserName(userName);
        }
        request.setStatus("OPEN");
        SupportRequest saved = repository.save(request);

        historyService.log(saved.getUserId(), saved.getUserName(), "CREATE", "SUPPORT", saved.getId(),
                "Submitted support ticket #" + saved.getId() + ": " + saved.getSubject());

        // Notify Administrator about incoming support ticket
        try {
            List<User> admins = userRepository.findByRole("ADMIN");
            if (admins.isEmpty()) {
                userRepository.findByEmail("admin@trackdue.com").ifPresent(admins::add);
            }
            String submitter = (saved.getUserName() != null && !saved.getUserName().trim().isEmpty()) ? saved.getUserName() : "User #" + saved.getUserId();
            for (User admin : admins) {
                notificationService.sendNotification(
                        admin.getId(),
                        null,
                        "New Support Ticket #" + saved.getId() + ": " + saved.getSubject(),
                        "Submitted by " + submitter + " [" + saved.getCategory() + "]: " + saved.getMessage(),
                        "IN_APP"
                );
            }
        } catch (Exception ex) {
            // Non-blocking notification dispatch
        }

        return saved;
    }

    public List<SupportRequest> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<SupportRequest> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public List<SupportRequest> getByStatus(String status) {
        return repository.findByStatus(status);
    }

    public SupportRequest getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Support request not found with id: " + id));
    }

    public SupportRequest update(Long id, SupportRequest newData, Long userId, String userName) {
        SupportRequest request = getById(id);

        // Allow user to update ticket details
        if (newData.getSubject() != null && !newData.getSubject().trim().isEmpty()) {
            request.setSubject(newData.getSubject().trim());
        }
        if (newData.getCategory() != null && !newData.getCategory().trim().isEmpty()) {
            request.setCategory(newData.getCategory().trim());
        }
        if (newData.getMessage() != null && !newData.getMessage().trim().isEmpty()) {
            request.setMessage(newData.getMessage().trim());
        }

        // Handle Admin updates (Status and Admin Response)
        boolean statusChanged = false;
        String oldStatus = request.getStatus();
        if (newData.getStatus() != null && !newData.getStatus().trim().isEmpty()) {
            String newStatus = newData.getStatus().trim().toUpperCase();
            if (!newStatus.equalsIgnoreCase(oldStatus)) {
                request.setStatus(newStatus);
                statusChanged = true;
            }
        }

        boolean responseChanged = false;
        if (newData.getAdminResponse() != null) {
            request.setAdminResponse(newData.getAdminResponse().trim());
            responseChanged = true;
        }

        request.setUpdatedAt(LocalDateTime.now());
        SupportRequest saved = repository.save(request);

        historyService.log(userId, userName != null ? userName : "User", "UPDATE", "SUPPORT", saved.getId(),
                "Updated ticket #" + saved.getId() + (statusChanged ? " status from " + oldStatus + " to " + saved.getStatus() : ""));

        // When status or admin response is updated by Admin, notify the ticket creator
        if ((statusChanged || responseChanged) && saved.getUserId() != null && (userId == null || !userId.equals(saved.getUserId()))) {
            try {
                String stageText = "OPEN".equals(saved.getStatus()) ? "Received / In Queue" :
                                   "IN_PROGRESS".equals(saved.getStatus()) ? "Investigating & Error Fixing Started" :
                                   "RESOLVED".equals(saved.getStatus()) ? "Error Fixed & Resolved" :
                                   "CLOSED".equals(saved.getStatus()) ? "Closed" : saved.getStatus();

                String notifMsg = "Your support ticket #" + saved.getId() + " (" + saved.getSubject() + ") is now: " + stageText + ".";
                if (saved.getAdminResponse() != null && !saved.getAdminResponse().trim().isEmpty()) {
                    notifMsg += " Note from Admin: " + saved.getAdminResponse();
                }

                notificationService.sendNotification(
                        saved.getUserId(),
                        null,
                        "Support Ticket #" + saved.getId() + " Status: " + stageText,
                        notifMsg,
                        "IN_APP"
                );
            } catch (Exception ex) {
                // Non-blocking notification dispatch
            }
        }

        return saved;
    }

    public void delete(Long id, Long userId, String userName) {
        SupportRequest request = getById(id);
        repository.delete(request);

        historyService.log(userId, userName, "DELETE", "SUPPORT", id,
                "Deleted support ticket #" + id);
    }
}
