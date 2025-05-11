package com.hiran.restaurantService.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiran.restaurantService.client.OrderServiceClient;
import com.hiran.restaurantService.dto.MenuItemDTO;
import com.hiran.restaurantService.entity.MenuItem;
import com.hiran.restaurantService.entity.Restaurant;
import com.hiran.restaurantService.service.MenuServiceImpl;
import com.hiran.restaurantService.service.RestaurantServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/owner/restaurants")
@CrossOrigin(origins = "http://localhost:3001", allowedHeaders = "*", allowCredentials = "true")
public class RestaurantOwnerController {

    @Autowired
    private RestaurantServiceImpl restaurantServiceImpl;

    @Autowired
    private MenuServiceImpl menuServiceImpl;

    @Autowired
    private OrderServiceClient orderServiceClient;

    @PutMapping("/{restaurantId}/availability")
    public Restaurant toggleAvailability(@PathVariable String restaurantId) {
        return restaurantServiceImpl.toggleAvailability(restaurantId);
    }

    @PutMapping("/{restaurantId}")
    public Restaurant updateRestaurant(@PathVariable String restaurantId,
                                       @RequestBody Restaurant restaurant) {
        return restaurantServiceImpl.updateRestaurant(restaurantId, restaurant);
    }

    @DeleteMapping("/{restaurantId}")
    public void deleteRestaurant(@PathVariable String restaurantId) {
        restaurantServiceImpl.deleteRestaurant(restaurantId);
    }

    @PostMapping(value = "/{restaurantId}/menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItem> addMenuItem(
            @PathVariable String restaurantId,
            @RequestPart("menuItem") String menuItemJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            MenuItemDTO menuItemDTO = objectMapper.readValue(menuItemJson, MenuItemDTO.class);

            MenuItem createdItem = menuServiceImpl.addMenuItem(restaurantId, menuItemDTO, imageFile);
            return ResponseEntity.ok(createdItem);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{restaurantId}/menu/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable String restaurantId,
            @PathVariable String itemId,
            @RequestPart("menuItem") String menuItemJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        MenuItemDTO menuItemDTO = objectMapper.readValue(menuItemJson, MenuItemDTO.class);
        menuItemDTO.setImageFile(imageFile);

        return ResponseEntity.ok(menuServiceImpl.updateMenuItem(restaurantId, itemId, menuItemDTO));
    }

    @DeleteMapping("/{restaurantId}/menu/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable String restaurantId,
            @PathVariable String itemId) {
        menuServiceImpl.deleteMenuItem(restaurantId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{restaurantId}/menu/{itemId}/availability")
    public ResponseEntity<MenuItem> toggleItemAvailability(
            @PathVariable String restaurantId,
            @PathVariable String itemId) {
        try {
            MenuItem updatedItem = menuServiceImpl.toggleItemAvailability(restaurantId, itemId);
            return ResponseEntity.ok(updatedItem);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{orderId}/confirm")
    public String confirmOrder(@PathVariable String orderId) {
        return orderServiceClient.updateOrderStatus(
                orderId,
                "RESTAURANT_CONFIRMED"  // Hardcoded status (or pass dynamically)
        );
    }

    @PutMapping("/{orderId}/preparing")
    public String markAsPreparing(@PathVariable String orderId) {
        return orderServiceClient.updateOrderStatus(
                orderId,
                "PREPARING"
        );
    }

    @PutMapping("/{orderId}/ready")
    public String markAsReady(@PathVariable String orderId) {
        return orderServiceClient.updateOrderStatus(
                orderId,
                "READY_FOR_PICKUP"
        );
    }

    @PutMapping("/{orderId}/cancel")
    public String markAsCancel(@PathVariable String orderId) {
        return orderServiceClient.updateOrderStatus(
                orderId,
                "CANCELLED"
        );
    }



}
