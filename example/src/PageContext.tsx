import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context's data
interface PagesContextType {
  pages: number;
  setPages: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with the defined type
const PagesContext = createContext<PagesContextType | undefined>(undefined);

// Create the provider component
interface PagesProviderProps {
  children: ReactNode;
}

export const PagesProvider: React.FC<PagesProviderProps> = ({ children }) => {
  const [pages, setPages] = useState<number>(1); // Initial value of pages
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page
  const totalPages = 50; // Set total pages (constant)
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Initial zoom level
  const [isPanning, setIsPanning] = useState<boolean>(false); // Panning state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false); // Search UI state

  return (
    <PagesContext.Provider
      value={{
        pages,
        setPages,
        currentPage,
        setCurrentPage,
        totalPages,
        zoomLevel,
        setZoomLevel,
        isPanning,
        setIsPanning,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};

// Custom hook to use the PagesContext
export const usePages = (): PagesContextType => {
  const context = useContext(PagesContext);
  if (!context) {
    throw new Error('usePages must be used within a PagesProvider');
  }
  return context;
};
