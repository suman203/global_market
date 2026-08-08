package com.globalmarket.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private int age;
    private String city;
    private String gender;
    private String role;
}
