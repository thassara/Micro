//package com.api_gateway.demo.filter;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import org.springframework.cloud.gateway.filter.GatewayFilter;
//import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.stereotype.Component;
//
//@Component
//public class RoleBasedAccessFilter extends AbstractGatewayFilterFactory<RoleBasedAccessFilter.Config> {
//
//    public RoleBasedAccessFilter() {
//        super(Config.class);
//    }
//
//    @Override
//    public GatewayFilter apply(Config config) {
//        return (exchange, chain) -> {
//            ServerHttpRequest request = exchange.getRequest();
//            String authHeader = request.getHeaders().getFirst("Authorization");
//
//            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                return exchange.getResponse().setComplete();
//            }
//
//            String token = authHeader.substring(7);  // Remove "Bearer "
//
//            String role;
//            try {
//                Claims claims = Jwts.parser()
//                        .setSigningKey("mySuperSecretKeyThatIsLongEnough123456")
//                        .parseClaimsJws(token)
//                        .getBody();
//                role = (String) claims.get("role");  // Get 'role' from token payload
//            } catch (Exception e) {
//                return exchange.getResponse().setComplete();
//            }
//
//            String path = request.getURI().getPath();
//
//            if (role == null) {
//                return exchange.getResponse().setComplete();
//            }
//
//            // Role-based path access control
//            if (role.equals("RESTURENTADMIN") && path.startsWith("/restaurants")) {
//                return chain.filter(exchange);
//            } else if (role.equals("CUSTOMER") && path.startsWith("/order")) {
//                return chain.filter(exchange);
//            } else if (role.equals("DELIVERY") && path.startsWith("/payment")) {
//                return chain.filter(exchange);
//            }
//
//            return exchange.getResponse().setComplete();
//        };
//    }
//
//    public static class Config {
//        // Empty config class required by AbstractGatewayFilterFactory
//    }
//}
