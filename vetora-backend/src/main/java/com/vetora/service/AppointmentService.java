package com.vetora.service;

import com.vetora.dto.AppointmentRequestDTO;
import com.vetora.dto.AppointmentResponseDTO;
import com.vetora.entity.Appointment;
import com.vetora.entity.Doctor;
import java.util.Optional;
import com.vetora.entity.Notification;
import com.vetora.entity.Pet;
import com.vetora.entity.Reminder;
import com.vetora.entity.User;
import com.vetora.repository.AppointmentRepository;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.PetRepository;
import com.vetora.repository.ReminderRepository;
import com.vetora.repository.UserRepository;
import com.vetora.util.TextUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;
    private final ReminderRepository reminderRepository;
    private final ReminderService reminderService;   // ✅ Add this
    private final NotificationService notificationService;
    private final DoctorAvailabilityService availabilityService;

    // ✅ Constructor - හරියට
    public AppointmentService(AppointmentRepository appointmentRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              DoctorRepository doctorRepository,
                              EmailService emailService,
                              ReminderRepository reminderRepository,
                              ReminderService reminderService,
                              NotificationService notificationService,
                              DoctorAvailabilityService availabilityService) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.emailService = emailService;
        this.reminderRepository = reminderRepository;
        this.reminderService = reminderService;   // ✅ Add this
        this.notificationService = notificationService;
        this.availabilityService = availabilityService;
    }

    // ============================================================
    // NOTIFICATION / SIDE-EFFECT HELPERS
    // ============================================================

    // Create an in-app notification without ever letting a failure here break
    // the appointment action that triggered it.
    private void safeNotify(User recipient, Notification.NotificationType type, String title,
                            String message, String link, Long appointmentId) {
        try {
            if (recipient != null) {
                notificationService.notifyUser(recipient.getId(), type, title, message, link, appointmentId);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to create in-app notification: {}", e.getMessage());
        }
    }

    private String describe(Appointment appointment) {
        return appointment.getPet().getName() + " on "
                + TextUtils.whenLabel(appointment.getAppointmentDate(), appointment.getAppointmentTime());
    }

    // Doctor accepted → email + bell notification to the pet owner, and the
    // 2-hour-before reminder is created now (only confirmed appointments get one)
    private void handleApproved(Appointment appointment, User doctor) {
        Pet pet = appointment.getPet();
        User owner = pet.getOwner();

        try {
            emailService.sendAppointmentApproved(owner.getEmail(), owner.getName(),
                    pet.getName(), doctor.getName(),
                    appointment.getAppointmentDate(), appointment.getAppointmentTime(),
                    appointment.getNotes());
        } catch (Exception e) {
            logger.error("❌ Failed to send approval email: {}", e.getMessage());
        }

        try {
            reminderService.createAutoAppointmentReminder(pet, doctor,
                    appointment.getAppointmentDate().atTime(appointment.getAppointmentTime()),
                    pet.getName(), doctor.getName(), appointment.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to create auto reminder: {}", e.getMessage());
        }

        safeNotify(owner, Notification.NotificationType.APPOINTMENT_APPROVED,
                "Appointment accepted",
                TextUtils.doctorLabel(doctor.getName()) + " accepted your appointment for " + describe(appointment) + ".",
                "/owner/appointments", appointment.getId());
    }

    // Doctor rejected → email + bell notification (with the reason) to the pet owner
    private void handleRejected(Appointment appointment, User doctor) {
        Pet pet = appointment.getPet();
        User owner = pet.getOwner();
        String reason = appointment.getRejectionReason();

        reminderService.deactivateAppointmentReminders(appointment.getId());

        try {
            emailService.sendAppointmentRejected(owner.getEmail(), owner.getName(),
                    pet.getName(), doctor.getName(),
                    appointment.getAppointmentDate(), appointment.getAppointmentTime(),
                    reason);
        } catch (Exception e) {
            logger.error("❌ Failed to send rejection email: {}", e.getMessage());
        }

        boolean hasReason = reason != null && !reason.isBlank() && !"No reason provided".equals(reason);
        safeNotify(owner, Notification.NotificationType.APPOINTMENT_REJECTED,
                "Appointment rejected",
                TextUtils.doctorLabel(doctor.getName()) + " could not accept your appointment for "
                        + describe(appointment) + "." + (hasReason ? " Reason: " + reason : ""),
                "/owner/appointments", appointment.getId());
    }

    // Doctor marked it completed → bell notification to the pet owner
    private void handleCompleted(Appointment appointment, User doctor) {
        reminderService.deactivateAppointmentReminders(appointment.getId());
        safeNotify(appointment.getPet().getOwner(), Notification.NotificationType.APPOINTMENT_COMPLETED,
                "Appointment completed",
                "Your appointment for " + describe(appointment) + " with "
                        + TextUtils.doctorLabel(doctor.getName()) + " is completed. You can now rate the doctor.",
                "/owner/appointments", appointment.getId());
    }

    // ✅ Book Appointment (Pet Owner)
    @Transactional
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You don't have access to this pet!");
        }

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Doctor doctorProfile = doctorRepository.findByUser(doctor)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        if (!doctorProfile.isApproved()) {
            throw new RuntimeException("Doctor is not approved yet!");
        }

        // The appointment must be in the future
        LocalDateTime requested = LocalDateTime.of(request.getAppointmentDate(), request.getAppointmentTime());
        if (!requested.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Please choose a date and time in the future.");
        }

        // The doctor must actually work at that date/time (weekly pattern, leave and special days)
        String timeText = request.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        if (!availabilityService.isSlotAvailable(doctorProfile.getId(), request.getAppointmentDate(), timeText)) {
            throw new RuntimeException("The doctor is not available at that date and time. "
                    + "Please pick a time from the availability calendar.");
        }

        // Check if slot is available (cancelled and rejected appointments free the slot again)
        boolean slotBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNotIn(
                request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime(),
                List.of(Appointment.AppointmentStatus.CANCELLED, Appointment.AppointmentStatus.REJECTED));

        if (slotBooked) {
            throw new RuntimeException("This time slot is already booked!");
        }

        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notifications
        try {
            emailService.sendAppointmentRequestReceived(owner.getEmail(), owner.getName(),
                    pet.getName(), doctor.getName(),
                    request.getAppointmentDate(), request.getAppointmentTime());

            emailService.sendNewAppointmentRequest(doctor.getEmail(), doctor.getName(),
                    pet.getName(), owner.getName(),
                    request.getAppointmentDate(), request.getAppointmentTime(),
                    savedAppointment.getId());

            logger.info("✅ Appointment booked and notifications sent");
        } catch (Exception e) {
            logger.error("❌ Failed to send appointment emails: {}", e.getMessage());
        }

        // 🔔 Automatic in-app notification to the doctor. (The appointment
        // reminder is created later, once the doctor accepts.)
        safeNotify(doctor, Notification.NotificationType.APPOINTMENT_REQUESTED,
                "New appointment request",
                owner.getName() + " booked an appointment for " + pet.getName() + " on "
                        + TextUtils.whenLabel(request.getAppointmentDate(), request.getAppointmentTime()) + ".",
                "/doctor/appointments", savedAppointment.getId());

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Approve Appointment (Doctor)
    @Transactional
    public AppointmentResponseDTO approveAppointment(Long appointmentId, String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only approve your own appointments!");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("This appointment is not pending!");
        }

        appointment.setStatus(Appointment.AppointmentStatus.APPROVED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        handleApproved(savedAppointment, doctor);
        logger.info("✅ Appointment approved");

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Reject Appointment (Doctor)
    @Transactional
    public AppointmentResponseDTO rejectAppointment(Long appointmentId, String doctorEmail, String reason) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only reject your own appointments!");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("This appointment is not pending!");
        }

        appointment.setStatus(Appointment.AppointmentStatus.REJECTED);
        appointment.setRejectionReason(reason != null && !reason.isBlank() ? reason : "No reason provided");
        Appointment savedAppointment = appointmentRepository.save(appointment);

        handleRejected(savedAppointment, doctor);
        logger.info("✅ Appointment rejected");

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Cancel Appointment (Pet Owner)
    @Transactional
    public AppointmentResponseDTO cancelAppointment(Long appointmentId, String ownerEmail, String reason) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPet().getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You can only cancel your own appointments!");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment!");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled!");
        }

        // Only PENDING or APPROVED appointments can be cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.REJECTED) {
            throw new RuntimeException("The doctor already rejected this appointment, so there is nothing to cancel.");
        }

        // A visit that is already in the past cannot be cancelled any more
        if (LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime())
                .isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This appointment time has already passed, so it can no longer be cancelled.");
        }

        String cleanReason = cleanReason(reason);
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cleanReason);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Switch off this appointment's reminder (only this one)
        reminderService.deactivateAppointmentReminders(appointment.getId());

        // 🔔 Automatic in-app notification to the doctor
        safeNotify(appointment.getDoctor(), Notification.NotificationType.APPOINTMENT_CANCELLED,
                "Appointment cancelled",
                owner.getName() + " cancelled the appointment for " + describe(appointment) + "."
                        + (cleanReason != null ? " Reason: " + cleanReason : ""),
                "/doctor/appointments", appointment.getId());

        // ✅ Send cancellation email to doctor
        try {
            User doctor = appointment.getDoctor();
            emailService.sendAppointmentCancelledToDoctor(
                    doctor.getEmail(),
                    doctor.getName(),
                    appointment.getPet().getName(),
                    owner.getName(),
                    appointment.getAppointmentDate(),
                    appointment.getAppointmentTime()
            );
            logger.info("✅ Appointment cancelled and notification sent to doctor");
        } catch (Exception e) {
            logger.error("❌ Failed to send cancellation email to doctor: {}", e.getMessage());
        }

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Cancel an APPROVED appointment (Doctor) — notifies the pet owner by bell and e-mail
    @Transactional
    public AppointmentResponseDTO cancelAppointmentByDoctor(Long appointmentId, String doctorEmail, String reason) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only cancel your own appointments!");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("This request is still pending. Use Reject instead of Cancel.");
        }
        if (appointment.getStatus() != Appointment.AppointmentStatus.APPROVED) {
            throw new RuntimeException("Only approved appointments can be cancelled.");
        }
        if (LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime())
                .isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This appointment time has already passed, so it can no longer be cancelled.");
        }

        String cleanReason = cleanReason(reason);
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cleanReason);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        reminderService.deactivateAppointmentReminders(appointment.getId());

        Pet pet = appointment.getPet();
        User owner = pet.getOwner();

        safeNotify(owner, Notification.NotificationType.APPOINTMENT_CANCELLED,
                "Appointment cancelled by the doctor",
                TextUtils.doctorLabel(doctor.getName()) + " cancelled your appointment for " + describe(appointment) + "."
                        + (cleanReason != null ? " Reason: " + cleanReason : ""),
                "/owner/appointments", appointment.getId());

        try {
            emailService.sendAppointmentCancelledToOwner(owner.getEmail(), owner.getName(), pet.getName(),
                    doctor.getName(), appointment.getAppointmentDate(), appointment.getAppointmentTime(), cleanReason);
        } catch (Exception e) {
            logger.error("❌ Failed to send cancellation email to owner: {}", e.getMessage());
        }

        return convertToResponseDTO(savedAppointment);
    }

    // Trim a free-text reason and keep it within the column size (null when empty)
    private String cleanReason(String reason) {
        if (reason == null) return null;
        String r = reason.trim();
        if (r.isEmpty()) return null;
        return r.length() > 250 ? r.substring(0, 250) : r;
    }

    // ✅ Get Appointments by Owner
    public List<AppointmentResponseDTO> getAppointmentsByOwner(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Appointment> appointments = appointmentRepository.findByPetOwnerIdOrderByAppointmentDateTimeDesc(owner.getId());
        return appointments.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get Appointments by Doctor
    public List<AppointmentResponseDTO> getAppointmentsByDoctor(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctor.getId());
        return appointments.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get Pending Appointments by Doctor
    public List<AppointmentResponseDTO> getPendingAppointmentsByDoctor(String doctorEmail) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndStatusOrderByCreatedAtAsc(
                doctor.getId(), Appointment.AppointmentStatus.PENDING);
        return appointments.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ Get Appointment by ID
    public AppointmentResponseDTO getAppointmentById(Long appointmentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        boolean isOwner = appointment.getPet().getOwner().getId().equals(user.getId());
        boolean isDoctor = appointment.getDoctor().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isOwner && !isDoctor && !isAdmin) {
            throw new RuntimeException("You don't have access to this appointment!");
        }

        return convertToResponseDTO(appointment);
    }

    // ✅ Admin: Get all appointments
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    // ✅ UPDATE APPOINTMENT STATUS - මෙය Add කරන්න!
    @Transactional
    public AppointmentResponseDTO updateAppointmentStatus(Long appointmentId, String doctorEmail, String status) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Check if this doctor owns this appointment
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only update your own appointments!");
        }

        // Convert status string to enum
        Appointment.AppointmentStatus newStatus;
        try {
            newStatus = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Allowed: APPROVED, REJECTED, COMPLETED");
        }

        if (newStatus != Appointment.AppointmentStatus.APPROVED
                && newStatus != Appointment.AppointmentStatus.REJECTED
                && newStatus != Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Invalid status: " + status + ". Allowed: APPROVED, REJECTED, COMPLETED");
        }

        // Check if appointment is cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot update a cancelled appointment!");
        }

        // Check if appointment is already completed
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Appointment is already completed!");
        }

        // Same status again would only re-send the notification
        if (appointment.getStatus() == newStatus) {
            throw new RuntimeException("Appointment is already " + newStatus.name().toLowerCase() + "!");
        }

        // Valid moves: PENDING -> APPROVED / REJECTED, APPROVED -> COMPLETED
        if (newStatus == Appointment.AppointmentStatus.APPROVED
                && appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be approved.");
        }
        if (newStatus == Appointment.AppointmentStatus.REJECTED
                && appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be rejected. To call off an approved appointment, use Cancel.");
        }
        if (newStatus == Appointment.AppointmentStatus.COMPLETED) {
            if (appointment.getStatus() != Appointment.AppointmentStatus.APPROVED) {
                throw new RuntimeException("Only approved appointments can be marked as completed.");
            }
            if (LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime())
                    .isAfter(LocalDateTime.now())) {
                throw new RuntimeException("You can mark this appointment as completed once its time has started.");
            }
        }

        appointment.setStatus(newStatus);
        if (newStatus == Appointment.AppointmentStatus.REJECTED
                && (appointment.getRejectionReason() == null || appointment.getRejectionReason().isBlank())) {
            appointment.setRejectionReason("No reason provided");
        }
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 🔔 Automatic notification (+ email) to the pet owner
        if (newStatus == Appointment.AppointmentStatus.APPROVED) {
            handleApproved(savedAppointment, doctor);
        } else if (newStatus == Appointment.AppointmentStatus.REJECTED) {
            handleRejected(savedAppointment, doctor);
        } else {
            handleCompleted(savedAppointment, doctor);
        }

        logger.info("✅ Appointment {} status updated to: {}", appointmentId, newStatus);

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Convert Entity to Response DTO
    private AppointmentResponseDTO convertToResponseDTO(Appointment appointment) {
        Pet pet = appointment.getPet();
        String ownerName = (pet != null && pet.getOwner() != null) ? pet.getOwner().getName() : null;

        // appointment.getDoctor() returns the User account; the profile image
        // actually lives on the linked Doctor record, so look it up separately.
        User doctorUser = appointment.getDoctor();
        Optional<Doctor> doctorEntity = doctorRepository.findByUser(doctorUser);
        String doctorProfileImage = doctorEntity.map(Doctor::getProfileImage).orElse(null);
        Long doctorProfileId = doctorEntity.map(Doctor::getId).orElse(null);

        AppointmentResponseDTO dto = new AppointmentResponseDTO(
                appointment.getId(),
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getProfileImage(),
                ownerName,
                doctorUser.getId(),
                doctorProfileId,
                doctorUser.getName(),
                doctorProfileImage,
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getAppointmentDateTime(),
                appointment.getStatus().name(),
                appointment.getNotes(),
                appointment.getRejectionReason(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
        dto.setCancellationReason(appointment.getCancellationReason());
        return dto;
    }
}



















