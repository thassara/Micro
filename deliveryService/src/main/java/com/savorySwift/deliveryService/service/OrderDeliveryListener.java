package com.savorySwift.deliveryService.service;

import com.savorySwift.deliveryService.config.RabbitMQConfig;
import com.savorySwift.deliveryService.dto.OrderDeliveryMessage;
import com.savorySwift.deliveryService.model.Location;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OrderDeliveryListener {

    @Autowired
    private DeliveryService deliveryService;

    // SLIIT Main Building, Malabe coordinates
    private static final double RESTAURANT_LATITUDE = 6.9147;
    private static final double RESTAURANT_LONGITUDE = 79.9724;

    @RabbitListener(queues = RabbitMQConfig.ORDER_DELIVERY_QUEUE)
    public void handleOrderReadyForPickup(OrderDeliveryMessage message) {
        Location deliveryLocation = new Location();
        deliveryLocation.setLatitude(message.getDeliveryLatitude());
        deliveryLocation.setLongitude(message.getDeliveryLongitude());

        Location restaurantLocation = new Location();
        restaurantLocation.setLatitude(RESTAURANT_LATITUDE);
        restaurantLocation.setLongitude(RESTAURANT_LONGITUDE);

        deliveryService.createDelivery(
                message.getOrderId(),
                message.getCustomerId(),
                deliveryLocation,
                restaurantLocation
        );
    }
}