package com.lms.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class EnvConfig implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            Dotenv dotenv = Dotenv.load();

            Map<String, Object> envMap = new HashMap<>();
            envMap.put("spring.datasource.url", dotenv.get("DB_URL"));
            envMap.put("spring.datasource.username", dotenv.get("DB_USERNAME"));
            envMap.put("spring.datasource.password", dotenv.get("DB_PASSWORD"));
            envMap.put("cloudinary.cloud_name", dotenv.get("CLOUDINARY_CLOUD_NAME"));
            envMap.put("cloudinary.api_key", dotenv.get("CLOUDINARY_API_KEY"));
            envMap.put("cloudinary.api_secret", dotenv.get("CLOUDINARY_API_SECRET"));

            MapPropertySource propertySource = new MapPropertySource("dotenv", envMap);
            environment.getPropertySources().addFirst(propertySource);

            System.out.println("✓ Successfully loaded environment variables from .env file");
        } catch (Exception e) {
            System.out.println("Warning: .env file not found, using system environment variables");
            // Fallback to system environment variables
            Map<String, Object> envMap = new HashMap<>();
            envMap.put("spring.datasource.url", System.getenv("DB_URL"));
            envMap.put("spring.datasource.username", System.getenv("DB_USERNAME"));
            envMap.put("spring.datasource.password", System.getenv("DB_PASSWORD"));

            MapPropertySource propertySource = new MapPropertySource("system-env", envMap);
            environment.getPropertySources().addFirst(propertySource);
        }
    }
}
