package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Driver;
import com.savorySwift.deliveryService.model.Location;
import com.savorySwift.deliveryService.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DriverAssignmentServiceImpl implements DriverAssignmentService {

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public String assignDriver(Location orderLocation) {
        List<Driver> availableDrivers = driverRepository.findByAvailableTrue();
        if (availableDrivers.isEmpty()) {
            throw new RuntimeException("No available drivers");
        }

        Driver closestDriver = availableDrivers.stream()
                .min(Comparator.comparingDouble(driver -> calculateDistance(
                        orderLocation.getLatitude(), orderLocation.getLongitude(),
                        driver.getCurrentLocation().getLatitude(), driver.getCurrentLocation().getLongitude())))
                .orElseThrow(() -> new RuntimeException("No available drivers"));

        closestDriver.setAvailable(false);
        driverRepository.save(closestDriver);
        return closestDriver.getId();
    }

    @Override
    public String proposeDriverAssignment(Location orderLocation) {
        List<Driver> availableDrivers = driverRepository.findByAvailableTrue();
        if (availableDrivers.isEmpty()) throw new RuntimeException("No available drivers");

        Driver closestDriver = availableDrivers.stream()
                .min(Comparator.comparingDouble(driver -> calculateDistance(
                        orderLocation.getLatitude(), orderLocation.getLongitude(),
                        driver.getCurrentLocation().getLatitude(), driver.getCurrentLocation().getLongitude())))
                .orElseThrow(() -> new RuntimeException("No available drivers"));

        return closestDriver.getId();
    }

    // ✅ Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
