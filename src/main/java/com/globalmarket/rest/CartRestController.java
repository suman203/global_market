package com.globalmarket.rest;

import com.globalmarket.domain.Product;
import com.globalmarket.rest.dto.CartDto;
import com.globalmarket.service.ProductService;
import com.globalmarket.service.ShoppingCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartRestController {
    private final ShoppingCartService cartService;
    private final ProductService productService;
    private final DtoMapper mapper;

    @Autowired
    public CartRestController(ShoppingCartService cartService, ProductService productService, DtoMapper mapper) {
        this.cartService = cartService;
        this.productService = productService;
        this.mapper = mapper;
    }

    @GetMapping
    public CartDto cart() {
        return mapper.toCartDto(cartService.productsInCart());
    }

    @PostMapping("/items/{id}")
    public ResponseEntity<?> add(@PathVariable("id") long id) {
        Product product = productService.findById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        cartService.addProduct(product);
        return ResponseEntity.ok(mapper.toCartDto(cartService.productsInCart()));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<CartDto> remove(@PathVariable("id") long id) {
        Product product = productService.findById(id);
        if (product != null) {
            cartService.removeProduct(product);
        }
        return ResponseEntity.ok(mapper.toCartDto(cartService.productsInCart()));
    }

    @PostMapping("/clear")
    public ResponseEntity<CartDto> clear() {
        cartService.clearProducts();
        return ResponseEntity.ok(mapper.toCartDto(cartService.productsInCart()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CartDto> checkout() {
        cartService.cartCheckout();
        return ResponseEntity.ok(mapper.toCartDto(cartService.productsInCart()));
    }
}
