import React from "react";
import { Badge } from "@fluentui/react-components";
import { DismissCircle16Regular, Warning16Regular, Info16Regular, Clock16Regular } from "@fluentui/react-icons";
import type { PriorityLevel } from "../types";

interface Props {
  priority: PriorityLevel;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  switch (priority.toLowerCase()) {
    case "immediate":
    case "critical":
      return (
        <Badge
          appearance="filled"
          color="danger"
          icon={<DismissCircle16Regular />}
          size="medium"
        >
          {priority.toUpperCase()}
        </Badge>
      );
    case "high":
      return (
        <Badge
          appearance="tint"
          color="warning"
          icon={<Warning16Regular />}
          size="medium"
        >
          HIGH
        </Badge>
      );
    case "medium":
      return (
        <Badge
          appearance="tint"
          color="brand"
          icon={<Clock16Regular />}
          size="medium"
        >
          MEDIUM
        </Badge>
      );
    case "low":
    case "info":
    default:
      return (
        <Badge
          appearance="tint"
          color="subtle"
          icon={<Info16Regular />}
          size="medium"
        >
          {priority.toUpperCase()}
        </Badge>
      );
  }
};
