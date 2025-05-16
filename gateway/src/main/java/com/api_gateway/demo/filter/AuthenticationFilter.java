//package com.api_gateway.demo.filter;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import org.springframework.stereotype.Component;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//@Component
//public class AuthenticationFilter implements GlobalFilter {
//
//    private String secretKey = "mySuperSecretKeyThatIsLongEnough123456";
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
//        String path = exchange.getRequest().getPath().toString();
//
//        // Get Authorization header
//        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            return Mono.error(new RuntimeException("Missing or invalid Authorization header"));
//        }
//
//        String token = authHeader.substring(7); // Remove "Bearer "
//
//        // Parse token
//        Claims claims;
//        try {
//            claims = Jwts.parser()
//                    .setSigningKey(secretKey)
//                    .parseClaimsJws(token)
//                    .getBody();
//        } catch (Exception e) {
//            return Mono.error(new RuntimeException("Invalid token"));
//        }
//
//        String role = claims.get("role", String.class);
//
//        // Now check route and role
//        if (path.startsWith("/restaurants") && !"RESTURENTADMIN".equals(role)) {
//            return Mono.error(new RuntimeException("Unauthorized access to Restaurant Service"));
//        } else if (path.startsWith("/api/order") && !"CUSTOMER".equals(role)) {
//            return Mono.error(new RuntimeException("Unauthorized access to Order Service"));
//        } else if (path.startsWith("/api/delivery") && !"DELIVERY_PERSON".equals(role)) {
//            return Mono.error(new RuntimeException("Unauthorized access to Delivery Service"));
//        }
//
//        // If role matches, continue
//        return chain.filter(exchange);
//    }
//}
