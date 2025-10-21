import { useEffect, useState } from 'react';

import useResponsiveToggle from '@/hooks/useResponsiveToggle';
import { getStorageTheme, setDarkMode } from '@/lib/theme';

const useHeader = () => {
  const { isMobile } = useResponsiveToggle();
  const [onDarkMode, setOnDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStorageTheme();
    if (stored === 'dark') {
      setOnDarkMode(true);
      setDarkMode(true);
    }
  }, []);

  const toggle = () => {
    const nextValue = !onDarkMode;
    setOnDarkMode(nextValue);
    setDarkMode(nextValue);
  };

  return {
    isMobile,
    toggle,
    onDarkMode,
  };
};

export default useHeader;
