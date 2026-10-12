package com.trackdue.service;

import com.trackdue.dto.AuthRequest;
import com.trackdue.dto.AuthResponse;
import com.trackdue.entity.User;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final HistoryService historyService;
    private final BillRepository billRepository;
    private final EventRepository eventRepository;
    private final ReminderRepository reminderRepository;
    private final NotificationRepository notificationRepository;
    private final SupportRequestRepository supportRequestRepository;
    private final FeedbackRepository feedbackRepository;

    public UserService(UserRepository repository,
                       PasswordEncoder passwordEncoder,
                       HistoryService historyService,
                       BillRepository billRepository,
                       EventRepository eventRepository,
                       ReminderRepository reminderRepository,
                       NotificationRepository notificationRepository,
                       SupportRequestRepository supportRequestRepository,
                       FeedbackRepository feedbackRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.historyService = historyService;
        this.billRepository = billRepository;
        this.eventRepository = eventRepository;
        this.reminderRepository = reminderRepository;
        this.notificationRepository = notificationRepository;
        this.supportRequestRepository = supportRequestRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public User register(User user) {
        String normalizedEmail = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "";
        user.setEmail(normalizedEmail);

        if (repository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists: " + normalizedEmail);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (repository.count() == 0 || (user.getEmail() != null && user.getEmail().toLowerCase().contains("admin"))) {
            user.setRole("SYSTEM_ADMINISTRATOR");
        } else if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("GENERAL_EMPLOYEE");
        }
        user.setStatus("ACTIVE");
        User saved = repository.save(user);

        historyService.log(saved.getId(), saved.getFirstName() + " " + saved.getLastName(),
                "CREATE", "USER", saved.getId(), "User registered account with role " + saved.getRole());

        return saved;
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String password = request.getPassword() != null ? request.getPassword() : "";

        User user = repository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account with email '" + email + "' was not found. Please verify your email or click Create Account."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password for " + email + ". Please check your password and try again.");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("User account is inactive. Contact Administrator.");
        }

        historyService.log(user.getId(), user.getFirstName() + " " + user.getLastName(),
                "LOGIN", "USER", user.getId(), "User logged in to the system");

        return AuthResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .token("td-session-" + user.getId() + "-" + System.currentTimeMillis())
                .message("Login successful")
                .build();
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public User getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User updateProfile(Long id, User updateData) {
        User user = getById(id);
        user.setFirstName(updateData.getFirstName());
        user.setLastName(updateData.getLastName());
        user.setPhone(updateData.getPhone());
        if (updateData.getPassword() != null && !updateData.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }
        User updated = repository.save(user);

        historyService.log(user.getId(), user.getFirstName() + " " + user.getLastName(),
                "UPDATE", "USER", user.getId(), "Profile updated");

        return updated;
    }

    public User updateRole(Long id, String role) {
        User user = getById(id);
        user.setRole(role);
        User updated = repository.save(user);

        historyService.log(user.getId(), user.getFirstName() + " " + user.getLastName(),
                "STATUS_CHANGE", "USER", user.getId(), "User role changed to " + role);

        return updated;
    }

    public User updateStatus(Long id, String status) {
        User user = getById(id);
        user.setStatus(status);
        User updated = repository.save(user);

        historyService.log(user.getId(), user.getFirstName() + " " + user.getLastName(),
                "STATUS_CHANGE", "USER", user.getId(), "User status changed to " + status);

        return updated;
    }

    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = getById(id);
        if (currentPassword != null && !currentPassword.trim().isEmpty()) {
            if (!passwordEncoder.matches(currentPassword.trim(), user.getPassword())) {
                throw new IllegalArgumentException("Current password does not match.");
            }
        }
        if (newPassword == null || newPassword.trim().length() < 4) {
            throw new IllegalArgumentException("New password must be at least 4 characters long.");
        }
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        repository.save(user);

        historyService.log(user.getId(), user.getFirstName() + " " + user.getLastName(),
                "UPDATE", "USER", user.getId(), "Password updated successfully");
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getById(id);
        // Cascade delete all user items
        billRepository.deleteAll(billRepository.findByCreatedBy(id));
        eventRepository.deleteAll(eventRepository.findByCreatedBy(id));
        reminderRepository.deleteAll(reminderRepository.findByUserId(id));
        notificationRepository.deleteAll(notificationRepository.findByUserIdOrderBySentAtDesc(id));
        supportRequestRepository.deleteAll(supportRequestRepository.findByUserId(id));
        feedbackRepository.deleteAll(feedbackRepository.findByUserId(id));

        repository.delete(user);
        historyService.log(id, user.getFirstName() + " " + user.getLastName(),
                "DELETE", "USER", id, "User account permanently deleted");
    }
}
