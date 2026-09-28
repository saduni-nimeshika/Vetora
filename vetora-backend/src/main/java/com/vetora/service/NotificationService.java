package com.vetora.service;

import com.vetora.dto.NotificationResponseDTO;
import com.vetora.entity.Notification;
import com.vetora.entity.User;
import com.vetora.repository.NotificationRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ✅ Create a notification for a user. Runs in its OWN transaction so that a
    // problem here can never roll back the booking / approval that triggered it.
    // Callers wrap this in try/catch.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyUser(Long userId, Notification.NotificationType type, String title,
                           String message, String link, Long appointmentId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            logger.warn("⚠️ Notification skipped — user {} not found", userId);
            return;
        }
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setLink(link);
        n.setAppointmentId(appointmentId);
        n.setIsRead(false);
        notificationRepository.save(n);
        logger.info("🔔 Notification [{}] created for user {}", type, userId);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ Latest notifications for the logged-in user
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyNotifications(String email) {
        User user = findUser(email);
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDescIdDesc(user.getId())
                .stream()
                .map(NotificationResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = findUser(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    // ✅ Mark one notification as read (only the owner of it can do this)
    @Transactional
    public void markRead(Long notificationId, String email) {
        User user = findUser(email);
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("This notification is not yours");
        }
        if (!Boolean.TRUE.equals(n.getIsRead())) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
    }

    @Transactional
    public void markAllRead(String email) {
        User user = findUser(email);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}

