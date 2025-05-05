package com.savorySwift.deliveryService.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_DELIVERY_QUEUE = "order-delivery-queue";
    public static final String ORDER_DELIVERY_EXCHANGE = "order-delivery-exchange";
    public static final String ORDER_DELIVERY_ROUTING_KEY = "order.ready.for.pickup";

    @Bean
    public Queue orderDeliveryQueue() {
        return new Queue(ORDER_DELIVERY_QUEUE, true);
    }

    @Bean
    public TopicExchange orderDeliveryExchange() {
        return new TopicExchange(ORDER_DELIVERY_EXCHANGE);
    }

    @Bean
    public Binding binding(Queue orderDeliveryQueue, TopicExchange orderDeliveryExchange) {
        return BindingBuilder.bind(orderDeliveryQueue)
                .to(orderDeliveryExchange)
                .with(ORDER_DELIVERY_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}