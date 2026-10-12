package com.trackdue.repository;

import com.trackdue.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCategory(String category);

    List<Event> findByStatus(String status);

    List<Event> findByEventDateGreaterThanEqual(LocalDate date);

    List<Event> findByEventDateBefore(LocalDate date);

    List<Event> findByEventDateBetween(LocalDate startDate, LocalDate endDate);

    long countByEventDateGreaterThanEqual(LocalDate date);

    List<Event> findByCreatedBy(Long createdBy);

    List<Event> findByCreatedByAndEventDateGreaterThanEqual(Long createdBy, LocalDate date);

    long countByCreatedBy(Long createdBy);

    long countByCreatedByAndEventDateGreaterThanEqual(Long createdBy, LocalDate date);
}
