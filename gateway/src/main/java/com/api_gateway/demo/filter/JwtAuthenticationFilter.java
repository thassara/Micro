//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.api_gateway.demo.filter;

import com.api_gateway.demo.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    @Autowired
    private JwtService jwtService;

    public JwtAuthenticationFilter() {
    }

    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        if (path.startsWith("/api/auth/")) {
            return chain.filter(exchange);
        } else {
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                try {
                    Claims claims = this.jwtService.validateToken(token);
                    String role = (String)claims.get("role", String.class);
                    if (!this.isAuthorized(path, role)) {
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    } else {
                        ServerHttpRequest modifiedRequest = request.mutate().header("X-User-Role", new String[]{role}).header("X-Username", new String[]{claims.getSubject()}).build();
                        return chain.filter(exchange.mutate().request(modifiedRequest).build());
                    }
                } catch (Exception var10) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            } else {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }
    }

    private boolean isAuthorized(String path, String role) {
        if (path.startsWith("/restaurants/")) {
            return role.equals("RESTURENTADMIN");
        } else if (path.startsWith("/api/public/delivery/")) {
            return role.equals("delivery");
        } else if (path.startsWith("/api/public/orders/")) {
            return role.equals("order");
        } else {
            return path.startsWith("/api/public/customer/") ? role.equals("customer") : false;
        }
    }

    public int getOrder() {
        return -1;
    }
}
