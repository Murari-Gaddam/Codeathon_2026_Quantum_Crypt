import React, { useState, useEffect } from "react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { AppShell } from "./components/AppShell";
import type { ScanResult } from "./types";
import { api } from "./services/api";

export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("pqc_theme_preference");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // At start, the value is zero (null scanResult)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("pqc_theme_preference", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
  };

  // Reset demo back to zero state
  const handleResetDemo = async () => {
    try {
      await api.resetScans();
    } catch (err) {
      console.warn("Backend reset notification failed, resetting local state:", err);
    }
    setScanResult(null);
  };

  // Load the built-in enterprise demo repository
  const handleLoadDemo = async () => {
    setIsScanning(true);
    try {
      const result = await api.startScan(undefined, true);
      setScanResult(result);
    } catch (err: any) {
      console.error("Failed to load demo repository:", err);
      alert(`Could not load demo repository: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Scan a custom directory path or selected file
  const handleScanPath = async (targetPath: string) => {
    setIsScanning(true);
    try {
      const result = await api.startScan(targetPath, false);
      setScanResult(result);
    } catch (err: any) {
      console.error("Failed to scan path:", err);
      alert(`Scan failed: ${err.message || err}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <AppShell
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        scanResult={scanResult}
        onScanComplete={handleScanComplete}
        onResetDemo={handleResetDemo}
        onLoadDemo={handleLoadDemo}
        onScanPath={handleScanPath}
        isScanning={isScanning}
      />
    </FluentProvider>
  );
};

export default App;
