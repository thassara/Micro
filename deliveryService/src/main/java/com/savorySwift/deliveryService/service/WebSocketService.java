package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Delivery;
import com.savorySwift.deliveryService.model.Location;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendRealTimeLocationUpdate(String deliveryId, String status, Location driverLocation) {
        messagingTemplate.convertAndSend("/topic/delivery/" + deliveryId,
                new DeliveryUpdate(status, driverLocation));
    }

    public void notifyDriverResponse(String deliveryId, String response) {
        messagingTemplate.convertAndSend(
                "/topic/delivery/" + deliveryId + "/driver-response",
                new DriverResponseMessage(response)
        );
    }


    // New method to notify about new deliveries
    public void notifyNewDelivery(Delivery delivery) {
        messagingTemplate.convertAndSend("/topic/deliveries", delivery);
    }

    public static class DeliveryUpdate {
        private String status;
        private Location driverLocation;

        public DeliveryUpdate(String status, Location driverLocation) {
            this.status = status;
            this.driverLocation = driverLocation;
        }

        public String getStatus() { return status; }
        public Location getDriverLocation() { return driverLocation; }
    }



    public static class DriverResponseMessage {
        private String response;

        // Add this constructor
        public DriverResponseMessage(String response) {
            this.response = response;
        }

        // No-arg constructor (for JSON serialization)
        public DriverResponseMessage() {}

        // Getter and setter
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
    }
}