// //PdfViewer.js
// import React, { useState, useEffect } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
// import './PdfViewer.css';  // Import a separate CSS file for styling

// // Configure PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();

// const PdfViewer = () => {
//   const location = useLocation();
//   const { selectedFile } = location.state || {};  // Get selectedFile from state
//   const [pdfUrlState, setPdfUrlState] = useState(null); // Add state for pdfUrl
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);

//   // Check localStorage for a persisted PDF file if not passed via state
//   useEffect(() => {
//     const storedPdf = localStorage.getItem('pdfFile');

//     if (storedPdf) {
//       // Decode the base64-encoded string back into a Blob
//       const byteCharacters = atob(storedPdf); // Decode base64 string to binary
//       const byteArrays = [];

//       for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
//         const slice = byteCharacters.slice(offset, offset + 1024);
//         const byteNumbers = new Array(slice.length);
//         for (let i = 0; i < slice.length; i++) {
//           byteNumbers[i] = slice.charCodeAt(i);
//         }
//         byteArrays.push(new Uint8Array(byteNumbers));
//       }

//       const blob = new Blob(byteArrays, { type: 'application/pdf' });
//       const newPdfUrl = URL.createObjectURL(blob);
//       setPdfUrlState(newPdfUrl); // Set the new pdfUrl
//     } else if (selectedFile) {
//       // If no stored file, fetch it from the server
//       const fetchPdfUrl = async () => {
//         try {
//           const fileResponse = await axios.get(`http://localhost:8080/api/files/download/${selectedFile}`, {
//             responseType: 'blob',
//           });
          
//           // Create a base64 string from the Blob
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const base64Pdf = reader.result.split(',')[1]; // Get base64 part
//             localStorage.setItem('pdfFile', base64Pdf);  // Store in localStorage
//             const newPdfUrl = URL.createObjectURL(fileResponse.data);
//             setPdfUrlState(newPdfUrl);  // Set the new pdfUrl
//           };
//           reader.readAsDataURL(fileResponse.data);
//         } catch (error) {
//           console.error('Error fetching file content:', error);
//         }
//       };
//       fetchPdfUrl();
//     }
//   }, [selectedFile]);  // Trigger fetch only if selectedFile changes

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//   };

//   const goToPreviousPage = () => setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
//   const goToNextPage = () => setPageNumber((prevPage) => Math.min(prevPage + 1, numPages));

//   return (
//     <div className="pdf-viewer-container">
//       <h2>PDF Viewer</h2>
//       <div className="navigation">
//         <button onClick={goToPreviousPage} disabled={pageNumber === 1}>
//           Previous
//         </button>
//         <span>
//           Page {pageNumber} of {numPages}
//         </span>
//         <button onClick={goToNextPage} disabled={pageNumber === numPages}>
//           Next
//         </button>
//       </div>
//       {pdfUrlState && (
//         <div className="pdf-document">
//           <Document file={pdfUrlState} onLoadSuccess={onDocumentLoadSuccess}>
//             <Page pageNumber={pageNumber} width={window.innerWidth * 0.8} />
//           </Document>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PdfViewer;

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
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
      {pdfUrlState && (
        <div className="pdf-document">
          <Document file={pdfUrlState} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} width={window.innerWidth * 0.8} />
          </Document>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
