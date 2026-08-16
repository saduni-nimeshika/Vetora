package com.vetora.service;

import com.vetora.entity.Doctor;
import com.vetora.entity.DoctorAvailabilityException;
import com.vetora.repository.DoctorAvailabilityExceptionRepository;
import com.vetora.repository.DoctorRepository;
import com.vetora.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DoctorAvailabilityService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorAvailabilityService.class);
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorAvailabilityExceptionRepository exceptionRepository;

    // Weekday mapping
    private static final Map<String, Integer> DAY_OF_WEEK = new HashMap<>();
    static {
        DAY_OF_WEEK.put("MON", 1);
        DAY_OF_WEEK.put("TUE", 2);
        DAY_OF_WEEK.put("WED", 3);
        DAY_OF_WEEK.put("THU", 4);
        DAY_OF_WEEK.put("FRI", 5);
        DAY_OF_WEEK.put("SAT", 6);
        DAY_OF_WEEK.put("SUN", 7);
    }

    public DoctorAvailabilityService(DoctorRepository doctorRepository,
                                     UserRepository userRepository,
                                     DoctorAvailabilityExceptionRepository exceptionRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.exceptionRepository = exceptionRepository;
    }

    // ✅ Set Doctor Availability
    @Transactional
    public Doctor updateDoctorAvailability(Long doctorId, String availableDays,
                                           String startTime, String endTime, Integer slotDuration) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setAvailableDays(availableDays);
        doctor.setAvailableStartTime(startTime);
        doctor.setAvailableEndTime(endTime);
        doctor.setSlotDuration(slotDuration != null ? slotDuration : 30);

        return doctorRepository.save(doctor);
    }

    // ✅ Add Unavailable Date (Holiday/Leave)
    @Transactional
    public DoctorAvailabilityException addUnavailableDate(Long doctorId, LocalDate date, String reason) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Remove existing exception for this date
        exceptionRepository.findByDoctorAndDate(doctor, date)
                .ifPresent(exceptionRepository::delete);

        DoctorAvailabilityException exception = new DoctorAvailabilityException();
        exception.setDoctor(doctor);
        exception.setDate(date);
        exception.setIsAvailable(false);
        exception.setReason(reason);

        return exceptionRepository.save(exception);
    }

    // ✅ Add Special Available Date
    @Transactional
    public DoctorAvailabilityException addSpecialAvailableDate(Long doctorId, LocalDate date,
                                                               String startTime, String endTime) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        exceptionRepository.findByDoctorAndDate(doctor, date)
                .ifPresent(exceptionRepository::delete);

        DoctorAvailabilityException exception = new DoctorAvailabilityException();
        exception.setDoctor(doctor);
        exception.setDate(date);
        exception.setIsAvailable(true);
        exception.setStartTime(startTime);
        exception.setEndTime(endTime);

        return exceptionRepository.save(exception);
    }

    // ✅ Remove Exception
    @Transactional
    public void removeException(Long exceptionId) {
        exceptionRepository.deleteById(exceptionId);
        logger.info("✅ Exception removed: {}", exceptionId);
    }

    // ✅ Get Doctor Availability for a Date Range
    public Map<String, Object> getDoctorAvailability(Long doctorId, LocalDate startDate, LocalDate endDate) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<DoctorAvailabilityException> exceptions = exceptionRepository
                .findByDoctorAndDateBetween(doctor, startDate, endDate);

        Map<String, Object> response = new HashMap<>();
        response.put("doctorId", doctor.getId());
        response.put("doctorName", doctor.getUser().getName());
        response.put("availableDays", doctor.getAvailableDays());
        response.put("startTime", doctor.getAvailableStartTime());
        response.put("endTime", doctor.getAvailableEndTime());
        response.put("slotDuration", doctor.getSlotDuration());

        // Generate availability for each date
        Map<String, Map<String, Object>> dailyAvailability = new LinkedHashMap<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            dailyAvailability.put(current.toString(), getDayAvailability(doctor, current, exceptions));
            current = current.plusDays(1);
        }

        response.put("availability", dailyAvailability);
        return response;
    }

    // ✅ Get Single Day Availability
    private Map<String, Object> getDayAvailability(Doctor doctor, LocalDate date,
                                                   List<DoctorAvailabilityException> exceptions) {
        Map<String, Object> dayInfo = new HashMap<>();

        // Check for exception
        Optional<DoctorAvailabilityException> exception = exceptions.stream()
                .filter(e -> e.getDate().equals(date))
                .findFirst();

        if (exception.isPresent()) {
            DoctorAvailabilityException ex = exception.get();
            if (!ex.getIsAvailable()) {
                dayInfo.put("available", false);
                dayInfo.put("reason", ex.getReason() != null ? ex.getReason() : "Unavailable");
                return dayInfo;
            } else {
                // Special available date with custom time
                dayInfo.put("available", true);
                dayInfo.put("isSpecial", true);
                dayInfo.put("startTime", ex.getStartTime());
                dayInfo.put("endTime", ex.getEndTime());
                dayInfo.put("slots", generateTimeSlots(ex.getStartTime(), ex.getEndTime(), doctor.getSlotDuration()));
                return dayInfo;
            }
        }

        // Check weekly availability
        String dayName = date.getDayOfWeek().toString().substring(0, 3); // MON, TUE, etc.
        String availableDays = doctor.getAvailableDays();

        if (availableDays == null || !availableDays.contains(dayName)) {
            dayInfo.put("available", false);
            dayInfo.put("reason", "Not available on " + dayName);
            return dayInfo;
        }

        // Available
        dayInfo.put("available", true);
        dayInfo.put("startTime", doctor.getAvailableStartTime());
        dayInfo.put("endTime", doctor.getAvailableEndTime());
        dayInfo.put("slots", generateTimeSlots(doctor.getAvailableStartTime(),
                doctor.getAvailableEndTime(), doctor.getSlotDuration()));

        return dayInfo;
    }

    // ✅ Generate Time Slots
    private List<String> generateTimeSlots(String startTime, String endTime, Integer slotDuration) {
        List<String> slots = new ArrayList<>();
        if (startTime == null || endTime == null) {
            return slots;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime start = LocalTime.parse(startTime, formatter);
        LocalTime end = LocalTime.parse(endTime, formatter);

        while (start.isBefore(end)) {
            slots.add(start.format(formatter));
            start = start.plusMinutes(slotDuration != null ? slotDuration : 30);
        }

        return slots;
    }

    // ✅ Check if a specific slot is available
    public boolean isSlotAvailable(Long doctorId, LocalDate date, String time) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check exception
        Optional<DoctorAvailabilityException> exception = exceptionRepository.findByDoctorAndDate(doctor, date);
        if (exception.isPresent()) {
            DoctorAvailabilityException ex = exception.get();
            if (!ex.getIsAvailable()) {
                return false;
            }
            // Check if time is within special available range
            if (ex.getStartTime() != null && ex.getEndTime() != null) {
                return timeIsInRange(time, ex.getStartTime(), ex.getEndTime());
            }
        }

        // Check weekly availability
        String dayName = date.getDayOfWeek().toString().substring(0, 3);
        if (doctor.getAvailableDays() == null || !doctor.getAvailableDays().contains(dayName)) {
            return false;
        }

        // Check if time is within range
        return timeIsInRange(time, doctor.getAvailableStartTime(), doctor.getAvailableEndTime());
    }

    private boolean timeIsInRange(String time, String startTime, String endTime) {
        if (startTime == null || endTime == null) return false;
        return time.compareTo(startTime) >= 0 && time.compareTo(endTime) < 0;
    }
}