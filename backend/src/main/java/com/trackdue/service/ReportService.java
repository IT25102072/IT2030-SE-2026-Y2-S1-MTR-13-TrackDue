package com.trackdue.service;

import com.trackdue.dto.SummaryReportDTO;
import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final BillRepository billRepository;
    private final EventRepository eventRepository;
    private final ReminderRepository reminderRepository;
    private final SupportRequestRepository supportRequestRepository;
    private final NotificationRepository notificationRepository;

    public ReportService(
            BillRepository billRepository,
            EventRepository eventRepository,
            ReminderRepository reminderRepository,
            SupportRequestRepository supportRequestRepository,
            NotificationRepository notificationRepository) {
        this.billRepository = billRepository;
        this.eventRepository = eventRepository;
        this.reminderRepository = reminderRepository;
        this.supportRequestRepository = supportRequestRepository;
        this.notificationRepository = notificationRepository;
    }

    public SummaryReportDTO getSummary() {
        LocalDate today = LocalDate.now();
        List<Bill> allBills = billRepository.findAll();
        List<Event> allEvents = eventRepository.findAll();

        long totalBills = allBills.size();
        long paidBills = allBills.stream().filter(b -> "PAID".equalsIgnoreCase(b.getStatus())).count();
        long pendingBills = allBills.stream()
                .filter(b -> !"PAID".equalsIgnoreCase(b.getStatus()) && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();
        long overdueBills = allBills.stream()
                .filter(b -> b.getDueDate() != null && b.getDueDate().isBefore(today) && !"PAID".equalsIgnoreCase(b.getStatus()))
                .count();
        long billsWithReceipts = allBills.stream()
                .filter(b -> b.getReceiptUrl() != null && !b.getReceiptUrl().trim().isEmpty())
                .count();

        BigDecimal totalAmount = allBills.stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = allBills.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = allBills.stream()
                .filter(b -> !"PAID".equalsIgnoreCase(b.getStatus()) && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overdueAmount = allBills.stream()
                .filter(b -> b.getDueDate() != null && b.getDueDate().isBefore(today) && !"PAID".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgPendingAmount = pendingBills > 0
                ? pendingAmount.divide(BigDecimal.valueOf(pendingBills), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long totalEvents = allEvents.size();
        long completedEvents = allEvents.stream()
                .filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus()))
                .count();
        long upcomingEvents = allEvents.stream()
                .filter(e -> !"COMPLETED".equalsIgnoreCase(e.getStatus()) && (e.getEventDate() != null && !e.getEventDate().isBefore(today)))
                .count();

        long totalReminders = reminderRepository.count();
        long openSupport = supportRequestRepository.countByStatus("OPEN");
        long unreadNotifications = notificationRepository.countByStatus("SENT");

        return SummaryReportDTO.builder()
                .totalBills(totalBills)
                .overdueBills(overdueBills)
                .pendingBills(pendingBills)
                .paidBills(paidBills)
                .billsWithReceipts(billsWithReceipts)
                .totalEvents(totalEvents)
                .upcomingEvents(upcomingEvents)
                .completedEvents(completedEvents)
                .totalReminders(totalReminders)
                .openSupportRequests(openSupport)
                .unreadNotifications(unreadNotifications)
                .totalBillAmount(totalAmount)
                .overdueBillAmount(overdueAmount)
                .pendingBillAmount(pendingAmount)
                .avgPendingBillAmount(avgPendingAmount)
                .paidBillAmount(paidAmount)
                .build();
    }

    public SummaryReportDTO getSummaryByUser(Long userId) {
        if (userId == null) {
            return getSummary();
        }
        LocalDate today = LocalDate.now();
        List<Bill> userBills = billRepository.findByCreatedBy(userId);
        List<Event> userEvents = eventRepository.findByCreatedBy(userId);

        long totalBills = userBills.size();
        long paidBills = userBills.stream().filter(b -> "PAID".equalsIgnoreCase(b.getStatus())).count();
        long pendingBills = userBills.stream()
                .filter(b -> !"PAID".equalsIgnoreCase(b.getStatus()) && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();
        long overdueBills = userBills.stream()
                .filter(b -> b.getDueDate() != null && b.getDueDate().isBefore(today) && !"PAID".equalsIgnoreCase(b.getStatus()))
                .count();
        long billsWithReceipts = userBills.stream()
                .filter(b -> b.getReceiptUrl() != null && !b.getReceiptUrl().trim().isEmpty())
                .count();

        BigDecimal totalAmount = userBills.stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = userBills.stream()
                .filter(b -> "PAID".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = userBills.stream()
                .filter(b -> !"PAID".equalsIgnoreCase(b.getStatus()) && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal overdueAmount = userBills.stream()
                .filter(b -> b.getDueDate() != null && b.getDueDate().isBefore(today) && !"PAID".equalsIgnoreCase(b.getStatus()))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgPendingAmount = pendingBills > 0
                ? pendingAmount.divide(BigDecimal.valueOf(pendingBills), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long totalEvents = userEvents.size();
        long completedEvents = userEvents.stream()
                .filter(e -> "COMPLETED".equalsIgnoreCase(e.getStatus()))
                .count();
        long upcomingEvents = userEvents.stream()
                .filter(e -> !"COMPLETED".equalsIgnoreCase(e.getStatus()) && (e.getEventDate() != null && !e.getEventDate().isBefore(today)))
                .count();

        long totalReminders = reminderRepository.findByUserId(userId).size();
        long openSupport = supportRequestRepository.findByUserId(userId).stream()
                .filter(s -> "OPEN".equalsIgnoreCase(s.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(s.getStatus()))
                .count();
        long unreadNotifications = notificationRepository.countByUserIdAndStatus(userId, "SENT");

        return SummaryReportDTO.builder()
                .totalBills(totalBills)
                .overdueBills(overdueBills)
                .pendingBills(pendingBills)
                .paidBills(paidBills)
                .billsWithReceipts(billsWithReceipts)
                .totalEvents(totalEvents)
                .upcomingEvents(upcomingEvents)
                .completedEvents(completedEvents)
                .totalReminders(totalReminders)
                .openSupportRequests(openSupport)
                .unreadNotifications(unreadNotifications)
                .totalBillAmount(totalAmount)
                .overdueBillAmount(overdueAmount)
                .pendingBillAmount(pendingAmount)
                .avgPendingBillAmount(avgPendingAmount)
                .paidBillAmount(paidAmount)
                .build();
    }

    public List<Bill> getOverdueBills() {
        return billRepository.findByDueDateBeforeAndStatusNot(LocalDate.now(), "PAID");
    }

    public List<Event> getOverdueEvents() {
        return eventRepository.findByEventDateBefore(LocalDate.now());
    }

    public Map<String, Object> getOverdueItems() {
        Map<String, Object> items = new HashMap<>();
        items.put("overdueBills", getOverdueBills());
        items.put("overdueEvents", getOverdueEvents());
        return items;
    }

    public List<Bill> getMonthlyBills(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return billRepository.findByDueDateBetween(start, end);
    }

    public List<Bill> getBillsByDateRange(LocalDate start, LocalDate end) {
        if (start != null && end != null) {
            return billRepository.findByDueDateBetween(start, end);
        }
        return billRepository.findAll();
    }

    public List<Event> getEventsSummary(LocalDate start, LocalDate end) {
        if (start != null && end != null) {
            return eventRepository.findByEventDateBetween(start, end);
        }
        return eventRepository.findAll();
    }

    public String generateBillsCsv(List<Bill> bills) {
        StringBuilder csv = new StringBuilder();
        csv.append("Bill ID,Bill Name,Category,Amount (LKR),Due Date,Status,Paid Date,Receipt Attached,Recurring Pattern\n");
        for (Bill b : bills) {
            boolean hasReceipt = b.getReceiptUrl() != null && !b.getReceiptUrl().trim().isEmpty();
            csv.append(b.getId()).append(",")
               .append("\"").append(b.getBillName() != null ? b.getBillName().replace("\"", "\"\"") : "").append("\",")
               .append("\"").append(b.getCategory() != null ? b.getCategory() : "").append("\",")
               .append(b.getAmount() != null ? b.getAmount() : "0.00").append(",")
               .append(b.getDueDate() != null ? b.getDueDate().toString() : "").append(",")
               .append(b.getStatus() != null ? b.getStatus() : "").append(",")
               .append(b.getPaidDate() != null ? b.getPaidDate().toString() : "N/A").append(",")
               .append(hasReceipt ? "YES" : "NO").append(",")
               .append(b.getRecurringPattern() != null ? b.getRecurringPattern() : "NONE").append("\n");
        }
        return csv.toString();
    }
}
