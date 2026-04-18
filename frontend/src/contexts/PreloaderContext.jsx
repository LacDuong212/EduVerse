import { createContext, useContext, useState } from "react";

const PreloaderContext = createContext();

export const usePreloader = () => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error("usePreloader must be used within PreloaderProvider");
  }
  return context;
};

export const PreloaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PreloaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export default PreloaderContext;