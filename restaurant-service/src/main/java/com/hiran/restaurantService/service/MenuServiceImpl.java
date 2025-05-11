package com.hiran.restaurantService.service;

import com.hiran.restaurantService.dto.MenuItemDTO;
import com.hiran.restaurantService.entity.MenuItem;
import com.hiran.restaurantService.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MenuServiceImpl implements MenuService{
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private CloudinaryServiceImpl cloudinaryServiceImpl;

    public MenuItem addMenuItem(String restaurantId, MenuItemDTO menuItemDTO, MultipartFile imageFile) {
        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurantId(restaurantId);
        menuItem.setName(menuItemDTO.getName());
        menuItem.setPrice(menuItemDTO.getPrice());
        menuItem.setDescription(menuItemDTO.getDescription());
        menuItem.setCategory(menuItemDTO.getCategory());
        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = cloudinaryServiceImpl.uploadImage(imageFile);
                menuItem.setImageUrl(imageUrl);
            }
        } catch (IOException e) {
            // Handle error (log it and maybe set a default image)
            System.err.println("Error uploading menu item image: " + e.getMessage());
        }
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(String restaurantId, String itemId, MenuItemDTO menuItemDTO) {
        MenuItem existingItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Menu item not found"));

        existingItem.setName(menuItemDTO.getName());
        existingItem.setDescription(menuItemDTO.getDescription());
        existingItem.setPrice(menuItemDTO.getPrice());
        existingItem.setCategory(menuItemDTO.getCategory());

        // Handle image upload if present
        if (menuItemDTO.getImageFile() != null && !menuItemDTO.getImageFile().isEmpty()) {
            try {
                String imageUrl = cloudinaryServiceImpl.uploadImage(menuItemDTO.getImageFile());
                existingItem.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        return menuItemRepository.save(existingItem);
    }


    public void deleteMenuItem(String restaurantId, String itemId) {
        menuItemRepository.deleteByIdAndRestaurantId(itemId, restaurantId);
    }

    public List<MenuItem> getMenuItems(String restaurantId) {
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantId(restaurantId);

        if (menuItems == null || menuItems.isEmpty()) {
            throw new NoSuchElementException("No menu items found for restaurant ID: " + restaurantId);
        }

        return menuItems;
    }

    public MenuItem toggleItemAvailability(String restaurantId, String itemId) {
        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new NoSuchElementException("Menu item not found"));

        menuItem.setAvailable(!menuItem.isAvailable());
        return menuItemRepository.save(menuItem);
    }
}
