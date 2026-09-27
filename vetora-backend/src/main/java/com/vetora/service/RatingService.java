package com.vetora.service;

import com.vetora.dto.RatingRequestDTO;
import com.vetora.dto.RatingResponseDTO;
import com.vetora.dto.RatingSummaryDTO;
import com.vetora.entity.Appointment;
import com.vetora.entity.Doctor;
import com.vetora.entity.DoctorRating;
import com.vetora.entity.User;
import com.vetora.repository.AppointmentRepository;
import com.vetora.repository.DoctorRatingRepository;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private static final Logger logger = LoggerFactory.getLogger(RatingService.class);

    private final DoctorRatingRepository ratingRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public RatingService(DoctorRatingRepository ratingRepository,
                         DoctorRepository doctorRepository,
                         UserRepository userRepository,
                         AppointmentRepository appointmentRepository) {
        this.ratingRepository = ratingRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // A pet owner can only rate a doctor they've actually had a completed
    // appointment with. Appointment.doctor points at the doctor's User
    // account (not the Doctor profile row), so we compare against that.
    private boolean hasCompletedAppointmentWith(Long ownerId, Long doctorUserId) {
        if (doctorUserId == null) return false;
        return appointmentRepository.findByPetOwnerIdOrderByAppointmentDateTimeDesc(ownerId)
                .stream()
                .anyMatch(a -> a.getDoctor() != null
                        && doctorUserId.equals(a.getDoctor().getId())
                        && a.getStatus() == Appointment.AppointmentStatus.COMPLETED);
    }

    private RatingResponseDTO toDTO(DoctorRating r, Long requestingOwnerId) {
        RatingResponseDTO dto = new RatingResponseDTO();
        dto.setId(r.getId());
        dto.setOwnerName(r.getOwner().getName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        dto.setMine(requestingOwnerId != null && requestingOwnerId.equals(r.getOwner().getId()));
        return dto;
    }

    // ✅ Ratings + average for a doctor's public profile. requestingOwnerEmail
    // is null for an unauthenticated/non-owner caller — in that case myRating
    // stays null and eligibleToRate stays false.
    @Transactional(readOnly = true)
    public RatingSummaryDTO getSummary(Long doctorId, String requestingOwnerEmail) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<DoctorRating> all = ratingRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);

        User requestingOwner = requestingOwnerEmail != null
                ? userRepository.findByEmail(requestingOwnerEmail).orElse(null)
                : null;
        Long requestingOwnerId = requestingOwner != null ? requestingOwner.getId() : null;

        Double avg = ratingRepository.findAverageRatingByDoctorId(doctorId);

        RatingSummaryDTO summary = new RatingSummaryDTO();
        summary.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        summary.setTotalRatings(all.size());
        summary.setRatings(all.stream().map(r -> toDTO(r, requestingOwnerId)).collect(Collectors.toList()));

        if (requestingOwner != null) {
            Long doctorUserId = doctor.getUser() != null ? doctor.getUser().getId() : null;
            summary.setEligibleToRate(hasCompletedAppointmentWith(requestingOwner.getId(), doctorUserId));
            ratingRepository.findByDoctorIdAndOwnerId(doctorId, requestingOwner.getId())
                    .ifPresent(r -> summary.setMyRating(toDTO(r, requestingOwnerId)));
        }

        return summary;
    }

    // ✅ Submit a new rating, or update the owner's existing one for this doctor
    @Transactional
    public RatingResponseDTO submitRating(Long doctorId, String ownerEmail, RatingRequestDTO request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long doctorUserId = doctor.getUser() != null ? doctor.getUser().getId() : null;
        if (!hasCompletedAppointmentWith(owner.getId(), doctorUserId)) {
            throw new RuntimeException("You can rate a doctor only after a completed appointment with them");
        }

        DoctorRating rating = ratingRepository.findByDoctorIdAndOwnerId(doctorId, owner.getId())
                .orElseGet(DoctorRating::new);
        rating.setDoctor(doctor);
        rating.setOwner(owner);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());

        DoctorRating saved = ratingRepository.save(rating);
        logger.info("✅ Rating saved — doctor {} rated {}/5 by {}", doctorId, request.getRating(), owner.getEmail());
        return toDTO(saved, owner.getId());
    }

    // ✅ Remove the requesting owner's own rating for a doctor
    @Transactional
    public void deleteMyRating(Long doctorId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        DoctorRating rating = ratingRepository.findByDoctorIdAndOwnerId(doctorId, owner.getId())
                .orElseThrow(() -> new RuntimeException("You haven't rated this doctor yet"));
        ratingRepository.delete(rating);
        logger.info("✅ Rating removed — doctor {} by {}", doctorId, owner.getEmail());
    }
}

