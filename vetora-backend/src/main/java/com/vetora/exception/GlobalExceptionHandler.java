package com.vetora.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

// Catches exceptions that bubble up past individual controllers' own try/catch
// blocks, so the API always responds with the same {"error": "..."} shape
// instead of Spring's default error page/JSON — most importantly for
// @Valid validation failures, which previously returned an inconsistent,
// framework-shaped response that the frontend wasn't prepared to parse.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Triggered when a @Valid @RequestBody DTO fails its @NotNull/@NotBlank/etc
    // annotations. Collects every field error into one readable message plus
    // a field-level map, so the frontend can show "Diagnosis is required"
    // instead of a generic "Bad Request".
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        String summary = String.join(", ", fieldErrors.values());

        Map<String, Object> body = new HashMap<>();
        body.put("error", summary.isEmpty() ? "Validation failed" : summary);
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("error", "You don't have permission to do that");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("error", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getMessage() != null ? ex.getMessage() : "Something went wrong");
        return ResponseEntity.badRequest().body(body);
    }

    // Last-resort catch-all — anything not covered above (NullPointerException,
    // etc). Deliberately vague to the client so internal details never leak;
    // full detail still goes to the server log for debugging.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleUnexpected(Exception ex) {
        ex.printStackTrace();
        Map<String, String> body = new HashMap<>();
        body.put("error", "An unexpected error occurred. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

