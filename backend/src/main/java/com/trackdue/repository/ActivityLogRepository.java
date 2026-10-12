package com.trackdue.repository;

import com.trackdue.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findAllByOrderByCreatedAtDesc();

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ActivityLog> findByModuleOrderByCreatedAtDesc(String module);

    List<ActivityLog> findByActionOrderByCreatedAtDesc(String action);

    List<ActivityLog> findByDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String description);

    List<ActivityLog> findByModuleAndActionOrderByCreatedAtDesc(String module, String action);
}
