package com.vetora.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String phoneNumber;
    private String slvcRegistrationNumber;
    private String qualifications;
    private String specialisation;
    private Integer yearsOfExperience;

    private Integer age;
    private String gender;

    private String district;
    private String city;
    private String clinicName;
    private String clinicAddress;

    private String profileImage = "default-avatar.png";

    @Column(name = "is_approved", nullable = false)
    private Boolean approved = false;

    // No-Args Constructor
    public Doctor() {
    }

    // All-Args Constructor
    public Doctor(Long id, User user, String phoneNumber, String slvcRegistrationNumber, String qualifications,
                  String specialisation, Integer yearsOfExperience, Integer age, String gender,
                  String district, String city, String clinicName, String clinicAddress,
                  String profileImage, Boolean approved) {
        this.id = id;
        this.user = user;
        this.phoneNumber = phoneNumber;
        this.slvcRegistrationNumber = slvcRegistrationNumber;
        this.qualifications = qualifications;
        this.specialisation = specialisation;
        this.yearsOfExperience = yearsOfExperience;
        this.age = age;
        this.gender = gender;
        this.district = district;
        this.city = city;
        this.clinicName = clinicName;
        this.clinicAddress = clinicAddress;
        this.profileImage = profileImage;
        this.approved = approved != null ? approved : false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getSlvcRegistrationNumber() { return slvcRegistrationNumber; }
    public void setSlvcRegistrationNumber(String slvcRegistrationNumber) { this.slvcRegistrationNumber = slvcRegistrationNumber; }

    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    public String getSpecialisation() { return specialisation; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getClinicAddress() { return clinicAddress; }
    public void setClinicAddress(String clinicAddress) { this.clinicAddress = clinicAddress; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public Boolean getApproved() { return approved; }
    public Boolean isApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    // Availability Fields
    @Column(name = "available_days")
    private String availableDays;  // "MON,TUE,WED,THU,FRI"

    @Column(name = "available_start_time")
    private String availableStartTime;  // "09:00"

    @Column(name = "available_end_time")
    private String availableEndTime;  // "17:00"

    @Column(name = "slot_duration")
    private Integer slotDuration = 30;  // Minutes per slot

    // Getters and Setters
    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }

    public String getAvailableStartTime() { return availableStartTime; }
    public void setAvailableStartTime(String availableStartTime) { this.availableStartTime = availableStartTime; }

    public String getAvailableEndTime() { return availableEndTime; }
    public void setAvailableEndTime(String availableEndTime) { this.availableEndTime = availableEndTime; }

    public Integer getSlotDuration() { return slotDuration; }
    public void setSlotDuration(Integer slotDuration) { this.slotDuration = slotDuration; }
}