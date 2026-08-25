package com.vetora.repository;

import com.vetora.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    // Find all reminders for a pet (active only)
    List<Reminder> findByPetIdAndIsActiveTrueOrderByReminderDateTimeAsc(Long petId);

    // Find all reminders by doctor
    List<Reminder> findByDoctorIdAndIsActiveTrueOrderByReminderDateTimeAsc(Long doctorId);

    // Find reminders by type
    List<Reminder> findByTypeAndIsActiveTrue(Reminder.ReminderType type);

    // Find reminders that need to be sent (not sent, active, time <= now)
    List<Reminder> findByIsSentFalseAndIsActiveTrueAndReminderDateTimeBeforeOrderByReminderDateTimeAsc(LocalDateTime now);

    // Find reminders for a pet by type
    List<Reminder> findByPetIdAndTypeAndIsActiveTrue(Long petId, Reminder.ReminderType type);

    // Find upcoming reminders (not sent, future)
    List<Reminder> findByPetIdAndIsActiveTrueAndIsSentFalseAndReminderDateTimeAfterOrderByReminderDateTimeAsc(
            Long petId, LocalDateTime now);
}