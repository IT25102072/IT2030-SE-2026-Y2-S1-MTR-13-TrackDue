package com.trackdue.repository;

import com.trackdue.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserId(Long userId);

    List<Reminder> findByReminderDateGreaterThanEqual(LocalDate date);

    List<Reminder> findByReminderDateLessThanEqualAndStatus(LocalDate date, String status);

    List<Reminder> findByStatus(String status);

    List<Reminder> findByBillId(Long billId);

    List<Reminder> findByEventId(Long eventId);

    void deleteByBillId(Long billId);

    void deleteByEventId(Long eventId);
}
