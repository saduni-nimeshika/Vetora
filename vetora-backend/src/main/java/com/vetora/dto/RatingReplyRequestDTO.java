package com.vetora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RatingReplyRequestDTO {

    @NotBlank(message = "Reply cannot be empty")
    @Size(max = 1000, message = "Reply must be 1000 characters or fewer")
    private String reply;

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
}

