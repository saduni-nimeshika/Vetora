package com.vetora.repository;

import com.vetora.entity.WeightRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeightRecordRepository extends JpaRepository<WeightRecord, Long> {

    // ✅ Full weight history for a pet, oldest first (for the chart). Ties on
    // the same recordedDate are broken by id (insertion order) so "the latest
    // entry" is always a deterministic, well-defined record — not arbitrary.
    List<WeightRecord> findByPetIdOrderByRecordedDateAscIdAsc(Long petId);
}



