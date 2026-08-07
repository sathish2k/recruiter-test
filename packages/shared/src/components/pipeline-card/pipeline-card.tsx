"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { DragEvent, MouseEvent } from "react";
import { avatarSwatch, initialsOf } from "../../utils/avatar";
import { IconRenderer } from "../renderers";

/** One application, as the board draws it. */
export interface PipelineCardData {
  id: string;
  candidateId: string;
  candidateName: string;
  /** The requirement and its client — the two lines under the name. */
  jobTitle?: string;
  clientName?: string;
  matchScore?: number;
  daysInStage?: number;
  /** Days past the stage's limit; zero means inside it. */
  slaOverBy?: number;
  ownerName?: string;
  offLimits?: boolean;
  doNotContact?: boolean;
  status?: string;
  rejectionReason?: string;
}

/** Every visible string, already translated by the owning module. */
export interface PipelineCardLabels {
  match: string;
  inStage: string;
  overSla: string;
  offLimits: string;
  doNotContact: string;
  /** Accessible name for the move control. */
  move: string;
}

export interface PipelineCardHandlers {
  onOpen?: (card: PipelineCardData) => void;
  /** Omit to hide the move control — the closed-out column has nowhere to go. */
  onMove?: (card: PipelineCardData) => void;
  onDragStart?: (card: PipelineCardData) => void;
  onDragEnd?: () => void;
}

export function PipelineCardSkeleton() {
  return (
    <Card variant="base" sx={{ p: "13px 14px", borderRadius: "12px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={16} />
          <Skeleton variant="text" width="50%" height={13} />
        </Box>
      </Box>
      <Skeleton
        variant="rounded"
        width={86}
        height={22}
        sx={{ mt: "9px", borderRadius: "999px" }}
      />
      <Skeleton variant="text" width="60%" height={12} sx={{ mt: "12px" }} />
    </Card>
  );
}

/**
 * The board's card. Presentational, like `ClientCard`: it takes one
 * application, its already-translated strings and its handlers, so the same
 * card can be drawn by the board, a requirement's pipeline panel or a
 * first-run preview without any of them agreeing on an endpoint.
 */
export function PipelineCard({
  card,
  labels,
  draggable,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  card: PipelineCardData;
  labels: PipelineCardLabels;
  draggable?: boolean;
} & PipelineCardHandlers) {
  const swatch = avatarSwatch(card.candidateName);
  const owner = card.ownerName ? avatarSwatch(card.ownerName) : null;
  const breached = (card.slaOverBy ?? 0) > 0;

  const stop = (handler?: (card: PipelineCardData) => void) => (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handler?.(card);
  };

  return (
    <Card
      variant="base"
      data-card-id={card.id}
      data-card-name={card.candidateName}
      draggable={draggable}
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        // Firefox needs a payload before it will start a drag at all.
        event.dataTransfer.setData("text/plain", card.id);
        onDragStart?.(card);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onOpen?.(card)}
      sx={{
        p: "13px 14px",
        borderRadius: "12px",
        borderColor: breached ? "surface.warningSoftBorder" : "divider",
        cursor: draggable ? "grab" : "pointer",
        "&:hover": { borderColor: "surface.primarySoftBorder" },
      }}
    >
      {card.offLimits || card.doNotContact ? (
        <Box sx={{ display: "flex", gap: "6px", mb: "9px", flexWrap: "wrap" }}>
          {card.offLimits ? (
            <Chip variant="soft" color="error" size="small" label={labels.offLimits} />
          ) : null}
          {card.doNotContact ? (
            <Chip variant="soft" color="warning" size="small" label={labels.doNotContact} />
          ) : null}
        </Box>
      ) : null}

      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "8px" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            flex: "none",
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
            bgcolor: swatch.bg,
            color: swatch.fg,
          }}
        >
          {initialsOf(card.candidateName)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 13, fontWeight: 700 }}>
            {card.candidateName}
          </Typography>
          {card.jobTitle ? (
            <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
              {card.jobTitle}
            </Typography>
          ) : null}
          {card.clientName ? (
            <Typography noWrap sx={{ fontSize: 11, color: "text.disabled" }}>
              {card.clientName}
            </Typography>
          ) : null}
        </Box>
        {onMove ? (
          <Box
            component="button"
            type="button"
            aria-label={labels.move}
            onClick={stop(onMove)}
            sx={{
              flex: "none",
              alignSelf: "flex-start",
              display: "flex",
              background: "none",
              border: 0,
              p: 0,
              cursor: "pointer",
              color: "text.disabled",
              "&:hover": { color: "text.primary" },
            }}
          >
            <IconRenderer name="move-up" size={16} />
          </Box>
        ) : null}
      </Box>

      {card.matchScore ? (
        <Box sx={{ display: "flex", pb: "9px" }}>
          <Chip variant="soft" color="primary" size="small" label={labels.match} />
        </Box>
      ) : null}

      {card.status === "rejected" && card.rejectionReason ? (
        <Typography sx={{ fontSize: 11, color: "surface.errorFg", pb: "9px" }}>
          {card.rejectionReason}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: 11,
          color: "text.disabled",
          borderTop: "1px dashed",
          borderColor: "divider",
          pt: "9px",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: 0,
            color: breached ? "surface.errorFg" : "text.disabled",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "999px",
              flex: "none",
              bgcolor: breached ? "surface.errorFg" : "surface.textDisabled",
            }}
          />
          {breached ? labels.overSla : labels.inStage}
        </Box>
        <Box sx={{ flex: 1 }} />
        {owner && card.ownerName ? (
          <Box
            title={card.ownerName}
            sx={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              display: "grid",
              placeItems: "center",
              fontSize: 8.5,
              fontWeight: 700,
              bgcolor: owner.bg,
              color: owner.fg,
            }}
          >
            {initialsOf(card.ownerName)}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}
