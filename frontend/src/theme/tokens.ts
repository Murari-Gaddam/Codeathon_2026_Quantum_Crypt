/**
 * Centralized theme tokens and color constants adhering to Fluent 2.
 */

export const semanticStatus = {
  confirmed: {
    color: "#107c41",
    bg: "#dff6dd",
    border: "#8ad59e",
    label: "Confirmed Static Finding"
  },
  likely: {
    color: "#795e00",
    bg: "#fff4ce",
    border: "#fce183",
    label: "Likely Finding"
  },
  possible: {
    color: "#424242",
    bg: "#f0f0f0",
    border: "#d1d1d1",
    label: "Possible Match"
  },
  unknown: {
    color: "#605e5c",
    bg: "#edebe9",
    border: "#c8c6c4",
    label: "Requires Review"
  }
};

export const priorityRamp = {
  immediate: {
    color: "#a80000",
    bg: "#fde7e9",
    label: "Immediate Action"
  },
  critical: {
    color: "#a80000",
    bg: "#fde7e9",
    label: "Critical Concern"
  },
  high: {
    color: "#8e5a00",
    bg: "#fff4ce",
    label: "High Priority"
  },
  medium: {
    color: "#004578",
    bg: "#cce4f7",
    label: "Medium Priority"
  },
  low: {
    color: "#242424",
    bg: "#f3f2f1",
    label: "Low Priority"
  },
  info: {
    color: "#0078d4",
    bg: "#eff6fc",
    label: "Informational"
  }
};
