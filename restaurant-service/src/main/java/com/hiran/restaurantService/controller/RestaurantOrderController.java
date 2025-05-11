package com.hiran.restaurantService.controller;

import com.hiran.restaurantService.service.RestaurantOrderServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/restaurant/{restaurantId}/orders")
public class RestaurantOrderController {

    private final RestaurantOrderServiceImpl restaurantOrderServiceImpl;

    public RestaurantOrderController(RestaurantOrderServiceImpl restaurantOrderServiceImpl) {
        this.restaurantOrderServiceImpl = restaurantOrderServiceImpl;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String getRestaurantOrders(@PathVariable String restaurantId) {
        return restaurantOrderServiceImpl.getOrdersForRestaurant(restaurantId);
    }
}