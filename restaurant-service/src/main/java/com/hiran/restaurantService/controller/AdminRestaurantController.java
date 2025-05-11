package com.hiran.restaurantService.controller;

import com.hiran.restaurantService.entity.Restaurant;
import com.hiran.restaurantService.service.RestaurantServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/restaurants")
@CrossOrigin(origins = "http://localhost:3001", allowedHeaders = "*", allowCredentials = "true")
public class AdminRestaurantController {

    @Autowired
    private RestaurantServiceImpl restaurantServiceImpl;

    @GetMapping("/pending")
    public List<Restaurant> getPendingRegistrations() {
        return restaurantServiceImpl.getPendingRestaurants();
    }

    @PatchMapping("/{restaurantId}/approval")
    public Restaurant updateApprovalStatus(
            @PathVariable String restaurantId,
            @RequestParam boolean approved) {
        return restaurantServiceImpl.updateApprovalStatus(restaurantId, approved);
    }
}
