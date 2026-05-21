import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePreloader } from "@/contexts/PreloaderContext";
import { shouldShowPreloader } from "@/configs/preloader/preloaderConfig";

const RoutePreloaderListener = () => {
  const location = useLocation();
  const { setIsLoading } = usePreloader();

  useEffect(() => {
    const showPreloader = shouldShowPreloader(location.pathname);
    if (showPreloader) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, setIsLoading]);

  return null;
};

export default RoutePreloaderListener;