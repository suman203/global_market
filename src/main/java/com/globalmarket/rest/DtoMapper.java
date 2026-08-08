package com.globalmarket.rest;

import com.globalmarket.domain.Category;
import com.globalmarket.domain.Product;
import com.globalmarket.domain.User;
import com.globalmarket.rest.dto.CartDto;
import com.globalmarket.rest.dto.CartItemDto;
import com.globalmarket.rest.dto.CategoryDto;
import com.globalmarket.rest.dto.ProductDto;
import com.globalmarket.rest.dto.UserDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public CategoryDto toCategoryDto(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryDto(category.getId(), category.getCategoryName());
    }

    public List<CategoryDto> toCategoryDtos(List<Category> categories) {
        return categories.stream().map(this::toCategoryDto).collect(Collectors.toList());
    }

    public ProductDto toProductDto(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImageUrl(),
                product.getPrice(),
                toCategoryDto(product.getCategory())
        );
    }

    public List<ProductDto> toProductDtos(List<Product> products) {
        return products.stream().map(this::toProductDto).collect(Collectors.toList());
    }

    public UserDto toUserDto(User user) {
        if (user == null) {
            return null;
        }
        String role = Objects.equals(user.getUsername(), "admin") ? "ADMIN" : "USER";
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAge(),
                user.getCity(),
                user.getGender(),
                role
        );
    }

    public CartDto toCartDto(Map<Product, Integer> cart) {
        List<CartItemDto> items = cart.entrySet().stream()
                .map(entry -> new CartItemDto(toProductDto(entry.getKey()), entry.getValue()))
                .collect(Collectors.toList());
        BigDecimal totalPrice = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int count = items.stream().mapToInt(CartItemDto::getQuantity).sum();
        return new CartDto(items, totalPrice, count);
    }
}
