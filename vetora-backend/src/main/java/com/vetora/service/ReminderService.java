package com.vetora.service;

import com.vetora.dto.ReminderRequestDTO;
import com.vetora.dto.ReminderResponseDTO;
import com.vetora.entity.Pet;
import com.vetora.entity.Reminder;
import com.vetora.entity.User;
import com.vetora.repository.PetRepository;
import com.vetora.repository.ReminderRepository;
import com.vetora.repository.UserRepository;
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

    public ReminderService(ReminderRepository reminderRepository,
                           PetRepository petRepository,
                           UserRepository userRepository,
                           EmailService emailService) {
        this.reminderRepository = reminderRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
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
                                              String petName, String doctorName) {
        try {
            Reminder reminder = new Reminder();
            reminder.setPet(pet);
            reminder.setDoctor(doctor);
            reminder.setType(Reminder.ReminderType.APPOINTMENT);
            reminder.setReminderDateTime(appointmentDateTime.minusHours(2));
            reminder.setMessage("⏰ Reminder: Appointment for " + petName +
                    " with Dr. " + doctorName + " at " + appointmentDateTime.toLocalTime() +
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

    @Transactional
    public void deleteAutoReminder(Long petId, Reminder.ReminderType type, String petName) {
        try {
            List<Reminder> reminders = reminderRepository.findByPetIdAndTypeAndIsActiveTrue(petId, type);
            for (Reminder reminder : reminders) {
                if (reminder.getMessage().contains(petName) ||
                        reminder.getMessage().contains("appointment for " + petName)) {
                    reminder.setIsActive(false);
                    reminderRepository.save(reminder);
                    logger.info("✅ Auto reminder deleted for: {}", petName);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Failed to delete auto reminder: {}", e.getMessage());
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

    @Scheduled(fixedDelay = 60000) // Runs every minute
    @Transactional
    public void sendPendingReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Reminder> reminders = reminderRepository.findByIsSentFalseAndIsActiveTrueAndReminderDateTimeBeforeOrderByReminderDateTimeAsc(now);

        for (Reminder reminder : reminders) {
            try {
                User owner = reminder.getPet().getOwner();
                String petName = reminder.getPet().getName();
                String doctorName = reminder.getDoctor().getName();
                String type = reminder.getType().toString();

                String subject = "⏰ VETORA - " + type + " Reminder for " + petName;
                String messageText = "Dear " + owner.getName() + ",\n\n" +
                        "⏰ This is a reminder regarding your pet " + petName + ".\n\n" +
                        "📋 Reminder Details:\n" +
                        "📌 Type: " + type + "\n" +
                        "📅 Date/Time: " + reminder.getReminderDateTime() + "\n" +
                        "👨‍⚕️ Doctor: Dr. " + doctorName + "\n" +
                        "📝 Message: " + reminder.getMessage() + "\n\n" +
                        "Please take necessary action.\n\n" +
                        "Best Regards,\n" +
                        "VETORA Team";

                emailService.sendReminderEmail(owner.getEmail(), subject, messageText);

                reminder.setIsSent(true);
                reminderRepository.save(reminder);

                // Handle recurring reminders
                if (reminder.getIsRecurring() && reminder.getRecurrenceInterval() != null) {
                    Reminder newReminder = new Reminder();
                    newReminder.setPet(reminder.getPet());
                    newReminder.setDoctor(reminder.getDoctor());
                    newReminder.setType(reminder.getType());
                    newReminder.setReminderDateTime(reminder.getReminderDateTime().plusDays(reminder.getRecurrenceInterval()));
                    newReminder.setMessage(reminder.getMessage());
                    newReminder.setIsRecurring(true);
                    newReminder.setRecurrenceInterval(reminder.getRecurrenceInterval());
                    newReminder.setIsSent(false);
                    newReminder.setIsActive(true);
                    reminderRepository.save(newReminder);
                }

                logger.info("✅ Reminder sent for pet: {}", petName);

            } catch (Exception e) {
                logger.error("❌ Failed to send reminder: {}", e.getMessage());
            }
        }
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
