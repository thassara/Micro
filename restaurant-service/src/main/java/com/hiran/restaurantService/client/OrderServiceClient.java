package com.hiran.restaurantService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderServiceClient {

    @GetMapping(value = "/api/orders/restaurant/{restaurantId}",
            produces = "application/json")
    String getOrdersByRestaurantId(@PathVariable String restaurantId);

    @PutMapping("/api/orders/{orderId}/status")
    String updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status  // "RESTAURANT_CONFIRMED", "PREPARING", etc.
    );
}
