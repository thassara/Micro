//package com.api_gateway.demo.config;
//
//import io.swagger.v3.oas.models.OpenAPI;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springdoc.core.GroupedOpenApi;
//import org.springframework.web.bind.annotation.RequestMethod;
//import io.swagger.v3.oas.models.info.Info;
//
//@Configuration
//public class SwaggerConfig {
//
//    @Bean
//    public GroupedOpenApi publicApi() {
//        return GroupedOpenApi.builder()
//                .group("public")
//                .pathsToMatch("/api/**")  // Only include paths under /api/
//                .build();
//    }
//
//    @Bean
//    public OpenAPI customOpenAPI() {
//        return new OpenAPI().info(new Info().title("My API")
//                .version("1.0")
//                .description("API documentation for My application"));
//    }
//}
