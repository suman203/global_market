package com.globalmarket.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class RestApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ---------- Catalog ----------

    @Test
    public void productsReturnsAllTenSeededProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].name").value("Eiffel Tower Keychain"))
                .andExpect(jsonPath("$[0].category.name").value("France"));
    }

    @Test
    public void productsFilterByCountryReturnsOnlyThatCountry() throws Exception {
        long franceId = categoryIdByName("France");

        mockMvc.perform(get("/api/products").param("categoryId", String.valueOf(franceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].category.name").value("France"));
    }

    @Test
    public void productsSearchByNameIsCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/products").param("q", "eiffel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Eiffel Tower Keychain"));
    }

    @Test
    public void productsSortByPriceAscending() throws Exception {
        mockMvc.perform(get("/api/products").param("sort", "price_asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Evil Eye Pendant"));
    }

    @Test
    public void productDetailReturnsProduct() throws Exception {
        long firstId = firstProductId();

        mockMvc.perform(get("/api/products/" + firstId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    public void productDetailUnknownIdReturns404() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void categoriesReturnsAllTenCountries() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andExpect(jsonPath("$[0].name").value("France"));
    }

    // ---------- Auth ----------

    @Test
    public void loginAsUserReturnsUserRole() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"password\":\"user\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    public void loginAsAdminReturnsAdminRole() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    public void loginWithBadCredentialsReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    public void meWhenAnonymousReturnsNoContent() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void meAfterLoginReturnsCurrentUser() throws Exception {
        MockHttpSession session = login("user", "user");

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"));
    }

    @Test
    public void registerCreatesUserAndLogsIn() throws Exception {
        String payload = "{\"username\":\"newbie\",\"email\":\"newbie@example.com\",\"password\":\"password123\","
                + "\"passwordConfirm\":\"password123\",\"firstName\":\"New\",\"lastName\":\"User\","
                + "\"city\":\"Warsaw\",\"gender\":\"Female\",\"age\":23}";

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newbie"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("newbie"));
    }

    @Test
    public void registerWithInvalidDataReturns400FieldErrors() throws Exception {
        String payload = "{\"username\":\"ab\",\"email\":\"bad\",\"password\":\"short\","
                + "\"passwordConfirm\":\"different\",\"gender\":\"Female\",\"age\":10}";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.username").exists());
    }

    // ---------- Cart ----------

    @Test
    public void cartStartsEmpty() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    public void addProductToCartIncrementsCount() throws Exception {
        long productId = firstProductId();
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/cart/items/" + productId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        mockMvc.perform(post("/api/cart/items/" + productId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    public void addUnknownProductToCartReturns404() throws Exception {
        mockMvc.perform(post("/api/cart/items/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void removeProductFromCartDecrementsCount() throws Exception {
        long productId = firstProductId();
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/cart/items/" + productId).session(session));
        mockMvc.perform(post("/api/cart/items/" + productId).session(session));

        mockMvc.perform(delete("/api/cart/items/" + productId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }

    @Test
    public void checkoutClearsCart() throws Exception {
        long productId = firstProductId();
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/cart/items/" + productId).session(session));
        mockMvc.perform(post("/api/cart/items/" + productId).session(session));

        mockMvc.perform(post("/api/cart/checkout").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    // ---------- User profile ----------

    @Test
    public void userMeWithoutAuthReturns401() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- helpers ----------

    private MockHttpSession login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private long firstProductId() throws Exception {
        String body = mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get(0).get("id").asLong();
    }

    private long categoryIdByName(String name) throws Exception {
        String body = mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        for (JsonNode node : objectMapper.readTree(body)) {
            if (name.equals(node.get("name").asText())) {
                return node.get("id").asLong();
            }
        }
        throw new IllegalStateException("Category not found: " + name);
    }
}
