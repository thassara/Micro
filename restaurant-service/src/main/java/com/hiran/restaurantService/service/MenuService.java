package com.hiran.restaurantService.service;

import com.hiran.restaurantService.dto.MenuItemDTO;
import com.hiran.restaurantService.entity.MenuItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MenuService {
    MenuItem addMenuItem(String restaurantId, MenuItemDTO menuItemDTO, MultipartFile imageFile);
    MenuItem updateMenuItem(String restaurantId, String itemId, MenuItemDTO menuItemDTO);
    void deleteMenuItem(String restaurantId, String itemId);
    List<MenuItem> getMenuItems(String restaurantId);
    MenuItem toggleItemAvailability(String restaurantId, String itemId);
}
