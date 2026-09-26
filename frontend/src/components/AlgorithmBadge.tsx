import React from "react";
import { Badge, Tooltip } from "@fluentui/react-components";

interface Props {
  text: string;
  color?: "brand" | "danger" | "informative" | "severe" | "subtle" | "success" | "warning";
  appearance?: "filled" | "ghost" | "outline" | "tint";
  icon?: React.ReactElement;
  maxWidth?: number | string;
  truncate?: boolean;
}

export const AlgorithmBadge: React.FC<Props> = ({
  text,
  color = "brand",
  appearance = "tint",
  icon,
  maxWidth,
  truncate = false,
}) => {
  const badgeElement = (
    <Badge
      color={color}
      appearance={appearance}
      icon={icon}
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: "fit-content",
        height: "auto",
        padding: "3px 9px",
        borderRadius: "9999px",
        lineHeight: 1.3,
        maxWidth: maxWidth || "100%",
        whiteSpace: truncate ? "nowrap" : "normal",
        wordBreak: truncate ? "normal" : "break-word",
        overflow: truncate ? "hidden" : "visible",
        textOverflow: truncate ? "ellipsis" : "clip",
        fontSize: "12px",
        fontWeight: 500,
        boxSizing: "border-box",
      }}
    >
      {text}
    </Badge>
  );

  if (truncate || (typeof maxWidth === "number" && maxWidth < 200)) {
    return (
      <Tooltip content={text} relationship="description" positioning="above">
        {badgeElement}
      </Tooltip>
    );
  }

  return badgeElement;
};
