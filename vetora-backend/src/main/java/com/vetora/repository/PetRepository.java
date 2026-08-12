package com.vetora.repository;

import com.vetora.entity.Pet;
import com.vetora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    // Find all pets by owner
    List<Pet> findByOwner(User owner);

    // Find all active pets by owner
    List<Pet> findByOwnerAndIsActiveTrue(User owner);

    // Find pet by ID and owner
    Optional<Pet> findByIdAndOwner(Long id, User owner);

    // Find pets by species
    List<Pet> findBySpecies(String species);

    // Find pets by name (contains)
    List<Pet> findByNameContainingIgnoreCase(String name);

    // Find all active pets
    List<Pet> findByIsActiveTrue();
}