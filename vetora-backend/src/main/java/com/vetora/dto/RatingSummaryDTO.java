package com.vetora.dto;

import java.util.List;

public class RatingSummaryDTO {

    private double averageRating;
    private long totalRatings;
    // Null when the caller isn't a pet owner, or hasn't rated this doctor yet
    private RatingResponseDTO myRating;
    // True when the requesting owner has a completed appointment with this
    // doctor and can therefore submit a rating
    private boolean eligibleToRate;
    private List<RatingResponseDTO> ratings;

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getTotalRatings() { return totalRatings; }
    public void setTotalRatings(long totalRatings) { this.totalRatings = totalRatings; }

    public RatingResponseDTO getMyRating() { return myRating; }
    public void setMyRating(RatingResponseDTO myRating) { this.myRating = myRating; }

    public boolean isEligibleToRate() { return eligibleToRate; }
    public void setEligibleToRate(boolean eligibleToRate) { this.eligibleToRate = eligibleToRate; }

    public List<RatingResponseDTO> getRatings() { return ratings; }
    public void setRatings(List<RatingResponseDTO> ratings) { this.ratings = ratings; }
}
