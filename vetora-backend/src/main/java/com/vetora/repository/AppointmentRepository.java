package com.vetora.repository;

import com.vetora.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Find appointments by pet
    List<Appointment> findByPetIdOrderByAppointmentDateTimeDesc(Long petId);

    // Find appointments by doctor
    List<Appointment> findByDoctorIdOrderByAppointmentDateTimeDesc(Long doctorId);

    // Find appointments by doctor and status
    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentDateTimeAsc(Long doctorId, Appointment.AppointmentStatus status);

    // Find appointments by pet and status
    List<Appointment> findByPetIdAndStatusOrderByAppointmentDateTimeAsc(Long petId, Appointment.AppointmentStatus status);

    // Check if slot is already booked
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime time, Appointment.AppointmentStatus status);

    // Find appointments by pet owner
    List<Appointment> findByPetOwnerIdOrderByAppointmentDateTimeDesc(Long ownerId);

    // Find appointments by doctor and date
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    // Find pending appointments for doctor
    List<Appointment> findByDoctorIdAndStatusOrderByCreatedAtAsc(Long doctorId, Appointment.AppointmentStatus status);
}
