import React, { useState } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Field,
  ProgressBar,
  Spinner,
  MessageBar,
  MessageBarBody,
  TabList,
  Tab,
} from "@fluentui/react-components";
import type { SelectTabData, SelectTabEvent } from "@fluentui/react-components";
import { Play16Filled, ArrowUpload16Regular, FolderOpen16Regular } from "@fluentui/react-icons";
import { api } from "../services/api";
import type { ScanResult } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (result: ScanResult) => void;
}

export const ScanModal: React.FC<Props> = ({ open, onOpenChange, onScanComplete }) => {
  const [selectedTab, setSelectedTab] = useState<string>("demo");
  const [localPath, setLocalPath] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as string);
    setErrorMsg(null);
  };

  const handleStartScan = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let result: ScanResult;
      if (selectedTab === "demo") {
        result = await api.startScan(undefined, true);
      } else if (selectedTab === "path") {
        if (!localPath.trim()) {
          throw new Error("Please enter a valid directory path.");
        }
        result = await api.startScan(localPath.trim(), false);
      } else if (selectedTab === "upload") {
        if (!selectedFile) {
          throw new Error("Please choose an archive file to upload.");
        }
        result = await api.uploadAndScan(selectedFile);
      } else {
        throw new Error("Invalid scan method selected.");
      }
      onScanComplete(result);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during repository scan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface style={{ maxWidth: "560px" }}>
        <DialogBody>
          <DialogTitle>Scan Repository for Cryptographic Mechanisms</DialogTitle>
          <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <p style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", margin: 0 }}>
              Inspect application source code, configurations, dependency manifests, and certificates
              for classical algorithms requiring migration assessment.
            </p>

            <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
              <Tab value="demo" icon={<Play16Filled />}>
                Demo Repository
              </Tab>
              <Tab value="path" icon={<FolderOpen16Regular />}>
                Local Directory
              </Tab>
              <Tab value="upload" icon={<ArrowUpload16Regular />}>
                Upload Archive
              </Tab>
            </TabList>

            {selectedTab === "demo" && (
              <div style={{ background: "var(--colorNeutralBackground3)", padding: "16px", borderRadius: "6px" }}>
                <strong>Enterprise Multi-Tier Demo Suite</strong>
                <p style={{ fontSize: "13px", margin: "6px 0 0 0", color: "var(--colorNeutralForeground2)" }}>
                  Contains Python auth service with RSA-2048 and AES-256, Node.js JWT verifier, Nginx TLS proxy config,
                  manifests, and genuine X.509 public certificates.
                </p>
              </div>
            )}

            {selectedTab === "path" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Field label="Directory Absolute or Relative Path" required>
                  <Input
                    value={localPath}
                    onChange={(_, d) => setLocalPath(d.value)}
                    placeholder="e.g. samples/demo-repository or D:/Projects/backend"
                    disabled={isLoading}
                  />
                </Field>

                <div>
                  <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginBottom: "4px" }}>
                    Quick Presets:
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setLocalPath("samples/demo-repository")}
                    >
                      samples/demo-repository
                    </Button>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setLocalPath(".")}
                    >
                      . (Project Root)
                    </Button>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => setLocalPath("samples/demo-repository/certificates")}
                    >
                      certificates/
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "upload" && (
              <Field label="Select Repository Archive (.zip)" required>
                <input
                  type="file"
                  accept=".zip,.tar,.tar.gz"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                  style={{
                    padding: "8px",
                    border: "1px dashed var(--colorNeutralStroke1)",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                />
              </Field>
            )}

            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                <ProgressBar />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                  <Spinner size="extra-tiny" />
                  <span>Scanning files, parsing AST, evaluating certificates, and constructing dependency graph...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <MessageBar intent="error">
                <MessageBarBody>{errorMsg}</MessageBarBody>
              </MessageBar>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button appearance="primary" icon={<Play16Filled />} onClick={handleStartScan} disabled={isLoading}>
              {isLoading ? "Scanning..." : "Start Scan"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
