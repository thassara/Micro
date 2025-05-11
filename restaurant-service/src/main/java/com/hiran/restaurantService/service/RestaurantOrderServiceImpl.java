package com.hiran.restaurantService.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiran.restaurantService.client.OrderServiceClient;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class RestaurantOrderServiceImpl implements RestaurantOrderService{

    private final OrderServiceClient orderServiceClient;
    private final ObjectMapper objectMapper;

    public RestaurantOrderServiceImpl(OrderServiceClient orderServiceClient,
                                      ObjectMapper objectMapper) {
        this.orderServiceClient = orderServiceClient;
        this.objectMapper = objectMapper;
    }

    public String getOrdersForRestaurant(String restaurantId) {
        try {
            // Get raw JSON string from order service
            String ordersJson = orderServiceClient.getOrdersByRestaurantId(restaurantId);

            // Basic validation
            JsonNode rootNode = objectMapper.readTree(ordersJson);
            if (!rootNode.isArray()) {
                throw new RuntimeException("Invalid orders response format");
            }

            return ordersJson;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to process orders JSON", e);
        }
    }

    // Optional: Helper method to extract specific fields
    public List<String> getOrderStatuses(String restaurantId) {
        try {
            String json = getOrdersForRestaurant(restaurantId);
            JsonNode rootNode = objectMapper.readTree(json);

            return rootNode.findValuesAsText("status");
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}