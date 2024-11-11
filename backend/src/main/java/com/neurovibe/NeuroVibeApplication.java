package com.neurovibe;

// Importing necessary Spring Boot classes for application startup and configuration.
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Annotation indicating that this is a Spring Boot application.
@SpringBootApplication
public class NeuroVibeApplication {

    // Main method that serves as the entry point for the Java application.
    public static void main(String[] args) {
        // Launches the Spring Boot application by invoking the run method on SpringApplication.
        SpringApplication.run(NeuroVibeApplication.class, args);
    }
}