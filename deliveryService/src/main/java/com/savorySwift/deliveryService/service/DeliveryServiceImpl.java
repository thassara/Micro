package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.model.Delivery;
import com.savorySwift.deliveryService.model.Driver;
import com.savorySwift.deliveryService.model.Location;
import com.savorySwift.deliveryService.repository.DeliveryRepository;
import com.savorySwift.deliveryService.util.GoogleMapsUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {
    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private GoogleMapsUtil googleMapsUtil;

    @Autowired
    private DriverAssignmentService driverAssignmentService;

    @Autowired
    private DriverService driverService;

    @Autowired
    private WebSocketService webSocketService;


    @Override
    public Delivery createDelivery(String orderId, String customerId, Location deliveryLocation, Location restaurantLocation) {
        // Reverse geocode delivery and restaurant locations
        String deliveryAddress = googleMapsUtil.getAddressFromCoordinates(
                deliveryLocation.getLatitude(), deliveryLocation.getLongitude());
        deliveryLocation.setAddress(deliveryAddress);

        String restaurantAddress = googleMapsUtil.getAddressFromCoordinates(
                restaurantLocation.getLatitude(), restaurantLocation.getLongitude());
        restaurantLocation.setAddress(restaurantAddress);

        // Propose driver instead of assigning
        String driverId = driverAssignmentService.proposeDriverAssignment(deliveryLocation);

        // Fetch the proposed driver to get current location
        Driver proposedDriver = driverService.getDriverById(driverId)
                .orElseThrow(() -> new RuntimeException("Proposed driver not found"));

        // Set delivery fields
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setCustomerId(customerId);
        delivery.setDeliveryLocation(deliveryLocation);
        delivery.setRestaurantLocation(restaurantLocation);
        delivery.setDriverId(driverId);
        delivery.setDriverLocation(proposedDriver.getCurrentLocation());
        delivery.setStatus("WAITING_FOR_DRIVER_RESPONSE"); // Set initial status
        delivery.setAssignmentStatus("PENDING"); // Set pending assignment status
        delivery.addStatusChange("WAITING_FOR_DRIVER_RESPONSE"); // Log status change

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Notify clients about the new delivery
        webSocketService.notifyNewDelivery(savedDelivery);

        return savedDelivery;
    }

    @Override
    public Delivery updateDelivery(Delivery delivery) {
        // Log the incoming delivery state
        System.out.println("Updating delivery: ID=" + delivery.getId() +
                ", Status=" + delivery.getStatus() +
                ", Assignment=" + delivery.getAssignmentStatus() +
                ", History=" + delivery.getStatusHistory());

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Log the saved delivery state
        System.out.println("Saved delivery: ID=" + savedDelivery.getId() +
                ", Status=" + savedDelivery.getStatus() +
                ", Assignment=" + savedDelivery.getAssignmentStatus() +
                ", History=" + savedDelivery.getStatusHistory());

        return savedDelivery;
    }


    @Override
    public Delivery updateDriverLocation(String deliveryId, Location location) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        location.setLastUpdated(Instant.now()); // ✅ Ensure timestamp is up to date
        delivery.setDriverLocation(location);

        Delivery updated = deliveryRepository.save(delivery);

        // ✅ Broadcast update to WebSocket
        webSocketService.sendRealTimeLocationUpdate(
                deliveryId,
                updated.getStatus(),
                updated.getDriverLocation()
        );


        return updated;
    }

    @Override
    public Delivery updateDeliveryStatus(String deliveryId, String status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        delivery.setStatus(status);

        // 🔥 Add timestamped status change to history (optional)
        delivery.getStatusHistory().add(new Delivery.StatusChange(status, Instant.now()));

        Delivery updated = deliveryRepository.save(delivery);

        // 🔥 Send WebSocket update
        webSocketService.sendRealTimeLocationUpdate(
                deliveryId,
                updated.getStatus(),
                updated.getDriverLocation()
        );

        return updated;
    }




    @Override
    public Delivery getDeliveryById(String deliveryId) {
        return deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
    }

    @Override
    public void deleteDelivery(String deliveryId) {
        if (!deliveryRepository.existsById(deliveryId)) {
            throw new RuntimeException("Delivery not found with ID: " + deliveryId);
        }
        deliveryRepository.deleteById(deliveryId);
    }


    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

}