package com.trackdue.repository;

import com.trackdue.entity.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {

    List<SupportRequest> findByStatus(String status);

    List<SupportRequest> findByUserId(Long userId);

    List<SupportRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
