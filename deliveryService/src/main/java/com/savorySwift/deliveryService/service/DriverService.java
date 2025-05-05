package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Driver;
import com.savorySwift.deliveryService.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {
    @Autowired
    private DriverRepository driverRepository;

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }

    public Driver updateDriver(String id, Driver updatedDriver) {
        return driverRepository.findById(id)
                .map(driver -> {
                    driver.setName(updatedDriver.getName());
                    driver.setAvailable(updatedDriver.isAvailable());
                    driver.setCurrentLocation(updatedDriver.getCurrentLocation());
                    driver.setContactNumber(updatedDriver.getContactNumber());
                    driver.setVehicleId(updatedDriver.getVehicleId());
                    return driverRepository.save(driver);
                })
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public void deleteDriver(String id) {
        driverRepository.deleteById(id);
    }
}
