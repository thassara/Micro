package com.hiran.restaurantService.service;

import java.util.List;

public interface RestaurantOrderService {
    String getOrdersForRestaurant(String restaurantId);
    List<String> getOrderStatuses(String restaurantId);
}