package com.lms.config;

import com.lms.model.User;
import com.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;

/**
 * Seeds a default ADMIN user on application startup if one does not already exist.
 *
 * Credentials are read from environment variables (or application.properties):
 *   ADMIN_USERNAME  (default: admin)
 *   ADMIN_EMAIL     (default: admin@learnflow.com)
 *   ADMIN_PASSWORD  (default: Admin@123)
 *
 * The admin is only created when no user with the configured username exists,
 * making this safe to run on every startup.
 */
@Configuration
public class AdminConfig implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminConfig.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.email:admin@learnflow.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        User existing = userRepository.findByUserName(adminUsername);
        if (existing != null) {
            log.info("Admin user '{}' already exists — skipping creation.", adminUsername);
            return;
        }

        User admin = new User();
        admin.setUserName(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRoles(Arrays.asList("ADMIN", "INSTRUCTOR", "USER"));
        admin.setCreatedAt(LocalDateTime.now());

        userRepository.save(admin);
        log.info("Default admin user '{}' created successfully.", adminUsername);
    }
}
