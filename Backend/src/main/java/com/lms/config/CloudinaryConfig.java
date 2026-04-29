package com.lms.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.cloudinary.Cloudinary;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        
        // Try to load from .env file first
        try {
            Dotenv dotenv = Dotenv.load();
            config.put("cloud_name", dotenv.get("CLOUDINARY_CLOUD_NAME"));
            config.put("api_key", dotenv.get("CLOUDINARY_API_KEY"));
            config.put("api_secret", dotenv.get("CLOUDINARY_API_SECRET"));
        } catch (Exception e) {
            System.out.println("Warning: .env file not found, trying system environment variables");
            // Fallback to system environment variables
            config.put("cloud_name", System.getenv("CLOUDINARY_CLOUD_NAME"));
            config.put("api_key", System.getenv("CLOUDINARY_API_KEY"));
            config.put("api_secret", System.getenv("CLOUDINARY_API_SECRET"));
        }
        
        // Validate configuration
        if (config.get("cloud_name") == null || config.get("api_key") == null || config.get("api_secret") == null) {
            System.err.println("ERROR: Cloudinary credentials are missing!");
            System.err.println("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        }

        return new Cloudinary(config);
    }
}