package com.lms.dto.request;

import java.util.List;

public record CreateUserAdminRequest(
        String userName,
        String email,
        String password,
        int age,
        List<String> roles
) {}
