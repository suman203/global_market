package com.globalmarket;

import com.globalmarket.domain.Category;
import com.globalmarket.domain.Product;
import com.globalmarket.repository.CategoryRepository;
import com.globalmarket.service.ProductService;
import com.globalmarket.domain.User;
import com.globalmarket.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MarketDataInitializer implements CommandLineRunner {
    private final UserService userService;
    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private static final Logger logger = LoggerFactory.getLogger(MarketDataInitializer.class);

    @Autowired
    public MarketDataInitializer(UserService userService, ProductService productService, CategoryRepository categoryRepository) {
        this.userService = userService;
        this.productService = productService;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        adminAccount();
        userAccount();
        countries();
        souvenirProducts();
    }

    private void userAccount(){
        User user = new User();

        user.setUsername("user");
        user.setPassword("user");
        user.setPasswordConfirm("user");
        user.setGender("Female");
        user.setEmail("user@example.com");

        userService.save(user);
    }

    private void adminAccount(){
        User admin = new User();

        admin.setUsername("admin");
        admin.setPassword("admin");
        admin.setPasswordConfirm("admin");
        admin.setGender("Male");
        admin.setEmail("admin@example.com");

        userService.save(admin);
    }

    private void countries(){
        String[] names = {
                "France", "Japan", "Italy", "India", "Mexico",
                "Morocco", "Vietnam", "Turkey", "Brazil", "Spain"
        };

        for (String name : names) {
            Category category = new Category();
            category.setCategoryName(name);
            categoryRepository.save(category);
        }
    }

    private void souvenirProducts(){
        String[] names = {
                "Eiffel Tower Keychain",
                "Cherry Blossom Fan",
                "Venetian Carnival Mask",
                "Spice Gift Box",
                "Aztec Calendar Pendant",
                "Mosaic Lantern",
                "Ao Dai Doll",
                "Evil Eye Pendant",
                "Samba Drum Keychain",
                "Flamenco Castanets"
        };
        String[] countries = {
                "France", "Japan", "Italy", "India", "Mexico",
                "Morocco", "Vietnam", "Turkey", "Brazil", "Spain"
        };
        String[] prices = {
                "19.99", "24.99", "29.99", "14.99", "18.99",
                "27.99", "21.99", "12.99", "16.99", "22.99"
        };

        for (int i = 0; i < names.length; i++) {
            Product product = new Product();
            product.setName(names[i]);
            product.setDescription("Souvenir price for " + countries[i]);
            product.setCategory(categoryRepository.findByCategoryName(countries[i]));
            product.setPrice(BigDecimal.valueOf(Double.parseDouble(prices[i])));
            product.setImageUrl(imageUrl(names[i], countries[i]));

            productService.save(product);
        }
    }

    private String imageUrl(String name, String country){
        String text = (name + " - " + country).replace(" ", "+");
        return "https://placehold.co/600x400/png?text=" + text;
    }
}
