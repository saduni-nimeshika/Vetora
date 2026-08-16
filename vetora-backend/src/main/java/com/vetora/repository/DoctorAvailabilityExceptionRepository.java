package com.vetora.repository;

import com.vetora.entity.Doctor;
import com.vetora.entity.DoctorAvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityExceptionRepository extends JpaRepository<DoctorAvailabilityException, Long> {

    List<DoctorAvailabilityException> findByDoctorAndDateBetween(Doctor doctor, LocalDate start, LocalDate end);

    Optional<DoctorAvailabilityException> findByDoctorAndDate(Doctor doctor, LocalDate date);

    List<DoctorAvailabilityException> findByDoctorAndIsAvailableTrue(Doctor doctor);

    List<DoctorAvailabilityException> findByDoctorAndIsAvailableFalse(Doctor doctor);
}
