package com.trackdue.service;

import com.trackdue.entity.Feedback;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository repository;
    private final HistoryService historyService;

    public FeedbackService(FeedbackRepository repository, HistoryService historyService) {
        this.repository = repository;
        this.historyService = historyService;
    }

    public Feedback create(Feedback feedback, Long userId, String userName) {
        if (feedback.getMessage() == null || feedback.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback message is required");
        }
        if (feedback.getRating() == null || feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars");
        }
        if (userId != null) {
            feedback.setUserId(userId);
        }
        if (userName != null) {
            feedback.setUserName(userName);
        }
        if (feedback.getType() == null) {
            feedback.setType("SUGGESTION");
        }

        // Limit to 1 feedback per user: if existing feedback exists, update it instead of creating duplicates
        if (userId != null) {
            List<Feedback> existingList = repository.findByUserId(userId);
            if (!existingList.isEmpty()) {
                Feedback existing = existingList.get(0);
                existing.setType(feedback.getType());
                existing.setRating(feedback.getRating());
                existing.setMessage(feedback.getMessage().trim());
                if (userName != null) {
                    existing.setUserName(userName);
                }
                Feedback updated = repository.save(existing);
                historyService.log(updated.getUserId(), updated.getUserName(), "UPDATE", "FEEDBACK", updated.getId(),
                        "Updated existing feedback to " + updated.getRating() + " stars (" + updated.getType() + ")");
                return updated;
            }
        }

        feedback.setStatus("SUBMITTED");
        Feedback saved = repository.save(feedback);

        historyService.log(saved.getUserId(), saved.getUserName(), "CREATE", "FEEDBACK", saved.getId(),
                "Submitted " + saved.getType() + " with " + saved.getRating() + " stars rating");

        return saved;
    }

    public List<Feedback> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Feedback getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    public List<Feedback> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Feedback update(Long id, Feedback newData, Long userId, String userName) {
        Feedback feedback = getById(id);

        if (newData.getType() != null && !newData.getType().trim().isEmpty()) {
            feedback.setType(newData.getType().trim());
        }
        if (newData.getRating() != null && newData.getRating() >= 1 && newData.getRating() <= 5) {
            feedback.setRating(newData.getRating());
        }
        if (newData.getMessage() != null && !newData.getMessage().trim().isEmpty()) {
            feedback.setMessage(newData.getMessage().trim());
        }
        if (userName != null && !userName.trim().isEmpty()) {
            feedback.setUserName(userName);
        }

        Feedback saved = repository.save(feedback);
        historyService.log(userId != null ? userId : saved.getUserId(),
                userName != null ? userName : (saved.getUserName() != null ? saved.getUserName() : "User"),
                "UPDATE", "FEEDBACK", saved.getId(),
                "Updated feedback #" + saved.getId() + " (" + saved.getRating() + " stars)");
        return saved;
    }

    public Feedback updateStatus(Long id, String status, Long adminUserId, String adminUserName) {
        Feedback feedback = getById(id);
        feedback.setStatus(status);
        Feedback saved = repository.save(feedback);

        historyService.log(adminUserId, adminUserName != null ? adminUserName : "Admin", "UPDATE", "FEEDBACK", saved.getId(),
                "Reviewed feedback #" + saved.getId() + " - marked as " + status);

        return saved;
    }

    public void delete(Long id, Long userId, String userName) {
        Feedback feedback = getById(id);
        repository.delete(feedback);

        historyService.log(userId, userName, "DELETE", "FEEDBACK", id,
                "Deleted feedback #" + id);
    }
}
