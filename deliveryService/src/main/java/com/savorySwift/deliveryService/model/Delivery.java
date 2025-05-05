package com.savorySwift.deliveryService.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "deliveries")
public class Delivery {
    @Id
    private String id;
    private String orderId;
    private String customerId; // ✅ New field
    private String driverId;
    private Location deliveryLocation;
    private String status;
    private Location driverLocation;
    private Location restaurantLocation;
    private String assignmentStatus = "PENDING";

    private List<StatusChange> statusHistory = new ArrayList<>(); // ✅ New field

    public List<StatusChange> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusChange> statusHistory) { this.statusHistory = statusHistory; }

    public void addStatusChange(String status) {
        if (status == null) {
            System.out.println("Warning: Attempted to add null status to history");
            return; // Prevent adding null status
        }
        this.statusHistory.add(new StatusChange(status, Instant.now()));
    }

    public static class StatusChange {
        private String status;
        private Instant timestamp;

        public StatusChange() {}

        public StatusChange(String status, Instant timestamp) {
            this.status = status;
            this.timestamp = timestamp;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerId() { return customerId; } // ✅
    public void setCustomerId(String customerId) { this.customerId = customerId; } // ✅

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public Location getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(Location deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Location getDriverLocation() { return driverLocation; }
    public void setDriverLocation(Location driverLocation) { this.driverLocation = driverLocation; }

    public Location getRestaurantLocation() { return restaurantLocation; }
    public void setRestaurantLocation(Location restaurantLocation) { this.restaurantLocation = restaurantLocation; }

    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }
}
