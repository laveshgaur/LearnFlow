package com.lms.controller;

import com.lms.model.User;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import java.util.stream.Collectors;
import com.lms.dto.request.CreateUserAdminRequest;
import com.lms.dto.response.UserResponse;
import com.lms.dto.mapper.DtoMapper;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        if (users != null && !users.isEmpty()) {
            List<UserResponse> responses = users.stream()
                    .map(DtoMapper::toUserResponse)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(responses, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody CreateUserAdminRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.getUserByUsername(authentication.getName());
        if(currentUser == null || !currentUser.getRoles().stream().anyMatch(role -> role.equals("ADMIN"))){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = new User();
        user.setUserName(request.userName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setAge(request.age());
        
        List<String> roles = request.roles();
        if (roles == null || roles.isEmpty()) {
            user.setRoles(java.util.Arrays.asList("USER"));
        } else {
            user.setRoles(roles);
        }
        
        User createdUser = userService.createUserByAdmin(user);
        if(createdUser != null){
            return new ResponseEntity<>(DtoMapper.toUserResponse(createdUser), HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
