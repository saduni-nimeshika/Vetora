package com.vetora.service;

import com.vetora.dto.ReminderRequestDTO;
import com.vetora.dto.ReminderResponseDTO;
import com.vetora.entity.Notification;
import com.vetora.entity.Pet;
import com.vetora.entity.Reminder;
import com.vetora.entity.User;
import com.vetora.repository.PetRepository;
import com.vetora.repository.ReminderRepository;
import com.vetora.repository.UserRepository;
import com.vetora.util.TextUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);
    private final ReminderRepository reminderRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // A reminder that is already this many hours overdue is skipped instead of
    // being sent late (e.g. after the server was switched off for a while).
    private static final long STALE_AFTER_HOURS = 24;

    public ReminderService(ReminderRepository reminderRepository,
                           PetRepository petRepository,
                           UserRepository userRepository,
                           EmailService emailService,
                           NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // ============================================================
    // MANUAL REMINDER (MEDICATION)
    // ============================================================

    @Transactional
    public ReminderResponseDTO createManualReminder(ReminderRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Reminder reminder = new Reminder();
        reminder.setPet(pet);
        reminder.setDoctor(doctor);
        reminder.setType(request.getType());
        reminder.setReminderDateTime(request.getReminderDateTime());
        reminder.setMessage(request.getMessage());
        reminder.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        reminder.setRecurrenceInterval(request.getRecurrenceInterval());
        reminder.setIsSent(false);
        reminder.setIsActive(true);

        Reminder savedReminder = reminderRepository.save(reminder);
        logger.info("✅ Manual reminder created for pet: {}", pet.getName());

        return convertToResponseDTO(savedReminder);
    }

    @Transactional
    public ReminderResponseDTO updateReminder(Long reminderId, ReminderRequestDTO request, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (!reminder.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only update your own reminders!");
        }

        reminder.setType(request.getType());
        reminder.setReminderDateTime(request.getReminderDateTime());
        reminder.setMessage(request.getMessage());
        reminder.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        reminder.setRecurrenceInterval(request.getRecurrenceInterval());

        Reminder updatedReminder = reminderRepository.save(reminder);
        logger.info("✅ Reminder updated: {}", reminderId);

        return convertToResponseDTO(updatedReminder);
    }

    // ============================================================
    // AUTO REMINDERS
    // ============================================================

    @Transactional
    public void createAutoAppointmentReminder(Pet pet, User doctor, LocalDateTime appointmentDateTime,
                                              String petName, String doctorName, Long appointmentId) {
        try {
            // Nothing to remind about if the appointment time has already passed
            if (!appointmentDateTime.isAfter(LocalDateTime.now())) {
                return;
            }
            Reminder reminder = new Reminder();
            reminder.setPet(pet);
            reminder.setDoctor(doctor);
            reminder.setAppointmentId(appointmentId);
            reminder.setType(Reminder.ReminderType.APPOINTMENT);
            reminder.setReminderDateTime(appointmentDateTime.minusHours(2));
            reminder.setMessage("⏰ Reminder: Appointment for " + petName +
                    " with " + TextUtils.doctorLabel(doctorName) + " at " + appointmentDateTime.toLocalTime() +
                    " on " + appointmentDateTime.toLocalDate());
            reminder.setIsSent(false);
            reminder.setIsActive(true);
            reminder.setIsRecurring(false);
            reminderRepository.save(reminder);
            logger.info("✅ Auto appointment reminder created for: {}", petName);
        } catch (Exception e) {
            logger.error("❌ Failed to create auto reminder: {}", e.getMessage());
        }
    }

    @Transactional
    public void createAutoVaccinationReminder(Pet pet, User doctor, LocalDateTime nextVaccinationDate,
                                              String petName, String vaccineName, String doctorName) {
        try {
            Reminder reminder = new Reminder();
            reminder.setPet(pet);
            reminder.setDoctor(doctor);
            reminder.setType(Reminder.ReminderType.VACCINATION);
            reminder.setReminderDateTime(nextVaccinationDate.minusDays(3));
            reminder.setMessage("💉 Reminder: " + petName + " needs " + vaccineName +
                    " vaccination on " + nextVaccinationDate.toLocalDate());
            reminder.setIsSent(false);
            reminder.setIsActive(true);
            reminder.setIsRecurring(false);
            reminderRepository.save(reminder);
            logger.info("✅ Auto vaccination reminder created for: {}", petName);
        } catch (Exception e) {
            logger.error("❌ Failed to create vaccination reminder: {}", e.getMessage());
        }
    }

    // Switch off the reminder(s) of ONE appointment (used when it is rejected or
    // cancelled). Matches by appointment id, so other appointments of the same
    // pet keep their reminders.
    @Transactional
    public void deactivateAppointmentReminders(Long appointmentId) {
        try {
            List<Reminder> reminders = reminderRepository.findByAppointmentIdAndIsActiveTrue(appointmentId);
            for (Reminder reminder : reminders) {
                reminder.setIsActive(false);
                reminderRepository.save(reminder);
            }
            logger.info("✅ {} reminder(s) switched off for appointment {}", reminders.size(), appointmentId);
        } catch (Exception e) {
            logger.error("❌ Failed to switch off reminders for appointment {}: {}", appointmentId, e.getMessage());
        }
    }

    // ============================================================
    // GET REMINDERS
    // ============================================================

    public List<ReminderResponseDTO> getRemindersByPet(Long petId) {
        List<Reminder> reminders = reminderRepository.findByPetIdAndIsActiveTrueOrderByReminderDateTimeAsc(petId);
        return reminders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReminderResponseDTO> getRemindersByPetForOwner(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet's reminders!");
        }

        return getRemindersByPet(petId);
    }

    // Upcoming reminders for a pet — only if the pet belongs to the caller
    public List<ReminderResponseDTO> getUpcomingRemindersForOwner(Long petId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet's reminders!");
        }

        return getUpcomingReminders(petId);
    }

    public List<ReminderResponseDTO> getMyReminders(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Reminder> reminders = reminderRepository.findByDoctorIdAndIsActiveTrueOrderByReminderDateTimeAsc(doctor.getId());
        return reminders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ReminderResponseDTO> getUpcomingReminders(Long petId) {
        List<Reminder> reminders = reminderRepository.findByPetIdAndIsActiveTrueAndIsSentFalseAndReminderDateTimeAfterOrderByReminderDateTimeAsc(
                petId, LocalDateTime.now());
        return reminders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // SCHEDULED REMINDER SENDING
    // ============================================================

    @Scheduled(fixedDelay = 60000) // Runs every minute (needs @EnableScheduling on the app class)
    @Transactional
    public void sendPendingReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Reminder> reminders = reminderRepository.findByIsSentFalseAndIsActiveTrueAndReminderDateTimeBeforeOrderByReminderDateTimeAsc(now);

        for (Reminder reminder : reminders) {
            try {
                boolean stale = reminder.getReminderDateTime().isBefore(now.minusHours(STALE_AFTER_HOURS));
                if (stale) {
                    logger.info("⏭️ Skipping stale reminder {} (was due {})", reminder.getId(), reminder.getReminderDateTime());
                } else {
                    deliverReminder(reminder);
                }

                reminder.setIsSent(true);
                reminderRepository.save(reminder);
                scheduleNextOccurrence(reminder, now);

            } catch (Exception e) {
                logger.error("❌ Failed to process reminder {}: {}", reminder.getId(), e.getMessage());
            }
        }
    }

    // Tell the pet owner: an in-app notification (bell icon) plus an email.
    // Each channel is tried on its own so one failing never blocks the other.
    private void deliverReminder(Reminder reminder) {
        User owner = reminder.getPet().getOwner();
        String petName = reminder.getPet().getName();
        String doctorName = reminder.getDoctor().getName();
        String type = reminder.getType().toString();

        // 1) In-app notification
        try {
            String niceType = type.substring(0, 1) + type.substring(1).toLowerCase();
            String link = reminder.getType() == Reminder.ReminderType.APPOINTMENT
                    ? "/owner/appointments"
                    : "/owner/pets/" + reminder.getPet().getId() + "?tab=reminders";
            notificationService.notifyUser(owner.getId(), Notification.NotificationType.REMINDER,
                    niceType + " reminder", reminder.getMessage(), link, reminder.getAppointmentId());
        } catch (Exception e) {
            logger.error("❌ In-app reminder notification failed: {}", e.getMessage());
        }

        // 2) Email
        try {
            String subject = "⏰ VETORA - " + type + " Reminder for " + petName;
            String messageText = "Dear " + owner.getName() + ",\n\n" +
                    "⏰ This is a reminder regarding your pet " + petName + ".\n\n" +
                    "📋 Reminder Details:\n" +
                    "📌 Type: " + type + "\n" +
                    "📅 Date/Time: " + reminder.getReminderDateTime() + "\n" +
                    "👨‍⚕️ Doctor: " + TextUtils.doctorLabel(doctorName) + "\n" +
                    "📝 Message: " + reminder.getMessage() + "\n\n" +
                    "Please take necessary action.\n\n" +
                    "Best Regards,\n" +
                    "VETORA Team";
            emailService.sendReminderEmail(owner.getEmail(), subject, messageText);
        } catch (Exception e) {
            logger.error("❌ Reminder email failed: {}", e.getMessage());
        }

        logger.info("✅ Reminder delivered for pet: {}", petName);
    }

    // Recurring reminders: queue the next one, always in the future (so a long
    // gap in server uptime can't cause a burst of catch-up reminders).
    private void scheduleNextOccurrence(Reminder reminder, LocalDateTime now) {
        Integer interval = reminder.getRecurrenceInterval();
        if (!Boolean.TRUE.equals(reminder.getIsRecurring()) || interval == null || interval <= 0) {
            return;
        }
        LocalDateTime next = reminder.getReminderDateTime();
        do {
            next = next.plusDays(interval);
        } while (!next.isAfter(now));

        Reminder newReminder = new Reminder();
        newReminder.setPet(reminder.getPet());
        newReminder.setDoctor(reminder.getDoctor());
        newReminder.setType(reminder.getType());
        newReminder.setReminderDateTime(next);
        newReminder.setMessage(reminder.getMessage());
        newReminder.setIsRecurring(true);
        newReminder.setRecurrenceInterval(interval);
        newReminder.setIsSent(false);
        newReminder.setIsActive(true);
        reminderRepository.save(newReminder);
    }

    // ============================================================
    // DELETE REMINDER
    // ============================================================

    @Transactional
    public void deleteReminder(Long reminderId, String email, boolean isAdmin) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        if (!isAdmin) {
            User doctor = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!reminder.getDoctor().getId().equals(doctor.getId())) {
                throw new RuntimeException("You can only delete your own reminders!");
            }
        }

        reminder.setIsActive(false);
        reminderRepository.save(reminder);
        logger.info("✅ Reminder deactivated: {}", reminderId);
    }

    // ============================================================
    // CONVERT TO DTO
    // ============================================================

    private ReminderResponseDTO convertToResponseDTO(Reminder reminder) {
        return new ReminderResponseDTO(
                reminder.getId(),
                reminder.getPet().getId(),
                reminder.getPet().getName(),
                reminder.getPet().getSpecies(),
                reminder.getDoctor().getId(),
                reminder.getDoctor().getName(),
                reminder.getType(),
                reminder.getReminderDateTime(),
                reminder.getMessage(),
                reminder.getIsSent(),
                reminder.getIsRecurring(),
                reminder.getRecurrenceInterval(),
                reminder.getIsActive(),
                reminder.getCreatedAt(),
                reminder.getUpdatedAt()
        );
    }
}



