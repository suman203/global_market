package com.globalmarket.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private int status;
    private String message;
    private Map<String, String> fieldErrors;

    public ApiError(int status, String message) {
        this(status, message, null);
    }
}
