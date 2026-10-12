package com.trackdue.controller;

import com.trackdue.entity.Bill;
import com.trackdue.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    public ResponseEntity<Bill> create(
            @RequestBody Bill bill,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        return ResponseEntity.ok(billService.create(bill, userId, userName));
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAll() {
        return ResponseEntity.ok(billService.getAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Bill>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(billService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> update(
            @PathVariable Long id,
            @RequestBody Bill bill,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        return ResponseEntity.ok(billService.update(id, bill, userId, userName));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Bill> markAsPaid(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        String receiptUrl = (body != null) ? body.get("receiptUrl") : null;
        java.time.LocalDate paidDate = null;
        if (body != null && body.get("paidDate") != null && !body.get("paidDate").trim().isEmpty()) {
            try {
                paidDate = java.time.LocalDate.parse(body.get("paidDate").trim());
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(billService.markAsPaid(id, receiptUrl, paidDate, userId, userName));
    }

    @PutMapping("/{id}/receipt")
    public ResponseEntity<Bill> attachReceipt(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        String receiptUrl = (body != null) ? body.get("receiptUrl") : null;
        return ResponseEntity.ok(billService.attachReceipt(id, receiptUrl, userId, userName));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        billService.delete(id, userId, userName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Bill>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(billService.getByCategory(category));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Bill>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(billService.getByStatus(status));
    }
}
