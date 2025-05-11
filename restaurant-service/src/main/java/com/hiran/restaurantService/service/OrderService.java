package com.hiran.restaurantService.service;

import com.hiran.restaurantService.entity.OrderItem;

import java.util.List;

public interface OrderService {
    boolean processOrder(String restaurantId, List<OrderItem> items);
}
