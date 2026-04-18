import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePreloader } from "@/contexts/PreloaderContext";
import { shouldShowPreloader } from "@/configs/preloader/preloaderConfig";

/**
 * RoutePreloaderListener
 * 
 * Automatically shows/hides the preloader based on route changes
 * Place this component inside your router (inside <BrowserRouter>)
 */
const RoutePreloaderListener = () => {
  const location = useLocation();
  const { setIsLoading } = usePreloader();

  useEffect(() => {
    // Determine if preloader should show for this route
    const showPreloader = shouldShowPreloader(location.pathname);

    // Show preloader on route change
    if (showPreloader) {
      setIsLoading(true);

      // Hide preloader after component loads
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Adjust timing as needed

      return () => clearTimeout(timer);
    }
  }, [location.pathname, setIsLoading]);

  return null;
};

export default RoutePreloaderListener;