package com.vetora.dto;

import com.vetora.enums.Role;

public class SignUpRequest {

    // Basic Fields
    private String name;
    private String email;
    private String password;
    private Role role;

    // Doctor Specific Fields
    private String slvcRegistrationNumber;
    private String qualifications;
    private String specialisation;
    private Integer yearsOfExperience;
    private String district;
    private String city;
    private String clinicName;
    private String clinicAddress; // 💡 මෙන්න මේ field එක එකතු කළා
    private String phone;
    private String address;

    // Default Constructor
    public SignUpRequest() {
    }

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getSlvcRegistrationNumber() { return slvcRegistrationNumber; }
    public void setSlvcRegistrationNumber(String slvcRegistrationNumber) { this.slvcRegistrationNumber = slvcRegistrationNumber; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    public String getSpecialisation() { return specialisation; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    // 💡 clinicAddress සඳහා Getter සහ Setter
    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
