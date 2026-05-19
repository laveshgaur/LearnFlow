package com.lms.dto.request;

public record ModuleRequest(
        String moduleName,
        String moduleDescription,
        String moduleDuration,
        String modulePrice,
        String moduleImage,
        String moduleStatus
) {}
