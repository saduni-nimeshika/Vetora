package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(origins = "*")
public class DoctorSearchController {

    private final DoctorRepository doctorRepository;

    public DoctorSearchController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // ✅ Get all approved doctors
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findByApprovedTrue();  // ✅ Fixed!

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", doctors);
        response.put("count", doctors.size());

        return ResponseEntity.ok(response);
    }

    // ✅ Get doctors by specialisation
    @GetMapping("/doctors/specialisation/{specialisation}")
    public ResponseEntity<?> getDoctorsBySpecialisation(@PathVariable String specialisation) {
        List<Doctor> doctors = doctorRepository.findByApprovedTrue()
                .stream()
                .filter(d -> d.getSpecialisation() != null &&
                        d.getSpecialisation().toLowerCase().contains(specialisation.toLowerCase()))
                .collect(java.util.stream.Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", doctors);
        response.put("count", doctors.size());

        return ResponseEntity.ok(response);
    }

    // ✅ Get doctors by city
    @GetMapping("/doctors/city/{city}")
    public ResponseEntity<?> getDoctorsByCity(@PathVariable String city) {
        List<Doctor> doctors = doctorRepository.findByApprovedTrue()
                .stream()
                .filter(d -> d.getCity() != null &&
                        d.getCity().toLowerCase().contains(city.toLowerCase()))
                .collect(java.util.stream.Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", doctors);
        response.put("count", doctors.size());

        return ResponseEntity.ok(response);
    }
}
