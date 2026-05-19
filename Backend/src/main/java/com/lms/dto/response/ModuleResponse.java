package com.lms.dto.response;

public record ModuleResponse(
        int moduleId,
        String moduleName,
        String moduleDescription,
        String moduleDuration,
        String modulePrice,
        String moduleImage,
        String moduleStatus
) {}
