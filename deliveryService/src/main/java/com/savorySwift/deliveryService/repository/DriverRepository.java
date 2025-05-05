package com.savorySwift.deliveryService.repository;

import com.savorySwift.deliveryService.model.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DriverRepository extends MongoRepository<Driver, String> {
    List<Driver> findByAvailableTrue();
}
