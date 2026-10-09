package com.trackdue.controller;

import com.trackdue.dto.SummaryReportDTO;
import com.trackdue.entity.Bill;
import com.trackdue.entity.Event;
import com.trackdue.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryReportDTO> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }

    @GetMapping("/summary/user/{userId}")
    public ResponseEntity<SummaryReportDTO> getSummaryByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getSummaryByUser(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> getOverdueItems() {
        return ResponseEntity.ok(reportService.getOverdueItems());
    }

    @GetMapping("/overdue-bills")
    public ResponseEntity<List<Bill>> getOverdueBills() {
        return ResponseEntity.ok(reportService.getOverdueBills());
    }

    @GetMapping("/overdue-events")
    public ResponseEntity<List<Event>> getOverdueEvents() {
        return ResponseEntity.ok(reportService.getOverdueEvents());
    }

    @GetMapping("/monthly-bills")
    public ResponseEntity<List<Bill>> getMonthlyBills(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int y = (year != null) ? year : now.getYear();
        int m = (month != null) ? month : now.getMonthValue();
        return ResponseEntity.ok(reportService.getMonthlyBills(y, m));
    }

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getBillsByRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getBillsByDateRange(startDate, endDate));
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEventsSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getEventsSummary(startDate, endDate));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false, defaultValue = "bills") String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<Bill> bills = reportService.getBillsByDateRange(startDate, endDate);
        String csvContent = reportService.generateBillsCsv(bills);

        byte[] output = csvContent.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"TrackDue_Report_" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }
}
