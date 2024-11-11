//FileService.java
package com.neurovibe.service;

import com.neurovibe.config.FileStorageProperties;
import com.neurovibe.model.FileProgress;
import com.neurovibe.repository.FileProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service class for handling file operations such as uploading, downloading,
 * and managing file read progress.
 */
@Service // Indicates that this class is a service component in the Spring context
public class FileService {

    private final Path fileStorageLocation; // Location where files are stored
    private final FileProgressRepository fileProgressRepository; // Repository for file progress records

    /**
     * Constructs a FileService with the specified file storage properties and repository.
     *
     * @param fileStorageProperties properties for file storage configuration
     * @param fileProgressRepository repository for managing file progress
     * @throws IOException if an I/O error occurs while creating the file storage directory
     */
    @Autowired
    public FileService(FileStorageProperties fileStorageProperties, FileProgressRepository fileProgressRepository) throws IOException {
        // Normalize and create the file storage directory
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        Files.createDirectories(this.fileStorageLocation);
        this.fileProgressRepository = fileProgressRepository; // Assign the repository
    }

    /**
     * Saves an uploaded file to the file storage location.
     *
     * @param file the file to be uploaded
     * @return a message indicating the result of the upload operation
     * @throws IOException if an I/O error occurs during file upload
     */
    public String saveFile(MultipartFile file) throws IOException {
        // Clean the file name and handle null cases
        String fileName = StringUtils.cleanPath(Optional.ofNullable(file.getOriginalFilename()).orElse("default_filename"));
        Path targetLocation = this.fileStorageLocation.resolve(fileName); // Define target location
        Files.copy(file.getInputStream(), targetLocation); // Copy the file to the target location
        return "File uploaded successfully: " + fileName; // Return success message
    }

    /**
     * Loads the contents of a file as a byte array.
     *
     * @param fileName the name of the file to be loaded
     * @return the contents of the file as a byte array
     * @throws IOException if an I/O error occurs during file loading
     */
    public byte[] loadFile(String fileName) throws IOException {
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize(); // Define the file path
        return Files.readAllBytes(filePath); // Read and return the file contents
    }

    /**
     * Retrieves the last read position of the specified file.
     *
     * @param fileName the name of the file for which to get the read progress
     * @return the last read position, or 0 if not found
     */
    public int getProgress(String fileName) {
        // Find the FileProgress record by file name
        Optional<FileProgress> progress = fileProgressRepository.findByFileName(fileName);
        return progress.map(FileProgress::getLastReadPosition).orElse(1); // Return progress or 0 if not found
    }

    /**
     * Updates the last read position for the specified file.
     *
     * @param fileName the name of the file for which to update progress
     * @param lastReadPosition the last read position to be saved
     */
    public void updateProgress(String fileName, int lastReadPosition) {
        // Retrieve existing progress or create a new FileProgress object
        FileProgress progress = fileProgressRepository.findByFileName(fileName)
                .orElse(new FileProgress(fileName, 1));
        progress.setLastReadPosition(lastReadPosition); // Update the last read position
        fileProgressRepository.save(progress); // Save the updated progress record
    }

    /**
     * Lists all files in the file storage location.
     *
     * @return a list of file names in the storage directory
     * @throws IOException if an I/O error occurs while listing files
     */
    public List<String> listAllFiles() throws IOException {
        List<String> fileNames = new ArrayList<>();

        try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(this.fileStorageLocation)) {
            for (Path path : directoryStream) {
                fileNames.add(path.getFileName().toString()); // Add each file name to the list
            }
        }

        return fileNames;
    }

    /**
     * Deletes a specific file and its corresponding file progress.
     *
     * @param fileName the name of the file to be deleted
     * @throws IOException if an I/O error occurs during file deletion
     */
    public void deleteFile(String fileName) throws IOException {
        // Deleting the file from the filesystem
        Path filePath = fileStorageLocation.resolve(fileName).normalize();
        Files.deleteIfExists(filePath);  // Deletes the file if it exists

        // Deleting the file progress from the database
        fileProgressRepository.deleteByFileName(fileName); // Removes progress record from DB
    }

    /**
     * Deletes all files and their corresponding progress records.
     *
     * @throws IOException if an I/O error occurs during file deletion
     */
    public void deleteAllFiles() throws IOException {
        // Delete all files in the storage location
        try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(this.fileStorageLocation)) {
            for (Path path : directoryStream) {
                Files.delete(path); // Delete each file
            }
        }
        // Deleting all file progress records from the database
        fileProgressRepository.deleteAll(); // Removes all progress records from DB
    }
}

