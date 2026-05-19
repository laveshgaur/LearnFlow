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
import com.lms.dto.request.LoginRequest;
import com.lms.dto.request.RegisterRequest;
import com.lms.dto.mapper.DtoMapper;

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
    public ResponseEntity<?> signUp(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUserName(request.userName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setAge(request.age());

        if (!ValidityChecker.isValidUser(user)) {
            return new ResponseEntity<>("Invalid user data", HttpStatus.BAD_REQUEST);
        }
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(DtoMapper.toUserResponse(createdUser), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.userName() == null || request.userName().isBlank() ||
                request.password() == null || request.password().isBlank()) {
            return new ResponseEntity<>("Missing username or password", HttpStatus.BAD_REQUEST);
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.userName(), request.password())
            );
            if (authentication.isAuthenticated()) {
                UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(request.userName());
                String token = jwtUtil.generateToken(userDetails.getUsername());
                return new ResponseEntity<>(token, HttpStatus.OK);
            }
            return new ResponseEntity<>("Authentication failed", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }
    }
}
