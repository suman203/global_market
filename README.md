# Global Market

Global Market is a Spring Boot e-commerce web application built with **Spring Boot**, **Spring Security**, **Spring Data JPA** and the **H2** in-memory database. Views are rendered with **Thymeleaf** and styled with **Bootstrap**.

## Description

A simple online shop with product catalog, category browsing, a session-based shopping cart and user registration. Administrators can create, edit and delete products.

## Installation

Clone the repository and run a clean installation:

```sh
$ mvn clean install
```

Start the application with the Spring Boot custom command:

```sh
$ mvn spring-boot:run
```

Or build and run the JAR:

```sh
$ mvn clean package
$ java -jar target/global-market-0.0.1-SNAPSHOT.jar
```

The application listens on port `8080` by default.

## Logins

Initially there are 2 users in memory:

Login: ```admin``` Password: ```admin``` with **ADMIN** role.

Login: ```user``` Password: ```user``` with **USER** role.

## Roles

**ADMIN** can add, edit and delete products.

**USER** can add products to the shopping cart and buy them.

## Tests

Run the test suite with:

```sh
$ mvn test
```
