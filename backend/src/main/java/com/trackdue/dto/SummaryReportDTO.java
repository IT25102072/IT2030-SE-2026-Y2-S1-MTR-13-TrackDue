package com.trackdue.dto;

import java.math.BigDecimal;

public class SummaryReportDTO {
    private long totalBills;
    private long overdueBills;
    private long pendingBills;
    private long paidBills;
    private long billsWithReceipts;
    private long totalEvents;
    private long upcomingEvents;
    private long completedEvents;
    private long totalReminders;
    private long openSupportRequests;
    private long unreadNotifications;
    private BigDecimal totalBillAmount;
    private BigDecimal overdueBillAmount;
    private BigDecimal pendingBillAmount;
    private BigDecimal avgPendingBillAmount;
    private BigDecimal paidBillAmount;

    public SummaryReportDTO() {}

    public SummaryReportDTO(long totalBills, long overdueBills, long pendingBills, long paidBills, long billsWithReceipts,
                            long totalEvents, long upcomingEvents, long completedEvents, long totalReminders,
                            long openSupportRequests, long unreadNotifications, BigDecimal totalBillAmount,
                            BigDecimal overdueBillAmount, BigDecimal pendingBillAmount, BigDecimal avgPendingBillAmount,
                            BigDecimal paidBillAmount) {
        this.totalBills = totalBills;
        this.overdueBills = overdueBills;
        this.pendingBills = pendingBills;
        this.paidBills = paidBills;
        this.billsWithReceipts = billsWithReceipts;
        this.totalEvents = totalEvents;
        this.upcomingEvents = upcomingEvents;
        this.completedEvents = completedEvents;
        this.totalReminders = totalReminders;
        this.openSupportRequests = openSupportRequests;
        this.unreadNotifications = unreadNotifications;
        this.totalBillAmount = totalBillAmount;
        this.overdueBillAmount = overdueBillAmount;
        this.pendingBillAmount = pendingBillAmount;
        this.avgPendingBillAmount = avgPendingBillAmount;
        this.paidBillAmount = paidBillAmount;
    }

    public static SummaryReportDTOBuilder builder() {
        return new SummaryReportDTOBuilder();
    }

    public static class SummaryReportDTOBuilder {
        private long totalBills;
        private long overdueBills;
        private long pendingBills;
        private long paidBills;
        private long billsWithReceipts;
        private long totalEvents;
        private long upcomingEvents;
        private long completedEvents;
        private long totalReminders;
        private long openSupportRequests;
        private long unreadNotifications;
        private BigDecimal totalBillAmount = BigDecimal.ZERO;
        private BigDecimal overdueBillAmount = BigDecimal.ZERO;
        private BigDecimal pendingBillAmount = BigDecimal.ZERO;
        private BigDecimal avgPendingBillAmount = BigDecimal.ZERO;
        private BigDecimal paidBillAmount = BigDecimal.ZERO;

        public SummaryReportDTOBuilder totalBills(long totalBills) { this.totalBills = totalBills; return this; }
        public SummaryReportDTOBuilder overdueBills(long overdueBills) { this.overdueBills = overdueBills; return this; }
        public SummaryReportDTOBuilder pendingBills(long pendingBills) { this.pendingBills = pendingBills; return this; }
        public SummaryReportDTOBuilder paidBills(long paidBills) { this.paidBills = paidBills; return this; }
        public SummaryReportDTOBuilder billsWithReceipts(long billsWithReceipts) { this.billsWithReceipts = billsWithReceipts; return this; }
        public SummaryReportDTOBuilder totalEvents(long totalEvents) { this.totalEvents = totalEvents; return this; }
        public SummaryReportDTOBuilder upcomingEvents(long upcomingEvents) { this.upcomingEvents = upcomingEvents; return this; }
        public SummaryReportDTOBuilder completedEvents(long completedEvents) { this.completedEvents = completedEvents; return this; }
        public SummaryReportDTOBuilder totalReminders(long totalReminders) { this.totalReminders = totalReminders; return this; }
        public SummaryReportDTOBuilder openSupportRequests(long openSupportRequests) { this.openSupportRequests = openSupportRequests; return this; }
        public SummaryReportDTOBuilder unreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; return this; }
        public SummaryReportDTOBuilder totalBillAmount(BigDecimal totalBillAmount) { this.totalBillAmount = totalBillAmount; return this; }
        public SummaryReportDTOBuilder overdueBillAmount(BigDecimal overdueBillAmount) { this.overdueBillAmount = overdueBillAmount; return this; }
        public SummaryReportDTOBuilder pendingBillAmount(BigDecimal pendingBillAmount) { this.pendingBillAmount = pendingBillAmount; return this; }
        public SummaryReportDTOBuilder avgPendingBillAmount(BigDecimal avgPendingBillAmount) { this.avgPendingBillAmount = avgPendingBillAmount; return this; }
        public SummaryReportDTOBuilder paidBillAmount(BigDecimal paidBillAmount) { this.paidBillAmount = paidBillAmount; return this; }

        public SummaryReportDTO build() {
            return new SummaryReportDTO(totalBills, overdueBills, pendingBills, paidBills, billsWithReceipts,
                    totalEvents, upcomingEvents, completedEvents, totalReminders, openSupportRequests,
                    unreadNotifications, totalBillAmount, overdueBillAmount, pendingBillAmount, avgPendingBillAmount, paidBillAmount);
        }
    }

    public long getTotalBills() { return totalBills; }
    public void setTotalBills(long totalBills) { this.totalBills = totalBills; }
    public long getOverdueBills() { return overdueBills; }
    public void setOverdueBills(long overdueBills) { this.overdueBills = overdueBills; }
    public long getPendingBills() { return pendingBills; }
    public void setPendingBills(long pendingBills) { this.pendingBills = pendingBills; }
    public long getPaidBills() { return paidBills; }
    public void setPaidBills(long paidBills) { this.paidBills = paidBills; }
    public long getBillsWithReceipts() { return billsWithReceipts; }
    public void setBillsWithReceipts(long billsWithReceipts) { this.billsWithReceipts = billsWithReceipts; }
    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }
    public long getUpcomingEvents() { return upcomingEvents; }
    public void setUpcomingEvents(long upcomingEvents) { this.upcomingEvents = upcomingEvents; }
    public long getCompletedEvents() { return completedEvents; }
    public void setCompletedEvents(long completedEvents) { this.completedEvents = completedEvents; }
    public long getTotalReminders() { return totalReminders; }
    public void setTotalReminders(long totalReminders) { this.totalReminders = totalReminders; }
    public long getOpenSupportRequests() { return openSupportRequests; }
    public void setOpenSupportRequests(long openSupportRequests) { this.openSupportRequests = openSupportRequests; }
    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }
    public BigDecimal getTotalBillAmount() { return totalBillAmount; }
    public void setTotalBillAmount(BigDecimal totalBillAmount) { this.totalBillAmount = totalBillAmount; }
    public BigDecimal getOverdueBillAmount() { return overdueBillAmount; }
    public void setOverdueBillAmount(BigDecimal overdueBillAmount) { this.overdueBillAmount = overdueBillAmount; }
    public BigDecimal getPendingBillAmount() { return pendingBillAmount; }
    public void setPendingBillAmount(BigDecimal pendingBillAmount) { this.pendingBillAmount = pendingBillAmount; }
    public BigDecimal getAvgPendingBillAmount() { return avgPendingBillAmount; }
    public void setAvgPendingBillAmount(BigDecimal avgPendingBillAmount) { this.avgPendingBillAmount = avgPendingBillAmount; }
    public BigDecimal getPaidBillAmount() { return paidBillAmount; }
    public void setPaidBillAmount(BigDecimal paidBillAmount) { this.paidBillAmount = paidBillAmount; }
}
