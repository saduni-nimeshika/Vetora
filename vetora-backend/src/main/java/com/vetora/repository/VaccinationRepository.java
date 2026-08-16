package com.vetora.repository;

import com.vetora.entity.Vaccination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {

    List<Vaccination> findByPetIdAndIsActiveTrueOrderByVaccinationDateDesc(Long petId);

    List<Vaccination> findByDoctorIdAndIsActiveTrue(Long doctorId);

    List<Vaccination> findByNextVaccinationDateBeforeAndIsActiveTrue(LocalDate date);

    List<Vaccination> findByPetId(Long petId);
}