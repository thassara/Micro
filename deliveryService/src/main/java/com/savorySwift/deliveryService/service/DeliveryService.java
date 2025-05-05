package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Delivery;
import com.savorySwift.deliveryService.model.Location;

import java.util.List;

public interface DeliveryService {
    Delivery createDelivery(String orderId, String customerId, Location deliveryLocation, Location restaurantLocation);
    Delivery updateDeliveryStatus(String deliveryId, String status);
    Delivery updateDriverLocation(String deliveryId, Location location);
    Delivery updateDelivery(Delivery delivery);
    Delivery getDeliveryById(String deliveryId);
    List<Delivery> getAllDeliveries();
    void deleteDelivery(String deliveryId);

}
