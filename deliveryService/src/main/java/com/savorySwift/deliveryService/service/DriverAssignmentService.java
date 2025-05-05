package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Location;

public interface DriverAssignmentService {
    String assignDriver(Location orderLocation);
    String proposeDriverAssignment(Location orderLocation);
}
