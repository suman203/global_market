package com.globalmarket.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String passwordConfirm;
    private String firstName;
    private String lastName;
    private String city;
    private String gender;
    private int age;
}
