package com.hiran.restaurantService.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiran.restaurantService.dto.RestaurantDTO;
import com.hiran.restaurantService.entity.MenuItem;
import com.hiran.restaurantService.entity.Restaurant;
import com.hiran.restaurantService.service.MenuServiceImpl;
import com.hiran.restaurantService.service.RestaurantServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/public/restaurants")
@CrossOrigin(origins = "http://localhost:3001", allowedHeaders = "*", allowCredentials = "true")
public class PublicRestaurantController {


    private static final Logger logger = LoggerFactory.getLogger(RestaurantServiceImpl.class);

    @Autowired
    private RestaurantServiceImpl restaurantServiceImpl;

    @Autowired
    private MenuServiceImpl menuServiceImpl;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantServiceImpl.getAllRestaurants();
    }

    @GetMapping("/{restaurantId}")
    public Restaurant getRestaurantById(@PathVariable String restaurantId) {
        return restaurantServiceImpl.getRestaurantById(restaurantId);
    }

    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<List<MenuItem>> getMenuItems(@PathVariable String restaurantId) {
        return ResponseEntity.ok(menuServiceImpl.getMenuItems(restaurantId));
    }
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createRestaurant(
            @RequestPart("restaurant") String restaurantJson,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        try {
            // Add proper logging
            logger.debug("Received restaurant JSON: {}", restaurantJson);

            // Configure ObjectMapper
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            // Parse the JSON to get the restaurant data
            JsonNode rootNode = objectMapper.readTree(restaurantJson);

            // Create DTO and set values
            RestaurantDTO restaurantDTO = new RestaurantDTO();
            restaurantDTO.setName(rootNode.path("name").asText());
            restaurantDTO.setFormattedAddress(rootNode.path("formattedAddress").asText());
            restaurantDTO.setContactNumber(rootNode.path("contactNumber").asText());
            restaurantDTO.setCuisineType(rootNode.path("cuisineType").asText());
            restaurantDTO.setOpeningTime(rootNode.path("openingTime").asText());
            restaurantDTO.setClosingTime(rootNode.path("closingTime").asText());
            restaurantDTO.setEmail(rootNode.path("email").asText());
            restaurantDTO.setRestaurantPassword(rootNode.path("restaurantPassword").asText());

            // Handle location data - two possible approaches:
            // Option 1: If location is sent as a complete GeoJSON object
            if (rootNode.has("location")) {
                JsonNode locationNode = rootNode.path("location");
                if (locationNode.has("coordinates") && locationNode.path("coordinates").isArray()) {
                    restaurantDTO.setLongitude(locationNode.path("coordinates").get(0).asDouble());
                    restaurantDTO.setLatitude(locationNode.path("coordinates").get(1).asDouble());
                }
            }
            // Option 2: If latitude/longitude are sent as separate fields
            else {
                restaurantDTO.setLatitude(rootNode.path("latitude").asDouble());
                restaurantDTO.setLongitude(rootNode.path("longitude").asDouble());
            }

            logger.debug("Parsed restaurant DTO with location: lat={}, long={}",
                    restaurantDTO.getLatitude(), restaurantDTO.getLongitude());

            Restaurant createdRestaurant = restaurantServiceImpl.createRestaurant(restaurantDTO, coverImage);
            return ResponseEntity.ok(createdRestaurant);

        } catch (Exception e) {
            logger.error("Error creating restaurant", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
