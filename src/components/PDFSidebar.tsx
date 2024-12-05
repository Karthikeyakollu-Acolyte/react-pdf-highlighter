import React, { useEffect } from 'react';
import { usePages } from "../../example/src/PageContext";

const PDFSidebar = () => {
  const { pages } = usePages();
  
  useEffect(() => {
    // Get the main `.pdfViewer` element
    const mainViewer = document.getElementsByClassName("View-pdf")[0];
    const sidebar = document.querySelector('.pdf-sidebar');

    if (mainViewer && sidebar) {
      sidebar.innerHTML = ''; // Clear previous thumbnails

      // Perform a deep clone of the main viewer's content
      const clonedContent = mainViewer.cloneNode(true); // True for deep clone
      
      // Optional: Add a CSS class for styling the cloned content
      clonedContent.classList.add('thumbnail-view');
      
      // Append cloned content to sidebar
      sidebar.appendChild(clonedContent);
    }
  }, [pages]); // Re-run when `pages` changes

  return <div className="pdf-sidebar z-50 bg-black"></div>;
};

const PDFViewer = () => {
  return (
    <div className="pdf-viewer-container text-black">
      <PDFSidebar />
    </div>
  );
};

export default PDFViewer;
