import React, { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Tooltip,
} from "@fluentui/react-components";
import {
  Grid20Regular,
  Grid20Filled,
  Warning20Regular,
  Warning20Filled,
  BranchFork20Regular,
  BranchFork20Filled,
  Certificate20Regular,
  Certificate20Filled,
  ArrowSwap20Regular,
  ArrowSwap20Filled,
  Beaker20Regular,
  Beaker20Filled,
  Document20Regular,
  Document20Filled,
  Settings20Regular,
  Settings20Filled,
  Search20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
  ShieldKeyhole24Filled,
  ArrowReset20Regular,
  FolderOpen16Regular,
  Flash20Filled,
} from "@fluentui/react-icons";
import type { ScanResult, Finding } from "../types";
import { OverviewPage } from "../pages/OverviewPage";
import { FindingsPage } from "../pages/FindingsPage";
import { DependenciesPage } from "../pages/DependenciesPage";
import { CertificatesPage } from "../pages/CertificatesPage";
import { MigrationPage } from "../pages/MigrationPage";
import { SandboxPage } from "../pages/SandboxPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { FindingDetailDrawer } from "../pages/FindingDetailDrawer";
import { ScanModal } from "./ScanModal";
import { GlobalSearch } from "./GlobalSearch";

interface Props {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  scanResult: ScanResult | null;
  onScanComplete: (result: ScanResult) => void;
  onResetDemo: () => void;
  onLoadDemo: () => void;
  onScanPath: (path: string) => Promise<void>;
  isScanning?: boolean;
}

export const AppShell: React.FC<Props> = ({
  isDarkMode,
  onToggleTheme,
  scanResult,
  onScanComplete,
  onResetDemo,
  onLoadDemo,
  onScanPath,
  isScanning = false,
}) => {
  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isFindingDrawerOpen, setIsFindingDrawerOpen] = useState<boolean>(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: Grid20Regular, activeIcon: Grid20Filled },
    {
      id: "findings",
      label: "Findings",
      icon: Warning20Regular,
      activeIcon: Warning20Filled,
      badge: scanResult ? scanResult.summary.findings.total : undefined,
    },
    { id: "dependencies", label: "Dependencies", icon: BranchFork20Regular, activeIcon: BranchFork20Filled },
    {
      id: "certificates",
      label: "Certificates",
      icon: Certificate20Regular,
      activeIcon: Certificate20Filled,
      badge: scanResult ? scanResult.summary.certificates : undefined,
    },
    {
      id: "migration",
      label: "Migration",
      icon: ArrowSwap20Regular,
      activeIcon: ArrowSwap20Filled,
      badge: scanResult ? scanResult.summary.migration_items : undefined,
    },
    { id: "sandbox", label: "Sandbox", icon: Beaker20Regular, activeIcon: Beaker20Filled },
    { id: "reports", label: "Reports", icon: Document20Regular, activeIcon: Document20Filled },
    { id: "settings", label: "Settings", icon: Settings20Regular, activeIcon: Settings20Filled },
  ];

  const handleSelectFindingFromSearch = (f: Finding) => {
    setSelectedFinding(f);
    setIsFindingDrawerOpen(true);
  };

  const targetFolderDisplay = scanResult
    ? scanResult.summary.target_path.replace(/\\/g, "/").split("/").filter(Boolean).pop() || "Repository"
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top Header Bar */}
      <header
        style={{
          height: "50px",
          borderBottom: "1px solid var(--colorNeutralStroke1)",
          background: "var(--colorNeutralBackground1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldKeyhole24Filled style={{ color: "var(--colorBrandForeground1)", fontSize: "24px" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--colorNeutralForeground1)" }}>
              PQC Migration Scanner
            </span>
            <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              Microsoft Security Architecture
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Status Chip */}
          {scanResult ? (
            <Badge appearance="tint" color="success">
              Active: {targetFolderDisplay} ({scanResult.summary.findings.total} findings)
            </Badge>
          ) : (
            <Badge appearance="tint" color="informative">
              Ready · Zero State (0 loaded)
            </Badge>
          )}

          {/* Load Demo button if not active */}
          {!scanResult && (
            <Button
              appearance="primary"
              size="small"
              icon={<Flash20Filled />}
              onClick={onLoadDemo}
              disabled={isScanning}
            >
              {isScanning ? "Scanning Demo..." : "Load Demo"}
            </Button>
          )}

          {/* Reset Demo button if active */}
          {scanResult && (
            <Tooltip content="Reset scan data back to zero" relationship="label">
              <Button
                appearance="outline"
                size="small"
                icon={<ArrowReset20Regular />}
                onClick={() => {
                  onResetDemo();
                  setCurrentTab("overview");
                }}
              >
                Reset Demo
              </Button>
            </Tooltip>
          )}

          {/* Scan Repo Trigger */}
          <Button
            appearance={scanResult ? "primary" : "secondary"}
            size="small"
            icon={<FolderOpen16Regular />}
            onClick={() => setIsScanModalOpen(true)}
            disabled={isScanning}
          >
            Scan Repo
          </Button>

          {/* Global search trigger */}
          <Button
            appearance="subtle"
            icon={<Search20Regular />}
            onClick={() => setIsSearchOpen(true)}
            style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)" }}
          >
            Search <kbd style={{ marginLeft: "6px", fontSize: "10px", opacity: 0.7, background: "var(--colorNeutralBackground3)", padding: "1px 5px", borderRadius: "3px" }}>Ctrl+K</kbd>
          </Button>

          {/* Dark/Light mode toggle */}
          <Tooltip content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} relationship="label">
            <Button
              appearance="subtle"
              icon={isDarkMode ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
            />
          </Tooltip>
        </div>
      </header>

      {/* Main Container with Sidebar Rail & Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Compact Navigation Rail */}
        <nav
          style={{
            width: "220px",
            borderRight: "1px solid var(--colorNeutralStroke1)",
            background: "var(--colorNeutralBackground2)",
            display: "flex",
            flexDirection: "column",
            padding: "12px 8px",
            gap: "4px",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: isActive ? "var(--colorNeutralBackground1)" : "transparent",
                  color: isActive ? "var(--colorBrandForeground1)" : "var(--colorNeutralForeground1)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s ease",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon style={{ fontSize: "18px", color: isActive ? "var(--colorBrandForeground1)" : "inherit" }} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    appearance={isActive ? "filled" : "tint"}
                    color={item.id === "migration" ? "danger" : "brand"}
                    size="small"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: "12px 8px", fontSize: "11px", color: "var(--colorNeutralForeground3)", lineHeight: 1.4 }}>
            <div>PQC Engine: <strong>v1.0.0</strong></div>
            <div>Post-Quantum Agility</div>
          </div>
        </nav>

        {/* Page Content Viewport */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px",
            background: "var(--colorNeutralBackground3)",
          }}
        >
          {currentTab === "overview" && (
            <OverviewPage
              scanResult={scanResult}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              onNavigate={(tab) => setCurrentTab(tab)}
              onExportReport={() => setCurrentTab("reports")}
              onLoadDemo={onLoadDemo}
              onResetDemo={onResetDemo}
              onScanPath={onScanPath}
              isScanning={isScanning}
            />
          )}

          {currentTab === "findings" && (
            <FindingsPage
              findings={scanResult?.findings || []}
              onLoadDemo={onLoadDemo}
              onOpenScanModal={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === "dependencies" && (
            <DependenciesPage
              graph={scanResult?.dependency_graph || { nodes: [], edges: [] }}
              onLoadDemo={onLoadDemo}
              onOpenScanModal={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === "certificates" && (
            <CertificatesPage
              certificates={scanResult?.certificates || []}
              onLoadDemo={onLoadDemo}
              onOpenScanModal={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === "migration" && (
            <MigrationPage
              scanId={scanResult?.summary.scan_id || ""}
              migrationPlan={scanResult?.migration_plan || []}
              onUpdatePlan={(updated) => {
                if (scanResult) scanResult.migration_plan = updated;
              }}
              onLoadDemo={onLoadDemo}
              onOpenScanModal={() => setIsScanModalOpen(true)}
            />
          )}

          {currentTab === "sandbox" && <SandboxPage />}

          {currentTab === "reports" && <ReportsPage scanResult={scanResult} />}

          {currentTab === "settings" && <SettingsPage scanResult={scanResult} />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <ScanModal
        open={isScanModalOpen}
        onOpenChange={setIsScanModalOpen}
        onScanComplete={(res) => {
          onScanComplete(res);
          setCurrentTab("overview");
        }}
      />

      <GlobalSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        findings={scanResult?.findings || []}
        certificates={scanResult?.certificates || []}
        onSelectFinding={handleSelectFindingFromSearch}
      />

      <FindingDetailDrawer
        open={isFindingDrawerOpen}
        onOpenChange={setIsFindingDrawerOpen}
        finding={selectedFinding}
      />
    </div>
  );
};
