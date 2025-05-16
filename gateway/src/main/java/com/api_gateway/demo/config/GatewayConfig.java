//package com.api_gateway.demo.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
//@Configuration
//public class GatewayConfig {
//
//    @Bean
//    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
//        http
//                .csrf(csrf -> csrf.disable())
//                .authorizeExchange(exchanges -> exchanges
//                        .pathMatchers(
//                                "/api/auth/**",
//                                "/swagger-ui/**",
//                                "/v3/api-docs/**"
//                        ).permitAll()
//                        .anyExchange().authenticated()
//                )
//                .httpBasic(basic -> basic.disable())
//                .formLogin(login -> login.disable());
//
//        return http.build();
//    }
//}