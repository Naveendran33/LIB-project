package com.lib_management.LIB.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the application.
 * This class allows the frontend to communicate with the backend API,
 * as they are running on different ports (different origins).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @SuppressWarnings("null")
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Apply this CORS configuration to all API endpoints
                .allowedOrigins("http://127.0.0.1:5500") // Allow requests only from this specific origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow these HTTP methods
                .allowedHeaders("*") // Allow all headers in the requests
                .allowCredentials(true); // Allow sending of cookies and authentication headers
    }
}
