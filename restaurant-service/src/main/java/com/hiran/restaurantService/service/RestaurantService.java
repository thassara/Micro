package com.hiran.restaurantService.service;

import com.hiran.restaurantService.dto.RestaurantDTO;
import com.hiran.restaurantService.entity.Restaurant;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RestaurantService {
    Restaurant toggleAvailability(String id);
    List<Restaurant> getPendingRestaurants();
    Restaurant updateApprovalStatus(String id, boolean approved);
    Restaurant createRestaurant(RestaurantDTO restaurantDTO, MultipartFile coverImage);
    List<Restaurant> getAllRestaurants();
    Restaurant getRestaurantById(String id);
    Restaurant updateRestaurant(String id, Restaurant updatedRestaurant);
    void deleteRestaurant(String id);
}
