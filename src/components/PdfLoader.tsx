import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import React, { useEffect, useState, useRef } from "react";

interface Props {
  workerSrc?: string;
  url?: string;
  file?: File; // Add file prop to allow loading from a file input
  beforeLoad: JSX.Element;
  errorMessage?: JSX.Element;
  children: (pdfDocument: PDFDocumentProxy) => JSX.Element;
  onError?: (error: Error) => void;
  cMapUrl?: string;
  cMapPacked?: boolean;
}

export const PdfLoader: React.FC<Props> = ({
  workerSrc = "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs",
  url,
  file,
  beforeLoad,
  errorMessage,
  children,
  onError,
  cMapUrl,
  cMapPacked,
}) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const documentRef = useRef<HTMLElement | null>(null);

  // Cleanup function to destroy the PDF document when unmounting
  useEffect(() => {
    return () => {
      pdfDocument?.destroy();
    };
  }, [pdfDocument]);

  // Function to handle errors and optionally pass them to the `onError` callback
  const handleError = (e: Error) => {
    if (onError) {
      onError(e);
    }
    setError(e);
    setPdfDocument(null);
  };

  // Function to load the PDF document
  const loadPdf = () => {
    setPdfDocument(null);
    setError(null);

    if (typeof workerSrc === "string") {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    const loadDocument = async () => {
      try {
        // Destroy the previous document, if any
        await pdfDocument?.destroy();

        const docConfig = file
          ? { data: await file.arrayBuffer() } // Read from the File input if provided
          : { url };

        const loadedPdf = await getDocument({
          ...docConfig,
          cMapUrl,
          cMapPacked,
        }).promise;

        setPdfDocument(loadedPdf);
      } catch (e) {
        handleError(e as Error);
      }
    };

    loadDocument();
  };

  // Load PDF document when component mounts or `url`/`file` changes
  useEffect(() => {
    if (url || file) {
      loadPdf();
    }
  }, [url, file]);

  const renderError = () => {
    return errorMessage ? React.cloneElement(errorMessage, { error }) : null;
  };

  return (
    <>
      <span ref={documentRef} />
      {error
        ? renderError()
        : !pdfDocument || !children
        ? beforeLoad
        : children(pdfDocument)}
    </>
  );
};
