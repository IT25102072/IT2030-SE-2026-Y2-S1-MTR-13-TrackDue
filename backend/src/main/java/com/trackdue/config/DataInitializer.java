package com.trackdue.config;

import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.entity.Notification;
import com.trackdue.entity.Reminder;
import com.trackdue.entity.User;
import com.trackdue.repository.BillRepository;
import com.trackdue.repository.EventRepository;
import com.trackdue.repository.NotificationRepository;
import com.trackdue.repository.ReminderRepository;
import com.trackdue.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final BillRepository billRepository;
    private final EventRepository eventRepository;
    private final ReminderRepository reminderRepository;
    private final com.trackdue.service.NotificationTemplateService templateService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           NotificationRepository notificationRepository,
                           BillRepository billRepository,
                           EventRepository eventRepository,
                           ReminderRepository reminderRepository,
                           com.trackdue.service.NotificationTemplateService templateService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.billRepository = billRepository;
        this.eventRepository = eventRepository;
        this.reminderRepository = reminderRepository;
        this.templateService = templateService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default System Administrator account if not present
        if (userRepository.findByEmailIgnoreCase("admin@trackdue.com").isEmpty()) {
            userRepository.save(User.builder()
                    .firstName("System")
                    .lastName("Administrator")
                    .email("admin@trackdue.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+94 11 234 5678")
                    .role("SYSTEM_ADMINISTRATOR")
                    .status("ACTIVE")
                    .build());
            System.out.println(">>> TrackDue System Administrator seeded: admin@trackdue.com / admin123");
        }

        // Seed default Standard Employee User account if not present
        if (userRepository.findByEmailIgnoreCase("user@trackdue.com").isEmpty()) {
            userRepository.save(User.builder()
                    .firstName("Chamath")
                    .lastName("Silva")
                    .email("user@trackdue.com")
                    .password(passwordEncoder.encode("user12345"))
                    .phone("+94 77 123 4567")
                    .role("GENERAL_EMPLOYEE")
                    .status("ACTIVE")
                    .build());
            System.out.println(">>> TrackDue Standard User seeded: user@trackdue.com / user12345");
        }

        // Ensure isuru2025@gmail.com has a known working password: user12345
        userRepository.findByEmailIgnoreCase("isuru2025@gmail.com").ifPresentOrElse(u -> {
            u.setPassword(passwordEncoder.encode("user12345"));
            u.setStatus("ACTIVE");
            userRepository.save(u);
            System.out.println(">>> TrackDue User isuru2025@gmail.com password synced to: user12345");
        }, () -> {
            userRepository.save(User.builder()
                    .firstName("Isuru")
                    .lastName("Deshal")
                    .email("isuru2025@gmail.com")
                    .password(passwordEncoder.encode("user12345"))
                    .phone("+94 75 427 2541")
                    .role("GENERAL_EMPLOYEE")
                    .status("ACTIVE")
                    .build());
            System.out.println(">>> TrackDue User isuru2025@gmail.com seeded with password: user12345");
        });

        // Seed default sample notifications if table is empty
        if (notificationRepository.count() == 0) {
            userRepository.findByEmailIgnoreCase("user@trackdue.com").ifPresent(user -> {
                notificationRepository.save(Notification.builder()
                        .userId(user.getId())
                        .title("Bill Due Reminder: Electricity Bill")
                        .message("Your monthly electricity bill of LKR 4,500.00 is due in 2 days. Please settle payment to avoid late fees.")
                        .channel("EMAIL")
                        .status("SENT")
                        .sentAt(LocalDateTime.now().minusHours(3))
                        .build());

                notificationRepository.save(Notification.builder()
                        .userId(user.getId())
                        .title("Event Alert: Team Sprint Planning")
                        .message("Upcoming meeting: Team Sprint Planning is starting in 30 minutes in Room B.")
                        .channel("SMS")
                        .status("SENT")
                        .sentAt(LocalDateTime.now().minusMinutes(45))
                        .build());

                notificationRepository.save(Notification.builder()
                        .userId(user.getId())
                        .title("System Reminder: Internet Leased Line")
                        .message("Your Internet Leased Line renewal payment is scheduled for next week.")
                        .channel("IN_APP")
                        .status("SENT")
                        .sentAt(LocalDateTime.now().minusDays(1))
                        .build());
            });

            userRepository.findByEmailIgnoreCase("isuru2025@gmail.com").ifPresent(user -> {
                notificationRepository.save(Notification.builder()
                        .userId(user.getId())
                        .title("Welcome to TrackDue Notifications")
                        .message("Your notification delivery channels (Email & SMS) are configured and active.")
                        .channel("EMAIL")
                        .status("SENT")
                        .sentAt(LocalDateTime.now().minusHours(2))
                        .build());
            });
            System.out.println(">>> Sample Notifications seeded across EMAIL, SMS, and IN_APP channels.");
        }

        // Seed initial Bills, Events, and Reminders if empty
        if (billRepository.count() == 0) {
            userRepository.findByEmailIgnoreCase("user@trackdue.com").ifPresent(user -> {
                Bill bill1 = billRepository.save(Bill.builder()
                        .billName("Office Leased Line Internet")
                        .category("Internet")
                        .amount(new BigDecimal("35000.00"))
                        .dueDate(LocalDate.now().plusDays(7))
                        .status("PENDING")
                        .recurringPattern("MONTHLY")
                        .createdBy(user.getId())
                        .description("Dialog Enterprise high-speed fiber line for office.")
                        .build());

                Bill bill2 = billRepository.save(Bill.builder()
                        .billName("Ceylon Electricity Board Bill")
                        .category("Electricity")
                        .amount(new BigDecimal("14500.00"))
                        .dueDate(LocalDate.now().plusDays(4))
                        .status("PENDING")
                        .recurringPattern("MONTHLY")
                        .createdBy(user.getId())
                        .description("Monthly commercial utility electricity bill.")
                        .build());

                Bill bill3 = billRepository.save(Bill.builder()
                        .billName("Cloud AWS Infrastructure")
                        .category("Software")
                        .amount(new BigDecimal("58200.00"))
                        .dueDate(LocalDate.now().plusDays(15))
                        .status("PENDING")
                        .recurringPattern("MONTHLY")
                        .createdBy(user.getId())
                        .description("Production database and compute instances.")
                        .build());

                Event event1 = eventRepository.save(Event.builder()
                        .eventName("Quarterly Business Review")
                        .category("Meeting")
                        .eventDate(LocalDate.now().plusDays(5))
                        .eventTime(LocalTime.of(10, 0))
                        .location("Executive Boardroom")
                        .status("UPCOMING")
                        .createdBy(user.getId())
                        .description("Review financial reports and deliverables.")
                        .build());

                Event event2 = eventRepository.save(Event.builder()
                        .eventName("Annual Security & ISO Audit")
                        .category("Audit")
                        .eventDate(LocalDate.now().plusDays(10))
                        .eventTime(LocalTime.of(14, 0))
                        .location("Floor 3 Meeting Room")
                        .status("UPCOMING")
                        .createdBy(user.getId())
                        .description("External auditor review for ISO compliance.")
                        .build());

                // Seed corresponding reminders
                reminderRepository.save(Reminder.builder()
                        .billId(bill1.getId())
                        .userId(user.getId())
                        .reminderDate(LocalDate.now().plusDays(5))
                        .reminderTime(LocalTime.of(9, 0))
                        .status("ACTIVE")
                        .recurrenceType("ONCE")
                        .build());

                reminderRepository.save(Reminder.builder()
                        .billId(bill2.getId())
                        .userId(user.getId())
                        .reminderDate(LocalDate.now().plusDays(2))
                        .reminderTime(LocalTime.of(9, 0))
                        .status("ACTIVE")
                        .recurrenceType("ONCE")
                        .build());

                reminderRepository.save(Reminder.builder()
                        .eventId(event1.getId())
                        .userId(user.getId())
                        .reminderDate(LocalDate.now().plusDays(4))
                        .reminderTime(LocalTime.of(10, 0))
                        .status("ACTIVE")
                        .recurrenceType("ONCE")
                        .build());

                System.out.println(">>> Sample Bills, Events, and Reminders seeded for user@trackdue.com.");
            });

            userRepository.findByEmailIgnoreCase("isuru2025@gmail.com").ifPresent(user -> {
                Bill bill = billRepository.save(Bill.builder()
                        .billName("Home Broadband Bill")
                        .category("Internet")
                        .amount(new BigDecimal("4890.00"))
                        .dueDate(LocalDate.now().plusDays(6))
                        .status("PENDING")
                        .recurringPattern("MONTHLY")
                        .createdBy(user.getId())
                        .description("Fiber router monthly subscription.")
                        .build());

                Event event = eventRepository.save(Event.builder()
                        .eventName("Team Project Delivery Review")
                        .category("Deadline")
                        .eventDate(LocalDate.now().plusDays(8))
                        .eventTime(LocalTime.of(15, 30))
                        .location("Online Zoom")
                        .status("UPCOMING")
                        .createdBy(user.getId())
                        .description("Project milestone submission review.")
                        .build());

                reminderRepository.save(Reminder.builder()
                        .billId(bill.getId())
                        .userId(user.getId())
                        .reminderDate(LocalDate.now().plusDays(4))
                        .reminderTime(LocalTime.of(9, 0))
                        .status("ACTIVE")
                        .recurrenceType("ONCE")
                        .build());

                System.out.println(">>> Sample Bills, Events, and Reminders seeded for isuru2025@gmail.com.");
            });
        }

        // Initialize and ensure system notification templates exist
        templateService.getAllSystemTemplates();
        System.out.println(">>> System notification message templates (Bill & Event) verified.");

        System.out.println(">>> TrackDue ready. Accounts initialized.");
    }
}
