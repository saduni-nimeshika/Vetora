package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.entity.User;
import com.vetora.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService; // 💡 AdminService එක Inject කළා

    // 1. Doctor කෙනෙක්ව Approve කිරීම
    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
        try {
            adminService.approveDoctor(doctorId);
            return ResponseEntity.ok("Doctor approved successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error approving doctor: " + e.getMessage());
        }
    }

    // 2. Pending Doctors ලාගේ List එක ගන්න
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Doctor>> getPendingDoctors() {
        List<Doctor> pendingDoctors = adminService.getPendingDoctors();
        return ResponseEntity.ok(pendingDoctors);
    }

    // 3. Doctor කෙනෙක්ව Reject කිරීම
    @DeleteMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long doctorId) {
        try {
            adminService.rejectDoctor(doctorId);
            return ResponseEntity.ok("Doctor registration rejected and account deleted!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error rejecting doctor: " + e.getMessage());
        }
    }

    // 4. ඔක්කොම Users ලාගේ List එක ගන්න
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
}