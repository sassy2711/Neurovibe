package com.neurovibe.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for file storage.
 * This class is used to bind properties from the application.properties file
 * that are prefixed with "file" to Java fields.
 */
@Component
@ConfigurationProperties(prefix = "file") // Binds properties with prefix "file" from application.properties
public class FileStorageProperties {

    // Directory where uploaded files will be stored
    private String uploadDir;

    /**
     * Gets the directory for file uploads.
     *
     * @return the upload directory path
     */
    public String getUploadDir() {
        return uploadDir;
    }

    /**
     * Sets the directory for file uploads.
     *
     * @param uploadDir the upload directory path to set
     */
    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }
}
