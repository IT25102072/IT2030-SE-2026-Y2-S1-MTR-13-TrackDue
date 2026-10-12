package com.trackdue.repository;

import com.trackdue.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByTypeAndUserId(String type, Long userId);
    Optional<NotificationTemplate> findByTypeAndUserIdIsNull(String type);
    List<NotificationTemplate> findByUserId(Long userId);
    List<NotificationTemplate> findByUserIdIsNull();
}
