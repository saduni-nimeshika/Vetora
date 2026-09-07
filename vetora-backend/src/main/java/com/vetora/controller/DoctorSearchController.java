package com.vetora.controller;

import com.vetora.entity.Doctor;
import com.vetora.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
public class DoctorSearchController {

    private final DoctorRepository doctorRepository;

    public DoctorSearchController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // Approximate centroid coordinates for each Sri Lankan district. Used as a
    // fallback when a doctor hasn't set a precise clinic latitude/longitude,
    // so distance-based search still works out of the box.
    private static final Map<String, double[]> DISTRICT_CENTROIDS = new HashMap<>();
    static {
        DISTRICT_CENTROIDS.put("colombo", new double[]{6.9271, 79.8612});
        DISTRICT_CENTROIDS.put("gampaha", new double[]{7.0917, 79.9995});
        DISTRICT_CENTROIDS.put("kalutara", new double[]{6.5854, 79.9607});
        DISTRICT_CENTROIDS.put("kandy", new double[]{7.2906, 80.6337});
        DISTRICT_CENTROIDS.put("matale", new double[]{7.4675, 80.6234});
        DISTRICT_CENTROIDS.put("nuwara-eliya", new double[]{6.9497, 80.7891});
        DISTRICT_CENTROIDS.put("galle", new double[]{6.0535, 80.2210});
        DISTRICT_CENTROIDS.put("matara", new double[]{5.9549, 80.5550});
        DISTRICT_CENTROIDS.put("hambantota", new double[]{6.1241, 81.1185});
        DISTRICT_CENTROIDS.put("jaffna", new double[]{9.6615, 80.0255});
        DISTRICT_CENTROIDS.put("kilinochchi", new double[]{9.3961, 80.3982});
        DISTRICT_CENTROIDS.put("mannar", new double[]{8.9810, 79.9044});
        DISTRICT_CENTROIDS.put("mullaitivu", new double[]{9.2671, 80.8142});
        DISTRICT_CENTROIDS.put("vavuniya", new double[]{8.7514, 80.4971});
        DISTRICT_CENTROIDS.put("puttalam", new double[]{8.0362, 79.8283});
        DISTRICT_CENTROIDS.put("kurunegala", new double[]{7.4863, 80.3623});
        DISTRICT_CENTROIDS.put("kegalle", new double[]{7.2513, 80.3464});
        DISTRICT_CENTROIDS.put("ratnapura", new double[]{6.6828, 80.3992});
        DISTRICT_CENTROIDS.put("badulla", new double[]{6.9934, 81.0550});
        DISTRICT_CENTROIDS.put("monaragala", new double[]{6.8724, 81.3507});
        DISTRICT_CENTROIDS.put("ampara", new double[]{7.2975, 81.6747});
        DISTRICT_CENTROIDS.put("batticaloa", new double[]{7.7310, 81.6747});
        DISTRICT_CENTROIDS.put("trincomalee", new double[]{8.5874, 81.2152});
        DISTRICT_CENTROIDS.put("polonnaruwa", new double[]{7.9403, 81.0188});
        DISTRICT_CENTROIDS.put("anuradhapura", new double[]{8.3114, 80.4037});
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Resolve a doctor's location: precise clinic coordinates if set, else the
    // centroid of their registered district as a reasonable approximation.
    private double[] resolveLocation(Doctor doctor) {
        if (doctor.getLatitude() != null && doctor.getLongitude() != null) {
            return new double[]{doctor.getLatitude(), doctor.getLongitude()};
        }
        if (doctor.getDistrict() != null) {
            double[] centroid = DISTRICT_CENTROIDS.get(doctor.getDistrict().trim().toLowerCase());
            if (centroid != null) return centroid;
        }
        return null;
    }

    // Build a safe, client-facing map for a doctor — never serialise the raw
    // entity (it drags along the linked User, including the password hash).
    private Map<String, Object> toSafeMap(Doctor doctor, Double lat, Double lon) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doctor.getId());
        Map<String, Object> userInfo = new LinkedHashMap<>();
        if (doctor.getUser() != null) {
            userInfo.put("id", doctor.getUser().getId());
            userInfo.put("name", doctor.getUser().getName());
            userInfo.put("email", doctor.getUser().getEmail());
        }
        map.put("user", userInfo);
        map.put("specialisation", doctor.getSpecialisation());
        map.put("qualifications", doctor.getQualifications());
        map.put("yearsOfExperience", doctor.getYearsOfExperience());
        map.put("phoneNumber", doctor.getPhoneNumber());
        map.put("clinicName", doctor.getClinicName());
        map.put("clinicAddress", doctor.getClinicAddress());
        map.put("district", doctor.getDistrict());
        map.put("city", doctor.getCity());
        map.put("profileImage", doctor.getProfileImage());

        double[] resolved = resolveLocation(doctor);
        boolean isApproximate = doctor.getLatitude() == null || doctor.getLongitude() == null;
        if (resolved != null) {
            map.put("latitude", resolved[0]);
            map.put("longitude", resolved[1]);
            map.put("locationApproximate", isApproximate);
        }

        if (lat != null && lon != null && resolved != null) {
            double distance = haversineKm(lat, lon, resolved[0], resolved[1]);
            map.put("distanceKm", Math.round(distance * 10.0) / 10.0);
        }
        return map;
    }

    // ✅ Search approved doctors — optionally filtered by district/city/specialisation
    //    and by radius (km) around a lat/lon point, sorted nearest-first.
    @GetMapping("/doctors")
    public ResponseEntity<?> searchDoctors(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialisation,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radius
    ) {
        List<Doctor> doctors = doctorRepository.findByApprovedTrue();

        List<Map<String, Object>> results = doctors.stream()
                .filter(d -> district == null || district.isBlank()
                        || (d.getDistrict() != null && d.getDistrict().equalsIgnoreCase(district.trim())))
                .filter(d -> city == null || city.isBlank()
                        || (d.getCity() != null && d.getCity().toLowerCase().contains(city.trim().toLowerCase())))
                .filter(d -> specialisation == null || specialisation.isBlank()
                        || (d.getSpecialisation() != null && d.getSpecialisation().toLowerCase().contains(specialisation.trim().toLowerCase())))
                .map(d -> toSafeMap(d, lat, lon))
                .filter(m -> {
                    if (lat == null || lon == null || radius == null) return true;
                    // If the owner explicitly picked a District or City, they're
                    // browsing that place on purpose — don't also require it to be
                    // within X km of wherever they currently are standing.
                    boolean explicitPlaceChosen = (district != null && !district.isBlank())
                            || (city != null && !city.isBlank());
                    if (explicitPlaceChosen) return true;
                    Object distObj = m.get("distanceKm");
                    // Doctors with no resolvable location are excluded from a pure
                    // "near me" radius search (can't be placed on the map or ranked
                    // by distance anyway) — but this branch only runs when there's
                    // no district/city filter, so it won't hide district results.
                    if (distObj == null) return false;
                    return ((Number) distObj).doubleValue() <= radius;
                })
                .collect(Collectors.toList());

        if (lat != null && lon != null) {
            results.sort(Comparator.comparingDouble(m ->
                    m.get("distanceKm") != null ? ((Number) m.get("distanceKm")).doubleValue() : Double.MAX_VALUE));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", results);
        response.put("count", results.size());

        return ResponseEntity.ok(response);
    }

    // ✅ Get a single approved doctor's public profile (used by the pet-owner-facing profile page)
    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        return doctorRepository.findById(id)
                .filter(Doctor::isApproved)
                .map(d -> ResponseEntity.ok((Object) toSafeMap(d, lat, lon)))
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Doctor not found");
                    return ResponseEntity.status(404).body(error);
                });
    }

    // ✅ Get doctors by specialisation
    @GetMapping("/doctors/specialisation/{specialisation}")
    public ResponseEntity<?> getDoctorsBySpecialisation(@PathVariable String specialisation) {
        List<Map<String, Object>> results = doctorRepository.findByApprovedTrue()
                .stream()
                .filter(d -> d.getSpecialisation() != null &&
                        d.getSpecialisation().toLowerCase().contains(specialisation.toLowerCase()))
                .map(d -> toSafeMap(d, null, null))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", results);
        response.put("count", results.size());

        return ResponseEntity.ok(response);
    }

    // ✅ Get doctors by city
    @GetMapping("/doctors/city/{city}")
    public ResponseEntity<?> getDoctorsByCity(@PathVariable String city) {
        List<Map<String, Object>> results = doctorRepository.findByApprovedTrue()
                .stream()
                .filter(d -> d.getCity() != null &&
                        d.getCity().toLowerCase().contains(city.toLowerCase()))
                .map(d -> toSafeMap(d, null, null))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("doctors", results);
        response.put("count", results.size());

        return ResponseEntity.ok(response);
    }
}


