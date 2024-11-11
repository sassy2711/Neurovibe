package com.neurovibe.repository;

import com.neurovibe.model.FileProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing FileProgress entities.
 * This interface extends JpaRepository to provide CRUD operations for FileProgress.
 */
@Repository // Indicates that this interface is a Spring Data repository
public interface FileProgressRepository extends JpaRepository<FileProgress, Long> {

    /**
     * Finds a FileProgress record by its file name.
     *
     * @param fileName the name of the file to search for
     * @return an Optional containing the found FileProgress, or empty if not found
     */
    Optional<FileProgress> findByFileName(String fileName);
    /**
     * Deletes the file progress record by the file name.
     *
     * @param fileName the name of the file whose progress record should be deleted
     */
    void deleteByFileName(String fileName);

    /**
     * Deletes all file progress records.
     */
    void deleteAll();  // This is already provided by JpaRepository, but kept for clarity.
}

