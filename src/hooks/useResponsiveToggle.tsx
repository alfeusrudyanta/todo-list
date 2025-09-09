import { useState, useEffect } from 'react';

const useResponsiveToggle = (breakpoint = 768) => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return {
    isMobile: windowWidth < breakpoint,
    windowWidth,
  };
};

export default useResponsiveToggle;
