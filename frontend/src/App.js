// // App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import FileUpload from './components/FileUpload/FileUpload';

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<FileUpload />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload/FileUpload';
import PdfViewer from './components/PdfViewer/PdfViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUpload />} />
        <Route path="/pdf-viewer" element={<PdfViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
