package com.trackdue.repository;

import com.trackdue.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByCategory(String category);

    List<Bill> findByStatus(String status);

    List<Bill> findByDueDateBeforeAndStatusNot(LocalDate date, String status);

    List<Bill> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    long countByStatus(String status);

    long countByDueDateBeforeAndStatusNot(LocalDate date, String status);

    List<Bill> findByCreatedBy(Long createdBy);

    List<Bill> findByCreatedByAndDueDateBeforeAndStatusNot(Long createdBy, LocalDate date, String status);

    long countByCreatedBy(Long createdBy);

    long countByCreatedByAndDueDateBeforeAndStatusNot(Long createdBy, LocalDate date, String status);
}
