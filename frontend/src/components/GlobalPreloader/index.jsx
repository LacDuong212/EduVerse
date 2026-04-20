import { useEffect, useState } from "react";
import { usePreloader } from "@/contexts/PreloaderContext";
import { preloaderConfig } from "@/configs/preloader/preloaderConfig";
import Preloader from "@/components/Preloader";
import "./styles.css";

const GlobalPreloader = () => {
  const { isLoading } = usePreloader();
  const [showPreloader, setShowPreloader] = useState(false);
  const [timeout, setTimeout] = useState(null);

  useEffect(() => {
    if (isLoading) {
      // Show preloader after delay to avoid flashing on quick loads
      const timer = setTimeout(() => {
        setShowPreloader(true);
      }, preloaderConfig.showDelay);
      setTimeout(timer);
    } else {
      // Clear timeout and hide preloader immediately
      if (timeout) clearTimeout(timeout);
      setShowPreloader(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, timeout]);

  return (
    <div
      className={`global-preloader-wrapper ${showPreloader ? "show" : ""
        }`}
      style={{
        transitionDuration: `${preloaderConfig.transitionDuration}ms`,
      }}
    >
      <Preloader />
    </div>
  );
};

export default GlobalPreloader;