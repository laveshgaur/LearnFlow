package com.lms.dto.request;

public record RegisterRequest(
        String userName,
        String email,
        String password,
        int age
) {}
