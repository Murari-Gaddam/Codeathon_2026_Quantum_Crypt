import React from "react";
import { Badge } from "@fluentui/react-components";
import { CheckmarkCircle16Regular, QuestionCircle16Regular, Warning16Regular, Info16Regular } from "@fluentui/react-icons";
import type { ConfidenceLevel } from "../types";

interface Props {
  confidence: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<Props> = ({ confidence }) => {
  switch (confidence.toLowerCase()) {
    case "confirmed":
      return (
        <Badge
          appearance="tint"
          color="success"
          icon={<CheckmarkCircle16Regular />}
          size="medium"
        >
          Confirmed
        </Badge>
      );
    case "likely":
      return (
        <Badge
          appearance="tint"
          color="warning"
          icon={<Warning16Regular />}
          size="medium"
        >
          Likely
        </Badge>
      );
    case "possible":
      return (
        <Badge
          appearance="tint"
          color="subtle"
          icon={<QuestionCircle16Regular />}
          size="medium"
        >
          Possible
        </Badge>
      );
    default:
      return (
        <Badge
          appearance="outline"
          color="informative"
          icon={<Info16Regular />}
          size="medium"
        >
          Review
        </Badge>
      );
  }
};
