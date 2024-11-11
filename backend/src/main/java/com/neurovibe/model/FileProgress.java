//FileProgress.java
package com.neurovibe.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

/**
 * Represents the progress of a file being read.
 * This class is mapped to the "file_progress" table in the database.
 */
@Entity // Indicates that this class is a JPA entity
@Table(name = "file_progress") // Specifies the table name in the database
public class FileProgress {

    @Id // Indicates that this field is the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Specifies that the ID should be generated automatically
    private Long id; // Unique identifier for the file progress record

    @Column(nullable = false, unique = true) // Specifies that this column cannot be null and must be unique
    private String fileName; // Name of the file for which progress is tracked

    @Column(nullable = false) // Specifies that this column cannot be null
    private int lastReadPosition; // The last position read in the file

    // Default constructor
    public FileProgress() {}

    // Constructor to initialize file name and last read position
    public FileProgress(String fileName, int lastReadPosition) {
        this.fileName = fileName;
        this.lastReadPosition = lastReadPosition;
    }

    /**
     * Gets the ID of the file progress record.
     *
     * @return the ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Gets the name of the file.
     *
     * @return the file name
     */
    public String getFileName() {
        return fileName;
    }

    /**
     * Sets the name of the file.
     *
     * @param fileName the name to set
     */
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    /**
     * Gets the last read position in the file.
     *
     * @return the last read position
     */
    public int getLastReadPosition() {
        return lastReadPosition;
    }

    /**
     * Sets the last read position in the file.
     *
     * @param lastReadPosition the last read position to set
     */
    public void setLastReadPosition(int lastReadPosition) {
        this.lastReadPosition = lastReadPosition;
    }
}
