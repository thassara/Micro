package com.hiran.restaurantService.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


public class MenuItemDTO {
    private String name;
    private String description;
    private double price;
    private String category;
    private MultipartFile imageFile; // Store the URL/path to the image

    public MultipartFile getImageFile() {
        return imageFile;
    }

    public void setImageFile(MultipartFile imageFile) {
        this.imageFile = imageFile;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}