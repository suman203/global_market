package com.globalmarket.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class RestApiAdminTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void adminCreateProductWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload()))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Authentication required")));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    public void adminCreateProductAsUserReturns403() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload()))
                .andExpect(status().isForbidden())
                .andExpect(content().string(containsString("Access denied")));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminAccessingUserEndpointReturns403Json() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isForbidden())
                .andExpect(content().json("{\"status\":403,\"message\":\"Access denied.\"}"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminListProductsAsAdminReturns200() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminCreateProductAsAdminReturns201() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Souvenir"))
                .andExpect(jsonPath("$.category.name").value("France"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminCreateProductWithInvalidNameReturns400() throws Exception {
        String payload = "{\"name\":\"a\",\"description\":\"desc\",\"imageUrl\":\"https://placehold.co/600x400/png?text=X\","
                + "\"price\":9.99,\"categoryId\":3}";
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminUpdateProductAsAdminReturns200() throws Exception {
        String createdBody = mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode created = objectMapper.readTree(createdBody);
        long createdId = created.get("id").asLong();

        String payload = "{\"name\":\"Renamed Souvenir\",\"description\":\"Updated\","
                + "\"imageUrl\":\"https://placehold.co/600x400/png?text=Renamed\",\"price\":25.00,\"categoryId\":4}";

        mockMvc.perform(put("/api/admin/products/" + createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed Souvenir"))
                .andExpect(jsonPath("$.category.name").value("Japan"));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void adminDeleteProductAsAdminReturns204() throws Exception {
        String createdBody = mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode created = objectMapper.readTree(createdBody);
        long createdId = created.get("id").asLong();

        mockMvc.perform(delete("/api/admin/products/" + createdId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products/" + createdId))
                .andExpect(status().isNotFound());
    }

    private String validProductPayload() {
        return "{\"name\":\"Test Souvenir\",\"description\":\"A nice souvenir\","
                + "\"imageUrl\":\"https://placehold.co/600x400/png?text=Test+Souvenir\",\"price\":9.99,\"categoryId\":3}";
    }
}
