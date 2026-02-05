import { useState, useEffect } from 'react';
import { ResponsiveBreakpoint } from '../types';

export const useResponsive = (): ResponsiveBreakpoint => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoint>({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    // Initial check
    checkBreakpoints();

    // Add event listener
    window.addEventListener('resize', checkBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return breakpoints;
};