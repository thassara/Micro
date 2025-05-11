package com.hiran.restaurantService.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class RestaurantServiceErrorHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleOrderServiceErrors(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body("{\"error\":\"" + ex.getMessage() + "\"}");
    }
}