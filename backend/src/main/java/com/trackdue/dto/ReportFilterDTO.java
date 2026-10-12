package com.trackdue.dto;

import java.time.LocalDate;

public class ReportFilterDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private String category;
    private String status;
    private String reportType; // MONTHLY, OVERDUE, SUMMARY, EVENT_SUMMARY

    public ReportFilterDTO() {}

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
}
