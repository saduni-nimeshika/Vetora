package com.vetora.dto;

import java.util.List;

public class RatingSummaryDTO {

    private double averageRating;
    private long totalRatings;
    // True when the requesting owner has a completed appointment with this
    // doctor and can therefore post a review
    private boolean eligibleToRate;
    // How many more reviews the requesting owner may post for this doctor
    private int reviewsLeft;
    private List<RatingResponseDTO> ratings;

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getTotalRatings() { return totalRatings; }
    public void setTotalRatings(long totalRatings) { this.totalRatings = totalRatings; }

    public boolean isEligibleToRate() { return eligibleToRate; }
    public void setEligibleToRate(boolean eligibleToRate) { this.eligibleToRate = eligibleToRate; }

    public int getReviewsLeft() { return reviewsLeft; }
    public void setReviewsLeft(int reviewsLeft) { this.reviewsLeft = reviewsLeft; }

    public List<RatingResponseDTO> getRatings() { return ratings; }
    public void setRatings(List<RatingResponseDTO> ratings) { this.ratings = ratings; }
}


