import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const navigate = useNavigate();

  // Upload a new file
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully');
      setFile(null);
      
      // Immediately update the uploaded files list
      fetchUploadedFiles();  // Or, you can update manually using setUploadedFiles() if you have the list
    } catch (error) {
      alert('File upload failed');
    }
  };

  // Fetch the list of uploaded files
  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  // Navigate to PdfViewer with selected file and its URL
  const handleViewFile = async () => {
    if (!selectedFile) return;

    try {
      const fileResponse = await axios.get(`http://localhost:8080/api/files/download/${selectedFile}`, {
        responseType: 'blob',
      });

      const pdfUrl = URL.createObjectURL(fileResponse.data);

      // Store the Blob URL in localStorage
      localStorage.setItem('pdfUrl', pdfUrl);

      // Pass both pdfUrl and selectedFile as state to PdfViewer
      navigate('/pdf-viewer', { state: { pdfUrl, selectedFile } });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  // Delete the selected file
  const handleDeleteFile = async () => {
    if (!selectedFile) {
      alert("Please select a file to delete.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/files/delete/${selectedFile}`);
      alert(`File ${selectedFile} has been deleted.`);
      setSelectedFile(""); // Clear selected file after deletion

      // Immediately update the uploaded files list after deletion
      fetchUploadedFiles();
    } catch (error) {
      console.error('Error deleting the file:', error);
      alert("There was an error deleting the file.");
    }
  };

  // Delete all files
  const handleDeleteAllFiles = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all files?");
    if (confirmDelete) {
      try {
        await axios.delete('http://localhost:8080/api/files/delete-all');
        alert("All files have been deleted.");

        // Immediately update the uploaded files list after deletion
        setUploadedFiles([]); // Clear the file list immediately
      } catch (error) {
        console.error('Error deleting all files:', error);
        alert("There was an error deleting all files.");
      }
    }
  };

  // Load the list of uploaded files when the component mounts
  useEffect(() => {
    fetchUploadedFiles();
  }, []); // Initial load when the component mounts

  return (
    <div>
      <h2>File Upload and View</h2>

      <div>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload File</button>
      </div>

      <div>
        <h3>Uploaded Files</h3>
        <select onChange={(e) => setSelectedFile(e.target.value)}>
          <option value="">Select a file</option>
          {uploadedFiles.map((fileName) => (
            <option key={fileName} value={fileName}>
              {fileName}
            </option>
          ))}
        </select>
        <button onClick={handleViewFile}>View File</button>
        <button onClick={handleDeleteFile} disabled={!selectedFile}>
          Delete Selected File
        </button>
      </div>

      <div>
        <button onClick={handleDeleteAllFiles}>Delete All Files</button>
      </div>
    </div>
  );
};

export default FileUpload;


