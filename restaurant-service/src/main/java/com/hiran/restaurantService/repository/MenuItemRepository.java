package com.hiran.restaurantService.repository;

import com.hiran.restaurantService.entity.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository  extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByRestaurantId(String restaurantId);
    void deleteByIdAndRestaurantId(String id, String restaurantId);
    Optional<MenuItem> findByIdAndRestaurantId(String id, String restaurantId);
}
