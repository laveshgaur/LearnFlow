package com.lms.controller;

import com.lms.model.User;
import com.lms.service.ValidityChecker;
import com.lms.service.UserService;
import com.lms.service.UserDetailsServiceImpl;
import com.lms.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/")
public class PublicController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        if (!ValidityChecker.isValidUser(user)) {
            return new ResponseEntity<>("Invalid user data", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        if (user.getUserName() == null || user.getUserName().isBlank() ||
                user.getPassword() == null || user.getPassword().isBlank()) {
            return new ResponseEntity<>("Missing username or password", HttpStatus.BAD_REQUEST);
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), user.getPassword())
            );
            if (authentication.isAuthenticated()) {
                UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(user.getUserName());
                String token = jwtUtil.generateToken(userDetails.getUsername());
                return new ResponseEntity<>(token, HttpStatus.OK);
            }
            return new ResponseEntity<>("Authentication failed", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }
    }
}
