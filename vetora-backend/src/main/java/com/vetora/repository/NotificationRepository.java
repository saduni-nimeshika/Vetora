package com.vetora.repository;

import com.vetora.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Latest notifications for a user (newest first) — what the bell dropdown shows
    List<Notification> findTop30ByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}
