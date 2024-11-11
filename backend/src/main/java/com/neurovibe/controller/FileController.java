//FileController.java
package com.neurovibe.controller;

import com.neurovibe.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

/**
 * REST controller for handling file-related operations.
 * This controller exposes endpoints for uploading, downloading, and managing file progress.
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}) // Allow CORS for the current frontend origin
public class FileController {

    private final FileService fileService; // Service for file operations

    // Constructor injection of FileService
    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * Endpoint to upload a file.
     *
     * @param file the file to upload, received as a MultipartFile
     * @return a ResponseEntity with a success message or an error message
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Call the service to save the file and return a success message
            String message = fileService.saveFile(file);
            return ResponseEntity.status(HttpStatus.OK).body(message);
        } catch (IOException e) {
            // Return an error message if the upload fails
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload file: " + e.getMessage());
        }
    }

    /**
     * Endpoint to download a file.
     *
     * @param fileName the name of the file to download
     * @return a ResponseEntity containing the file data or an error response
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileName) {
        try {
            byte[] fileData = fileService.loadFile(fileName);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF) // Set the content type to application/pdf
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    /**
     * Endpoint to get the read progress of a file.
     *
     * @param fileName the name of the file to check progress for
     * @return a ResponseEntity containing the last read position of the file
     */
    @GetMapping("/progress/{fileName}")
    public ResponseEntity<Integer> getFileProgress(@PathVariable String fileName) {
        int progress = fileService.getProgress(fileName); // Get the progress from the service
        return ResponseEntity.ok(progress); // Return the progress in the response
    }

    /**
     * Endpoint to update the read progress of a file.
     *
     * @param fileName         the name of the file to update progress for
     * @param lastReadPosition the last read position to set
     * @return a ResponseEntity with a success message
     */
    @PostMapping("/progress/{fileName}")
    public ResponseEntity<String> updateFileProgress(@PathVariable String fileName, @RequestParam("position") int lastReadPosition) {
        fileService.updateProgress(fileName, lastReadPosition); // Update the progress in the service
        return ResponseEntity.status(HttpStatus.OK).body("Progress updated successfully."); // Return a success message
    }

    /**
     * Endpoint to get a list of all uploaded files.
     *
     * @return a ResponseEntity containing a list of file names
     */
    @GetMapping
    public ResponseEntity<List<String>> listAllFiles() {
        try {
            List<String> fileNames = fileService.listAllFiles(); // Call the service to get file names
            return ResponseEntity.ok(fileNames); // Return the list in the response
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Handle errors
        }
    }

    /**
     * Endpoint to delete a specific file and its progress record.
     *
     * @param fileName the name of the file to be deleted
     * @return a message indicating the result of the delete operation
     */
    @DeleteMapping("/delete/{fileName}")
    public String deleteFile(@PathVariable String fileName) {
        try {
            fileService.deleteFile(fileName);
            return "File and its progress have been deleted successfully: " + fileName;
        } catch (IOException e) {
            return "Error deleting the file: " + fileName;
        }
    }

    /**
     * Endpoint to delete all files and their progress records.
     *
     * @return a message indicating the result of the delete operation
     */
    @DeleteMapping("/delete-all")
    public String deleteAllFiles() {
        try {
            fileService.deleteAllFiles();
            return "All files and progress records have been deleted successfully.";
        } catch (IOException e) {
            return "Error deleting all files and progress records.";
        }
    }
}
