import glightbox from 'glightbox';
import { useEffect, useRef } from 'react';
import 'glightbox/dist/css/glightbox.min.css';

const GlightBox = ({
  children,
  href,
  ...other
}) => {
  const ref = useRef(null);

  useEffect(() => {
    let instance = null;
    if (ref.current) {
      // create new instance
      instance = glightbox({
        openEffect: 'fade',
        closeEffect: 'fade',
        autoplayVideos: true  // help ensure it handles video correctly if types are mixed
      });
    }

    // cleanup: destroy instance when href changes or component unmounts
    return () => instance?.destroy();
  }, [href]);

  return (
    <a ref={ref} href={href} {...other} className={`glightbox ${other['className']}`}>
      {children}
    </a>
  );
};

export default GlightBox;
