package com.trackdue.repository;

import com.trackdue.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);

    List<Notification> findAllByOrderBySentAtDesc();

    long countByUserIdAndStatus(Long userId, String status);

    long countByStatus(String status);
}
