package com.hiran.restaurantService.service;


import com.hiran.restaurantService.entity.MenuItem;
import com.hiran.restaurantService.entity.Order;
import com.hiran.restaurantService.entity.OrderItem;
import com.hiran.restaurantService.entity.Restaurant;
import com.hiran.restaurantService.repository.MenuItemRepository;
import com.hiran.restaurantService.repository.OrderRepository;
import com.hiran.restaurantService.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService{
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OrderRepository orderRepository;


    public boolean processOrder(String restaurantId, List<OrderItem> items) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("restaurant not found"));
        if (!restaurant.isAvailable()) return false;

        for (OrderItem item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getItemId()).orElse(null);
            if (menuItem == null || !menuItem.isAvailable()) return false;
        }

        Order order = new Order();
        order.setRestaurantId(restaurantId);
        order.setItems(items);
        order.setStatus("ACCEPTED"); //.setStatus("ACCEPTED");
        orderRepository.save(order);
        return true;
    }
}
