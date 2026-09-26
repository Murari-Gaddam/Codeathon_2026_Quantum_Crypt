import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Input,
  Checkbox,
  Divider,
  ProgressBar,
} from "@fluentui/react-components";
import { Save16Regular, Checkmark16Regular, ArrowSwap16Regular, Play16Filled } from "@fluentui/react-icons";
import type { MigrationItem } from "../types";
import { PriorityBadge } from "../components/PriorityBadge";
import { api } from "../services/api";

interface Props {
  scanId: string;
  migrationPlan: MigrationItem[];
  onUpdatePlan: (updatedItems: MigrationItem[]) => void;
  onLoadDemo?: () => void;
  onOpenScanModal?: () => void;
}

export const MigrationPage: React.FC<Props> = ({
  scanId,
  migrationPlan,
  onUpdatePlan,
  onLoadDemo,
  onOpenScanModal,
}) => {
  const [items, setItems] = useState<MigrationItem[]>(migrationPlan);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(migrationPlan);
  }, [migrationPlan]);

  if (items.length === 0) {
    return (
      <Card style={{ padding: "48px 24px", textAlign: "center" }}>
        <ArrowSwap16Regular style={{ fontSize: "40px", color: "var(--colorBrandForeground1)", marginBottom: "12px" }} />
        <h3 style={{ margin: "0 0 8px 0" }}>No Migration Action Items</h3>
        <p style={{ color: "var(--colorNeutralForeground2)", maxWidth: "480px", margin: "0 auto 20px auto", fontSize: "13px" }}>
          Scan a local repository or load the built-in enterprise demo suite to generate a prioritized,
          multi-gate post-quantum migration plan.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {onLoadDemo && (
            <Button appearance="primary" icon={<Play16Filled />} onClick={onLoadDemo}>
              Load Demo Migration Plan
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

  const handleGateToggle = (itemId: string, gateId: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newGates = item.validation_gates.map((g) =>
          g.id === gateId ? { ...g, completed: !g.completed } : g
        );
        return { ...item, validation_gates: newGates };
      })
    );
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };

  const handleOwnerChange = (itemId: string, newOwner: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, owner: newOwner } : item))
    );
  };

  const handleNotesChange = (itemId: string, newNotes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes: newNotes } : item))
    );
  };

  const handleSaveItem = async (item: MigrationItem) => {
    setSavingId(item.id);
    try {
      const updated = await api.updateMigrationItem(scanId, item.id, item);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      onUpdatePlan(items);
      setSuccessMsg(`Saved checklist updates for ${item.mechanism}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      alert("Error saving item: " + e.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "18px" }}>Post-Quantum Cryptography Migration Plan</h3>}
          description="Prioritized checklist derived from detected algorithms, protocol exposures, and dependency fan-out."
        />

        {successMsg && (
          <div
            style={{
              background: "#dff6dd",
              border: "1px solid #8ad59e",
              color: "#107c41",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            <Checkmark16Regular /> {successMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          {items.map((item) => {
            const completedGates = item.validation_gates.filter((g) => g.completed).length;
            const progress = item.validation_gates.length ? completedGates / item.validation_gates.length : 0;

            return (
              <Card
                key={item.id}
                style={{
                  padding: "20px",
                  border: "1px solid var(--colorNeutralStroke1)",
                  borderRadius: "8px",
                  background: "var(--colorNeutralBackground1)",
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <PriorityBadge priority={item.priority} />
                      <h4 style={{ margin: 0, fontSize: "16px" }}>{item.mechanism}</h4>
                      <Badge appearance="outline">{item.component}</Badge>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "6px" }}>
                      <strong>Priority Rationale:</strong> {item.priority_reason}
                    </div>
                  </div>

                  {/* Status Dropdown & Save */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "4px",
                        border: "1px solid var(--colorNeutralStroke1)",
                        fontSize: "13px",
                        background: "var(--colorNeutralBackground1)",
                        color: "var(--colorNeutralForeground1)",
                      }}
                    >
                      <option value="not-started">Not Started</option>
                      <option value="investigating">Investigating</option>
                      <option value="in-testing">In Testing</option>
                      <option value="blocked">Blocked</option>
                      <option value="ready-for-review">Ready for Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    <Button
                      appearance="primary"
                      size="small"
                      icon={<Save16Regular />}
                      disabled={savingId === item.id}
                      onClick={() => handleSaveItem(item)}
                    >
                      {savingId === item.id ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px", fontSize: "13px" }}>
                  <div>
                    <div style={{ color: "var(--colorNeutralForeground3)", fontSize: "12px" }}>Reason for Review</div>
                    <div style={{ marginTop: "2px" }}>{item.reason_for_review}</div>

                    <div style={{ color: "var(--colorNeutralForeground3)", fontSize: "12px", marginTop: "12px" }}>
                      Impacted Downstream Dependencies
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                      {item.dependencies.map((dep) => (
                        <Badge key={dep} appearance="tint" color="brand">{dep}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "var(--colorNeutralForeground3)", fontSize: "12px" }}>Suggested Investigation</div>
                    <div style={{ marginTop: "2px" }}>{item.suggested_investigation}</div>

                    <div style={{ color: "var(--colorNeutralForeground3)", fontSize: "12px", marginTop: "12px" }}>
                      Compatibility Concerns
                    </div>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "18px", color: "var(--colorNeutralForeground2)" }}>
                      {item.compatibility_concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {/* Validation Gates 1 to 8 */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      Validation Gates ({completedGates} of {item.validation_gates.length} Completed)
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
                      {Math.round(progress * 100)}% Verified
                    </span>
                  </div>

                  <ProgressBar value={progress} color={progress === 1 ? "success" : "brand"} style={{ marginBottom: "12px" }} />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
                    {item.validation_gates.map((gate) => (
                      <div
                        key={gate.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          background: gate.completed ? "var(--colorNeutralBackground3)" : "transparent",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--colorNeutralStroke2)",
                        }}
                      >
                        <Checkbox
                          checked={gate.completed}
                          onChange={() => handleGateToggle(item.id, gate.id)}
                          label={
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 600 }}>
                                Gate {gate.id}: {gate.name}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>
                                {gate.description}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner & Notes */}
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "12px", marginTop: "16px" }}>
                  <Input
                    size="small"
                    value={item.owner}
                    onChange={(_, d) => handleOwnerChange(item.id, d.value)}
                    placeholder="Owner (e.g. Identity Team)"
                  />
                  <Input
                    size="small"
                    value={item.notes}
                    onChange={(_, d) => handleNotesChange(item.id, d.value)}
                    placeholder="Engineering notes, ticket references, or rollback prerequisites..."
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
