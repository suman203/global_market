package com.globalmarket.rest;

import com.globalmarket.domain.Product;
import com.globalmarket.rest.dto.ApiError;
import com.globalmarket.rest.dto.ProductRequest;
import com.globalmarket.service.CategoryService;
import com.globalmarket.service.ProductService;
import com.globalmarket.validator.ProductValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductRestController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final ProductValidator productValidator;
    private final DtoMapper mapper;
    private final MessageSource messageSource;

    @Autowired
    public AdminProductRestController(ProductService productService, CategoryService categoryService,
                                     ProductValidator productValidator, DtoMapper mapper, MessageSource messageSource) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.productValidator = productValidator;
        this.mapper = mapper;
        this.messageSource = messageSource;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductRequest request, Locale locale) {
        Product product = buildProduct(request);
        Errors errors = new BeanPropertyBindingResult(product, "product");
        productValidator.validate(product, errors);
        if (errors.hasErrors()) {
            return ResponseEntity.badRequest().body(new ApiError(400, "Validation failed", fieldErrors(errors, locale)));
        }
        productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toProductDto(productService.findById(product.getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") long id, @RequestBody ProductRequest request, Locale locale) {
        Product existing = productService.findById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        Product product = buildProduct(request);
        product.setId(id);
        Errors errors = new BeanPropertyBindingResult(product, "product");
        productValidator.validate(product, errors);
        if (errors.hasErrors()) {
            return ResponseEntity.badRequest().body(new ApiError(400, "Validation failed", fieldErrors(errors, locale)));
        }
        productService.edit(id, product);
        return ResponseEntity.ok(mapper.toProductDto(productService.findById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") long id) {
        Product existing = productService.findById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Product buildProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName() == null ? "" : request.getName());
        product.setDescription(request.getDescription() == null ? "" : request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setPrice(request.getPrice());
        if (request.getCategoryId() != null) {
            product.setCategory(categoryService.findById(request.getCategoryId()));
        }
        return product;
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
