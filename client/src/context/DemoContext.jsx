import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('securescan_demo_mode') === 'true';
  });

  const [activeDemoTarget, setActiveDemoTarget] = useState('shop.apex-retail.io');

  useEffect(() => {
    localStorage.setItem('securescan_demo_mode', isDemoMode ? 'true' : 'false');
  }, [isDemoMode]);

  const enableDemoMode = (target = 'shop.apex-retail.io') => {
    setActiveDemoTarget(target);
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode, activeDemoTarget, setActiveDemoTarget }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
