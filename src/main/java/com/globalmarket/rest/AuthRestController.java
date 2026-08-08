package com.globalmarket.rest;

import com.globalmarket.domain.User;
import com.globalmarket.rest.dto.ApiError;
import com.globalmarket.rest.dto.LoginRequest;
import com.globalmarket.rest.dto.RegisterRequest;
import com.globalmarket.service.UserService;
import com.globalmarket.validator.UserValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {
    private static final Logger logger = LoggerFactory.getLogger(AuthRestController.class);
    private final UserService userService;
    private final UserValidator userValidator;
    private final DtoMapper mapper;
    private final MessageSource messageSource;

    @Autowired
    public AuthRestController(UserService userService, UserValidator userValidator, DtoMapper mapper, MessageSource messageSource) {
        this.userService = userService;
        this.userValidator = userValidator;
        this.mapper = mapper;
        this.messageSource = messageSource;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError(401, "Invalid username or password."));
        }
        try {
            userService.login(request.getUsername(), request.getPassword());
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiError(401, "Invalid username or password."));
        }
        return ResponseEntity.ok(mapper.toUserDto(userService.findByUsername(request.getUsername())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            User user = userService.findByUsername(authentication.getName());
            if (user != null) {
                return ResponseEntity.ok(mapper.toUserDto(user));
            }
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, Locale locale) {
        User user = new User();
        user.setUsername(request.getUsername() == null ? "" : request.getUsername());
        user.setEmail(request.getEmail() == null ? "" : request.getEmail());
        user.setPassword(request.getPassword() == null ? "" : request.getPassword());
        user.setPasswordConfirm(request.getPasswordConfirm() == null ? "" : request.getPasswordConfirm());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCity(request.getCity());
        user.setGender(request.getGender() == null ? "" : request.getGender());
        user.setAge(request.getAge());

        Errors errors = new BeanPropertyBindingResult(user, "userForm");
        userValidator.validate(user, errors);
        if (errors.hasErrors()) {
            return ResponseEntity.badRequest().body(new ApiError(400, "Validation failed", fieldErrors(errors, locale)));
        }

        String rawPassword = user.getPassword();
        userService.save(user);
        userService.login(user.getUsername(), rawPassword);
        logger.debug("User {} registered successfully.", user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toUserDto(userService.findByUsername(user.getUsername())));
    }

    private Map<String, String> fieldErrors(Errors errors, Locale locale) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : errors.getFieldErrors()) {
            String message = messageSource.getMessage(error.getCode(), error.getArguments(), error.getDefaultMessage(), locale);
            fieldErrors.putIfAbsent(error.getField(), message);
        }
        return fieldErrors;
    }
}
