import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import bionicReading from 'data-bionic-reading';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PdfViewer.css';  // Import a separate CSS file for styling

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfViewer = () => {
  const location = useLocation();
  const { selectedFile } = location.state || {};  // Get selectedFile from state
  const [pdfUrlState, setPdfUrlState] = useState(null); // Add state for pdfUrl
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Default to page 1
  const [fileProgress, setFileProgress] = useState(0); // Store the file's read progress
  const [bionicText, setBionicText] = useState(""); // State to store extracted text in Bionic format
  const [isBionic, setIsBionic] = useState(false); // Toggle between PDF and Bionic View

  const pageTextRef = useRef("");

  // Fetch PDF URL from server and progress from backend
  useEffect(() => {
    const fetchPdfAndProgress = async () => {
      try {
        // Fetch PDF file
        const fileResponse = await axios.get(`http://localhost:8080/api/files/download/${selectedFile}`, {
          responseType: 'blob',
        });

        const newPdfUrl = URL.createObjectURL(fileResponse.data);
        setPdfUrlState(newPdfUrl); // Set the PDF URL

        // Fetch last read progress
        const progressResponse = await axios.get(`http://localhost:8080/api/files/progress/${selectedFile}`);
        const progress = progressResponse.data;
        setFileProgress(progress);
        setPageNumber(progress); // Set the page number to the progress value
      } catch (error) {
        console.error('Error fetching file content or progress:', error);
      }
    };

    if (selectedFile) {
      fetchPdfAndProgress();
    }
  }, [selectedFile]);

  // Update progress when page changes
  const updateProgress = async (page) => {
    try {
      await axios.post(`http://localhost:8080/api/files/progress/${selectedFile}`, null, {
        params: { position: page },
      });
      setFileProgress(page); // Update the local progress state
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // On successful document load
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);
    updateProgress(newPage);
  };

  const goToNextPage = () => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);
    updateProgress(newPage);
  };

  // Extract text from the current page
  const extractTextFromPage = async (pageNum) => {
    const pdfDoc = await pdfjs.getDocument(pdfUrlState).promise;
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    let pageText = textContent.items.map(item => item.str).join(" ");
    pageTextRef.current = pageText; // Store text for future use
    return pageText;
  };

  // Toggle to Bionic Reading format
  const toggleBionicReading = async () => {
    if (!isBionic) {
      // Extract text for the current page
      const text = await extractTextFromPage(pageNumber);
      setBionicText(text); // Set text to bionic
    }
    setIsBionic(prevState => !prevState); // Toggle the view
  };

  // Use useEffect to apply bionicReading() whenever the bionicText is updated
  useEffect(() => {
    if (isBionic && bionicText) {
      bionicReading(); // Apply Bionic Reading after text is set
    }
  }, [isBionic, bionicText]);

  return (
    <div className="pdf-viewer-container">
      <h2>PDF Viewer</h2>
      <div className="navigation">
        <button onClick={goToPreviousPage} disabled={pageNumber === 1}>
          Previous
        </button>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <button onClick={goToNextPage} disabled={pageNumber === numPages}>
          Next
        </button>
      </div>

      {/* Toggle Button */}
      <button onClick={toggleBionicReading} className="toggle-bionic-btn">
        {isBionic ? 'Back to PDF' : 'Show Bionic'}
      </button>

      {isBionic ? (
        <div className="bionic-reading">
          <article data-bionic-reading>
            <p>{bionicText}</p>
          </article>
        </div>
      ) : (
        pdfUrlState && (
          <div className="pdf-document">
            <Document file={pdfUrlState} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} width={window.innerWidth * 0.8} />
            </Document>
          </div>
        )
      )}
    </div>
  );
};

export default PdfViewer;
