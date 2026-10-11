package com.trackdue.repository;

import com.trackdue.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByUserId(Long userId);

    List<Feedback> findByType(String type);

    List<Feedback> findByRating(Integer rating);
}
