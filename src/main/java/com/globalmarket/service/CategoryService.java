package com.globalmarket.service;

import com.globalmarket.domain.Category;

import java.util.List;


public interface CategoryService {

    void save(Category category);
    List<Category> findAll();
    Category findById(long id);
}
