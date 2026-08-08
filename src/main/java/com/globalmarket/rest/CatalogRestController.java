package com.globalmarket.rest;

import com.globalmarket.domain.Product;
import com.globalmarket.rest.dto.CategoryDto;
import com.globalmarket.rest.dto.ProductDto;
import com.globalmarket.service.CategoryService;
import com.globalmarket.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogRestController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final DtoMapper mapper;

    @Autowired
    public CatalogRestController(ProductService productService, CategoryService categoryService, DtoMapper mapper) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.mapper = mapper;
    }

    @GetMapping("/products")
    public List<ProductDto> products(@RequestParam(value = "categoryId", required = false) Long categoryId,
                                     @RequestParam(value = "q", required = false) String q,
                                     @RequestParam(value = "sort", required = false) String sort) {
        List<Product> products;
        if (categoryId != null) {
            products = productService.findAllByCategoryId(categoryId);
        } else if (q != null && !q.isBlank()) {
            products = productService.searchByName(q.trim());
        } else {
            products = productService.findAllByOrderByIdAsc();
        }

        if ("price_asc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice));
        } else if ("price_desc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getPrice).reversed());
        } else if ("newest".equals(sort)) {
            products.sort(Comparator.comparing(Product::getId).reversed());
        }

        return mapper.toProductDtos(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> product(@PathVariable("id") long id) {
        Product product = productService.findById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toProductDto(product));
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return mapper.toCategoryDtos(categoryService.findAll());
    }
}
