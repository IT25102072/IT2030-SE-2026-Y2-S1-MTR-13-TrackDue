package com.trackdue.service;

import com.trackdue.entity.Bill;
import com.trackdue.exception.ResourceNotFoundException;
import com.trackdue.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BillService {

    private final BillRepository repository;
    private final HistoryService historyService;

    public BillService(BillRepository repository, HistoryService historyService) {
        this.repository = repository;
        this.historyService = historyService;
    }

    public Bill create(Bill bill, Long userId, String userName) {
        if (bill.getStatus() == null) {
            bill.setStatus("PENDING");
        }
        if (bill.getDueDate() != null && bill.getDueDate().isBefore(LocalDate.now()) && !"PAID".equalsIgnoreCase(bill.getStatus())) {
            bill.setStatus("OVERDUE");
        }
        bill.setCreatedBy(userId);
        Bill saved = repository.save(bill);

        historyService.log(userId, userName, "CREATE", "BILL", saved.getId(),
                "Added new bill: " + saved.getBillName() + " (" + saved.getCategory() + ") - LKR " + saved.getAmount());

        return saved;
    }

    public List<Bill> getAll() {
        List<Bill> bills = repository.findAll();
        LocalDate today = LocalDate.now();
        boolean changed = false;
        for (Bill b : bills) {
            if ("PENDING".equalsIgnoreCase(b.getStatus()) && b.getDueDate().isBefore(today)) {
                b.setStatus("OVERDUE");
                changed = true;
            }
        }
        if (changed) {
            repository.saveAll(bills);
        }
        return bills;
    }

    public List<Bill> getByUser(Long userId) {
        if (userId == null) {
            return List.of();
        }
        List<Bill> bills = repository.findByCreatedBy(userId);
        LocalDate today = LocalDate.now();
        boolean changed = false;
        for (Bill b : bills) {
            if ("PENDING".equalsIgnoreCase(b.getStatus()) && b.getDueDate().isBefore(today)) {
                b.setStatus("OVERDUE");
                changed = true;
            }
        }
        if (changed) {
            repository.saveAll(bills);
        }
        return bills;
    }

    public Bill getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
    }

    public Bill update(Long id, Bill newData, Long userId, String userName) {
        Bill bill = getById(id);
        bill.setBillName(newData.getBillName());
        bill.setDescription(newData.getDescription());
        bill.setCategory(newData.getCategory());
        bill.setAmount(newData.getAmount());
        bill.setDueDate(newData.getDueDate());
        bill.setRecurringPattern(newData.getRecurringPattern());

        if (newData.getReceiptUrl() != null) {
            bill.setReceiptUrl(newData.getReceiptUrl());
        }
        if (newData.getPaidDate() != null) {
            bill.setPaidDate(newData.getPaidDate());
        }

        if (newData.getStatus() != null) {
            bill.setStatus(newData.getStatus());
            if ("PAID".equalsIgnoreCase(newData.getStatus()) && bill.getPaidDate() == null) {
                bill.setPaidDate(LocalDate.now());
            }
        }
        if (bill.getDueDate().isBefore(LocalDate.now()) && !"PAID".equalsIgnoreCase(bill.getStatus())) {
            bill.setStatus("OVERDUE");
        }

        Bill saved = repository.save(bill);

        historyService.log(userId, userName, "UPDATE", "BILL", saved.getId(),
                "Updated bill: " + saved.getBillName() + " - Status: " + saved.getStatus());

        return saved;
    }

    public Bill markAsPaid(Long id, String receiptUrl, LocalDate paidDate, Long userId, String userName) {
        Bill bill = getById(id);
        bill.setStatus("PAID");
        bill.setPaidDate(paidDate != null ? paidDate : LocalDate.now());
        if (receiptUrl != null && !receiptUrl.trim().isEmpty()) {
            bill.setReceiptUrl(receiptUrl.trim());
        }
        Bill saved = repository.save(bill);

        historyService.log(userId, userName, "STATUS_CHANGE", "BILL", saved.getId(),
                "Marked bill as PAID: " + saved.getBillName() + (receiptUrl != null ? " (Receipt Attached)" : ""));

        return saved;
    }

    public Bill markAsPaid(Long id, Long userId, String userName) {
        return markAsPaid(id, null, LocalDate.now(), userId, userName);
    }

    public Bill attachReceipt(Long id, String receiptUrl, Long userId, String userName) {
        Bill bill = getById(id);
        bill.setReceiptUrl(receiptUrl);
        Bill saved = repository.save(bill);

        historyService.log(userId, userName, "UPDATE", "BILL", saved.getId(),
                "Attached payment receipt to bill: " + saved.getBillName());

        return saved;
    }

    public void delete(Long id, Long userId, String userName) {
        Bill bill = getById(id);
        String name = bill.getBillName();
        repository.delete(bill);

        historyService.log(userId, userName, "DELETE", "BILL", id,
                "Deleted bill: " + name);
    }

    public List<Bill> getByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<Bill> getByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Bill> getOverdueBills() {
        return repository.findByDueDateBeforeAndStatusNot(LocalDate.now(), "PAID");
    }
}
