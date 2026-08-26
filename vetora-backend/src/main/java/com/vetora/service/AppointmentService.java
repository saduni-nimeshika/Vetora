package com.vetora.service;

import com.vetora.dto.AppointmentRequestDTO;
import com.vetora.dto.AppointmentResponseDTO;
import com.vetora.entity.Appointment;
import com.vetora.entity.Doctor;
import com.vetora.entity.Pet;
import com.vetora.entity.Reminder;
import com.vetora.entity.User;
import com.vetora.repository.AppointmentRepository;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.PetRepository;
import com.vetora.repository.ReminderRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    // ✅ Constructor - හරියට
    public AppointmentService(AppointmentRepository appointmentRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              DoctorRepository doctorRepository,
                              EmailService emailService,
                              ReminderRepository reminderRepository,
                              ReminderService reminderService) {   // ✅ Add this
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.emailService = emailService;
        this.reminderRepository = reminderRepository;
        this.reminderService = reminderService;   // ✅ Add this
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

        // Check if slot is available
        boolean slotBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime(),
                Appointment.AppointmentStatus.CANCELLED);

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

        // ✅ AUTO CREATE APPOINTMENT REMINDER using ReminderService
        try {
            reminderService.createAutoAppointmentReminder(
                    pet,
                    doctor,
                    request.getAppointmentDate().atTime(request.getAppointmentTime()),
                    pet.getName(),
                    doctor.getName()
            );
        } catch (Exception e) {
            logger.error("❌ Failed to create auto reminder: {}", e.getMessage());
        }

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

        try {
            User owner = appointment.getPet().getOwner();
            emailService.sendAppointmentApproved(owner.getEmail(), owner.getName(),
                    appointment.getPet().getName(), doctor.getName(),
                    appointment.getAppointmentDate(), appointment.getAppointmentTime(),
                    appointment.getNotes());
            logger.info("✅ Appointment approved and notification sent");
        } catch (Exception e) {
            logger.error("❌ Failed to send approval notification: {}", e.getMessage());
        }

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
        appointment.setRejectionReason(reason != null ? reason : "No reason provided");
        Appointment savedAppointment = appointmentRepository.save(appointment);

        try {
            User owner = appointment.getPet().getOwner();
            emailService.sendAppointmentRejected(owner.getEmail(), owner.getName(),
                    appointment.getPet().getName(), doctor.getName(),
                    appointment.getAppointmentDate(), appointment.getAppointmentTime(),
                    appointment.getRejectionReason());
            logger.info("✅ Appointment rejected and notification sent");
        } catch (Exception e) {
            logger.error("❌ Failed to send rejection notification: {}", e.getMessage());
        }

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Cancel Appointment (Pet Owner)
    @Transactional
    public AppointmentResponseDTO cancelAppointment(Long appointmentId, String ownerEmail) {
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

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // ✅ DELETE AUTO REMINDER
        try {
            reminderService.deleteAutoReminder(
                    appointment.getPet().getId(),
                    Reminder.ReminderType.APPOINTMENT,
                    appointment.getPet().getName()
            );
        } catch (Exception e) {
            logger.error("❌ Failed to delete auto reminder: {}", e.getMessage());
        }

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

        // Check if appointment is cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Cannot update a cancelled appointment!");
        }

        // Check if appointment is already completed
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Appointment is already completed!");
        }

        appointment.setStatus(newStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        logger.info("✅ Appointment {} status updated to: {}", appointmentId, newStatus);

        return convertToResponseDTO(savedAppointment);
    }

    // ✅ Convert Entity to Response DTO
    private AppointmentResponseDTO convertToResponseDTO(Appointment appointment) {
        return new AppointmentResponseDTO(
                appointment.getId(),
                appointment.getPet().getId(),
                appointment.getPet().getName(),
                appointment.getPet().getSpecies(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getName(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getAppointmentDateTime(),
                appointment.getStatus().name(),
                appointment.getNotes(),
                appointment.getRejectionReason(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }
}
