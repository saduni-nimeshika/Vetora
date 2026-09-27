package com.vetora.repository;

import com.vetora.entity.DoctorRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRatingRepository extends JpaRepository<DoctorRating, Long> {

    // Newest reviews first, for display on the doctor's profile
    List<DoctorRating> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    // A given owner's existing rating for a given doctor, if any (used to
    // decide whether to insert a new row or update the existing one)
    Optional<DoctorRating> findByDoctorIdAndOwnerId(Long doctorId, Long ownerId);

    @Query("SELECT AVG(r.rating) FROM DoctorRating r WHERE r.doctor.id = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    long countByDoctorId(Long doctorId);
}
