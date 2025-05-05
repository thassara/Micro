package com.savorySwift.deliveryService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveryMessage {
    private String orderId;
    private String customerId;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
}