//package com.api_gateway.demo.filter;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.cloud.gateway.filter.GatewayFilter;
//import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//@Component
//public class RoleFilter extends AbstractGatewayFilterFactory<RoleFilter.Config> {
//
//    @Value("${jwt.secret}")
//    private String jwtSecret;
//
//    public RoleFilter() {
//        super(Config.class);
//    }
//
//    @Override
//    public GatewayFilter apply(Config config) {
//        return (exchange, chain) -> {
//            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
//
//            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//                return exchange.getResponse().setComplete();
//            }
//
//            String token = authHeader.substring(7);
//            try {
//                Claims claims = Jwts.parser()
//                        .setSigningKey(jwtSecret.getBytes())
//                        .parseClaimsJws(token)
//                        .getBody();
//
//                String role = claims.get("role", String.class);
//
//                if (!config.getAllowedRole().equals(role)) {
//                    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
//                    return exchange.getResponse().setComplete();
//                }
//            } catch (Exception e) {
//                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//                return exchange.getResponse().setComplete();
//            }
//
//            return chain.filter(exchange);
//        };
//    }
//
//    public static class Config {
//        private String allowedRole;
//
//        public String getAllowedRole() {
//            return allowedRole;
//        }
//
//        public void setAllowedRole(String allowedRole) {
//            this.allowedRole = allowedRole;
//        }
//    }
//}
