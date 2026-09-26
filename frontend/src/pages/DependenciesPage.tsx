import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import {
  Card,
  Button,
  TabList,
  Tab,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@fluentui/react-components";
import {
  ZoomIn16Regular,
  ZoomOut16Regular,
  ArrowReset20Regular,
  Table16Regular,
  BranchFork16Regular,
  Play16Filled,
} from "@fluentui/react-icons";
import type { DependencyGraph, DependencyNode } from "../types";

interface Props {
  graph: DependencyGraph;
  onLoadDemo?: () => void;
  onOpenScanModal?: () => void;
}

export const DependenciesPage: React.FC<Props> = ({ graph, onLoadDemo, onOpenScanModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph");
  const [filterType, setFilterType] = useState<string>("all");

  if (graph.nodes.length === 0) {
    return (
      <Card style={{ padding: "48px 24px", textAlign: "center" }}>
        <BranchFork16Regular style={{ fontSize: "40px", color: "var(--colorBrandForeground1)", marginBottom: "12px" }} />
        <h3 style={{ margin: "0 0 8px 0" }}>No Dependency Relationships Mapped</h3>
        <p style={{ color: "var(--colorNeutralForeground2)", maxWidth: "480px", margin: "0 auto 20px auto", fontSize: "13px" }}>
          Scan a local repository or load the built-in enterprise demo suite to map callers, cryptographic primitives,
          and component dependencies in a bipartite graph.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {onLoadDemo && (
            <Button appearance="primary" icon={<Play16Filled />} onClick={onLoadDemo}>
              Load Demo Dependencies
            </Button>
          )}
          {onOpenScanModal && (
            <Button appearance="outline" onClick={onOpenScanModal}>
              Scan Directory
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const nodeTypes = Array.from(new Set(graph.nodes.map((n) => n.type)));

  useEffect(() => {
    if (viewMode !== "graph" || !containerRef.current) return;

    // Filter elements
    const filteredNodes = filterType === "all"
      ? graph.nodes
      : graph.nodes.filter((n) => n.type === filterType);

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    const elements: cytoscape.ElementDefinition[] = [
      ...filteredNodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          status: n.status || "Discovered",
        },
      })),
      ...graph.edges
        .filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))
        .map((e) => ({
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.relationship,
            relationship: e.relationship,
          },
        })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0078d4",
            label: "data(label)",
            "font-family": "Segoe UI, sans-serif",
            "font-size": "11px",
            color: "#323130",
            "text-valign": "bottom",
            "text-margin-y": 6,
            width: 36,
            height: 36,
            "border-width": 2,
            "border-color": "#ffffff",
          },
        },
        {
          selector: "node[type = 'service']",
          style: {
            "background-color": "#005a9e",
            shape: "round-rectangle",
            width: 44,
            height: 32,
          },
        },
        {
          selector: "node[type = 'certificate']",
          style: {
            "background-color": "#107c41",
            shape: "diamond",
            width: 40,
            height: 40,
          },
        },
        {
          selector: "node[type = 'protocol']",
          style: {
            "background-color": "#d83b01",
            shape: "hexagon",
            width: 38,
            height: 38,
          },
        },
        {
          selector: "node[type = 'library']",
          style: {
            "background-color": "#8764b8",
            shape: "ellipse",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#c8c6c4",
            "target-arrow-color": "#a19f9d",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "9px",
            "text-rotation": "autorotate",
            color: "#605e5c",
          },
        },
        {
          selector: ":selected",
          style: {
            "border-width": 4,
            "border-color": "#ffaa44",
            "line-color": "#0078d4",
            "target-arrow-color": "#0078d4",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false,
        componentSpacing: 120,
        nodeOverlap: 20,
      },
    });

    cy.on("tap", "node", (evt) => {
      const nodeData = evt.target.data();
      const match = graph.nodes.find((n) => n.id === nodeData.id);
      setSelectedNode(match || null);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graph, viewMode, filterType]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleReset = () => cyRef.current?.fit();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Control bar */}
      <Card style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TabList
              selectedValue={viewMode}
              onTabSelect={(_, d) => setViewMode(d.value as "graph" | "table")}
            >
              <Tab value="graph" icon={<BranchFork16Regular />}>
                Interactive Graph
              </Tab>
              <Tab value="table" icon={<Table16Regular />}>
                Accessible Dependency Matrix
              </Tab>
            </TabList>

            {viewMode === "graph" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Filter Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid var(--colorNeutralStroke1)",
                    fontSize: "12px",
                    background: "var(--colorNeutralBackground1)",
                    color: "var(--colorNeutralForeground1)",
                  }}
                >
                  <option value="all">All Types ({graph.nodes.length})</option>
                  {nodeTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {viewMode === "graph" && (
            <div style={{ display: "flex", gap: "6px" }}>
              <Button appearance="subtle" icon={<ZoomIn16Regular />} size="small" onClick={handleZoomIn} title="Zoom In" />
              <Button appearance="subtle" icon={<ZoomOut16Regular />} size="small" onClick={handleZoomOut} title="Zoom Out" />
              <Button appearance="subtle" icon={<ArrowReset20Regular />} size="small" onClick={handleReset} title="Fit to View" />
            </div>
          )}
        </div>
      </Card>

      {/* Main Content Area */}
      {viewMode === "graph" ? (
        <div style={{ display: "grid", gridTemplateColumns: selectedNode ? "1fr 320px" : "1fr", gap: "16px" }}>
          {/* Cytoscape Canvas */}
          <Card style={{ height: "600px", padding: 0, overflow: "hidden", position: "relative" }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%", background: "var(--colorNeutralBackground1)" }} />
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "12px",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)",
                padding: "8px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                display: "flex",
                gap: "12px",
                border: "1px solid var(--colorNeutralStroke2)",
              }}
            >
              <span>● <strong style={{ color: "#005a9e" }}>Service</strong></span>
              <span>● <strong style={{ color: "#d83b01" }}>Protocol</strong></span>
              <span>● <strong style={{ color: "#0078d4" }}>Algorithm</strong></span>
              <span>● <strong style={{ color: "#107c41" }}>Certificate</strong></span>
              <span>● <strong style={{ color: "#8764b8" }}>Library</strong></span>
            </div>
          </Card>

          {/* Node Inspector Panel */}
          {selectedNode && (
            <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>Node Inspector</h4>
                <Button appearance="subtle" size="small" onClick={() => setSelectedNode(null)}>
                  Close
                </Button>
              </div>

              <div>
                <Badge appearance="tint" color="brand">{selectedNode.type.toUpperCase()}</Badge>
                <h3 style={{ margin: "8px 0 2px 0", fontSize: "16px" }}>{selectedNode.label}</h3>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
                  State: <strong>{selectedNode.status || "Discovered"}</strong>
                </div>
              </div>

              <div style={{ fontSize: "13px" }}>
                <strong>Details:</strong>
                <pre
                  style={{
                    background: "var(--colorNeutralBackground3)",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    marginTop: "6px",
                  }}
                >
                  {JSON.stringify(selectedNode.details || {}, null, 2)}
                </pre>
              </div>

              <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginTop: "auto" }}>
                Click connected graph edges to view directional dependencies.
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Accessible Tabular Alternative (Section 14 requirement) */
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Source Entity</TableHeaderCell>
                <TableHeaderCell>Relationship</TableHeaderCell>
                <TableHeaderCell>Target Entity</TableHeaderCell>
                <TableHeaderCell>Confidence</TableHeaderCell>
                <TableHeaderCell>Evidence Path</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {graph.edges.map((e) => {
                const srcNode = graph.nodes.find((n) => n.id === e.source);
                const tgtNode = graph.nodes.find((n) => n.id === e.target);
                return (
                  <TableRow key={e.id}>
                    <TableCell>
                      <strong>{srcNode?.label || e.source}</strong>{" "}
                      <span style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>
                        ({srcNode?.type})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="tint" color="informative">
                        {e.relationship}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <strong>{tgtNode?.label || e.target}</strong>{" "}
                      <span style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>
                        ({tgtNode?.type})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="outline" color="success">
                        {e.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code style={{ fontSize: "11px" }}>{e.evidence.join(", ") || "N/A"}</code>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
