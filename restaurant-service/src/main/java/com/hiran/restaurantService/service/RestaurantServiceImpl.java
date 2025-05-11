package com.hiran.restaurantService.service;

import com.hiran.restaurantService.dto.RestaurantDTO;
import com.hiran.restaurantService.entity.Restaurant;
import com.hiran.restaurantService.repository.RestaurantRepository;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class RestaurantServiceImpl implements RestaurantService{
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private CloudinaryServiceImpl cloudinaryServiceImpl;

    public RestaurantServiceImpl(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public Restaurant toggleAvailability(String id) {
        Restaurant restaurant = restaurantRepository.findById(id).orElseThrow(()-> new RuntimeException("Restaurant not found"));
        restaurant.setAvailable(!restaurant.isAvailable());
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findByApprovedFalse();
    }

    public Restaurant updateApprovalStatus(String id, boolean approved) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setApproved(approved);
        return restaurantRepository.save(restaurant);
    }

    public Restaurant createRestaurant(RestaurantDTO restaurantDTO, MultipartFile coverImage) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(restaurantDTO.getName());
        restaurant.setContactNumber(restaurantDTO.getContactNumber());
        restaurant.setCuisineType(restaurantDTO.getCuisineType());
        restaurant.setOpeningTime(restaurantDTO.getOpeningTime());
        restaurant.setClosingTime(restaurantDTO.getClosingTime());
        restaurant.setEmail(restaurantDTO.getEmail());
        restaurant.setRestaurantPassword(restaurantDTO.getRestaurantPassword());
        restaurant.setAvailable(false);
        restaurant.setApproved(false);
        restaurant.setRegistrationDate(String.valueOf(LocalDateTime.now()));
        restaurant.setFormattedAddress(restaurantDTO.getFormattedAddress());

        restaurant.setLocation(new GeoJsonPoint(
                restaurantDTO.getLongitude(), // longitude first (x)
                restaurantDTO.getLatitude()   // latitude second (y)
        ));
        try {
            String imageUrl = cloudinaryServiceImpl.uploadImage(coverImage);
            restaurant.setCoverImageUrl(imageUrl);
        } catch (Exception e) {
            // Handle error or set default image
            restaurant.setCoverImageUrl(null);
        }

        return restaurantRepository.save(restaurant);
    }

    // Read All
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    // Read by ID
    public Restaurant getRestaurantById(String id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    // Update
    public Restaurant updateRestaurant(String id, Restaurant updatedRestaurant) {
        Restaurant existing = getRestaurantById(id);
        existing.setName(updatedRestaurant.getName());

        return restaurantRepository.save(existing);
    }

    // Delete
    public void deleteRestaurant(String id) {
        restaurantRepository.deleteById(id);
    }
}
