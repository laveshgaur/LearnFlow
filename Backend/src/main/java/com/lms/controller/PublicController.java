package com.lms.controller;

import com.lms.model.User;
import com.lms.service.ValidityChecker;
import com.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/create-user")
public class PublicController {
    @Autowired
    private UserService userService;
    @PostMapping()
    public ResponseEntity<?> createUser(@RequestBody User user){
        if(!ValidityChecker.isValidPassword(user.getPassword())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidEmail(user.getEmail())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidUsername(user.getUserName())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidSqlInjection(user.getPassword())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidXSS(user.getUserName())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidCSRF(user.getEmail())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidHeader(user.getPassword())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if(!ValidityChecker.isValidFooter(user.getEmail())){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }
}
