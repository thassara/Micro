package com.savorySwift.deliveryService.repository;

import com.savorySwift.deliveryService.model.Delivery;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DeliveryRepository extends MongoRepository<Delivery, String> {
}
