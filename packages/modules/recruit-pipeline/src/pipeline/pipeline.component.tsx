"use client";

import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, SearchField, Toast, useToast } from "@recruit/shared";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  BadgeColor,
  PipelineColumnConfig,
  PipelineConfig,
} from "./pipeline.configuration";

interface PipelineOwner {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

interface PipelineCardData {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  badge: string;
  badgeKind: string;
  attachments: number;
  comments: number;
  daysInStage: number;
  overSla: boolean;
  owner: PipelineOwner;
  stage: string;
}

interface PipelineColumnData {
  stage: string;
  count: number;
  cards: PipelineCardData[];
}

interface PipelineRecruiter {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roles: number;
  candidates: number;
}

interface PipelineBoard {
  columns: PipelineColumnData[];
  recruiters: PipelineRecruiter[];
  sla: { count: number; names: string[] };
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

function PipelineCard({
  card,
  config,
  t,
  onOpen,
  onDragStart,
}: {
  card: PipelineCardData;
  config: PipelineConfig;
  t: Translate;
  onOpen: (card: PipelineCardData) => void;
  onDragStart: (card: PipelineCardData) => void;
}) {
  const badgeColor: BadgeColor = config.badgeKinds[card.badgeKind] ?? "default";
  return (
    <Card
      variant="interactive"
      draggable
      onDragStart={() => onDragStart(card)}
      onClick={() => onOpen(card)}
      sx={{ p: "13px 14px" }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: 12.5,
            fontWeight: 600,
            bgcolor: card.avatarBg,
            color: card.avatarFg,
          }}
        >
          {card.initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
              {card.name}
            </Typography>
            <Chip variant="soft" color={badgeColor} label={card.badge} />
          </Box>
          <Typography
            sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}
            noWrap
          >
            {[card.role, card.client].filter(Boolean).join(" · ")}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          mt: "12px",
          pt: "10px",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: card.overSla ? "warning.light" : "text.disabled",
          }}
        >
          <IconRenderer name="timer" size={14} />
          <Typography sx={{ fontSize: 11.5, color: "inherit" }}>
            {t("card.daysInStage", { days: card.daysInStage })}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "text.disabled",
          }}
        >
          <IconRenderer name="attach-file" size={13} />
          <Typography sx={{ fontSize: 11.5, color: "inherit" }}>
            {card.attachments}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "text.disabled",
          }}
        >
          <IconRenderer name="comment" size={13} />
          <Typography sx={{ fontSize: 11.5, color: "inherit" }}>
            {card.comments}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Avatar
          sx={{
            width: 22,
            height: 22,
            fontSize: 10,
            fontWeight: 600,
            bgcolor: card.owner.avatarBg,
            color: card.owner.avatarFg,
          }}
        >
          {card.owner.initials}
        </Avatar>
      </Box>
    </Card>
  );
}

function PipelineColumn({
  column,
  cards,
  config,
  t,
  isOver,
  onAdd,
  onOpen,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
}: {
  column: PipelineColumnConfig;
  cards: PipelineCardData[];
  config: PipelineConfig;
  t: Translate;
  isOver: boolean;
  onAdd: () => void;
  onOpen: (card: PipelineCardData) => void;
  onDragStart: (card: PipelineCardData) => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragLeave: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "4px" }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: column.dot,
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
          {t(column.label)}
        </Typography>
        <Chip variant="soft" color="default" label={cards.length} />
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={onAdd} aria-label={t("actions.addToColumn")}>
          <IconRenderer name="add" size={15} />
        </IconButton>
      </Box>
      <Typography
        sx={{ fontSize: 11.5, color: "text.disabled", mb: "12px" }}
        noWrap
      >
        {t(column.hint)}
      </Typography>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver();
        }}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
          minHeight: 120,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isOver ? "primary.main" : "transparent",
          transition: "border-color .12s",
          p: isOver ? "4px" : 0,
        }}
      >
        {cards.length === 0 ? (
          <Card
            variant="ghost"
            onClick={onAdd}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flex: 1,
              minHeight: 140,
              color: "text.disabled",
            }}
          >
            <IconRenderer name={column.emptyIcon} size={22} />
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}
            >
              {t("empty.title", { stage: t(column.label) })}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
              {t(column.hint)}
            </Typography>
          </Card>
        ) : (
          cards.map((card) => (
            <PipelineCard
              key={card.id}
              card={card}
              config={config}
              t={t}
              onOpen={onOpen}
              onDragStart={onDragStart}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

export function PipelineComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PipelineConfig>(id);
  const router = usePortalRouter();
  const { toast, show, clear } = useToast();

  const [client, setClient] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filters = useMemo(
    () => ({
      client: client ?? undefined,
      owner: owner ?? undefined,
      search: search.trim() || undefined,
    }),
    [client, owner, search],
  );

  const { data, mutate, mutation } = useFetch<PipelineBoard>(id, { filters });

  const [board, setBoard] = useState<PipelineColumnData[]>([]);
  const [overStage, setOverStage] = useState<string | null>(null);
  const dragRef = useRef<PipelineCardData | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    if (data?.columns) setBoard(data.columns);
  }, [data]);

  const cardsByStage = useMemo(() => {
    const map = new Map<string, PipelineCardData[]>();
    for (const col of board) map.set(col.stage, col.cards);
    return map;
  }, [board]);

  const clientOptions = useMemo(
    () => [null, ...config.clients],
    [config.clients],
  );

  const cycleClient = () => {
    const idx = clientOptions.indexOf(client);
    const next = clientOptions[(idx + 1) % clientOptions.length] ?? null;
    setClient(next);
  };

  const openCard = (card: PipelineCardData) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    router.push(config.cardRouteId, { id: card.id });
  };

  const startDrag = (card: PipelineCardData) => {
    dragRef.current = card;
    suppressClick.current = true;
  };

  const dropOn = async (targetStage: string) => {
    const card = dragRef.current;
    dragRef.current = null;
    setOverStage(null);
    if (!card || card.stage === targetStage) return;

    setBoard((prev) =>
      prev.map((col) => {
        if (col.stage === card.stage) {
          const cards = col.cards.filter((c) => c.id !== card.id);
          return { ...col, count: cards.length, cards };
        }
        if (col.stage === targetStage) {
          const cards = [{ ...card, stage: targetStage }, ...col.cards];
          return { ...col, count: cards.length, cards };
        }
        return col;
      }),
    );

    const label = config.columns.find((c) => c.stage === targetStage)?.label;
    const stageLabel = label ? t(label) : targetStage;
    await mutation.update?.({ id: card.id, stage: targetStage });
    await mutate();
    show(
      t("toast.movedTitle", { stage: stageLabel }),
      t("toast.movedSub", { name: card.name, stage: stageLabel }),
    );
  };

  const recruiters = data?.recruiters ?? [];
  const sla = data?.sla;
  const slaNames = sla?.names ?? [];
  const slaLabel =
    slaNames.slice(0, 3).join(", ") + (slaNames.length > 3 ? "…" : "");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={cycleClient}
          startIcon={<IconRenderer name="domain" size={15} />}
          endIcon={<IconRenderer name="expand-more" size={16} />}
        >
          {client ?? t("filters.allClients")}
        </Button>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("filters.searchPlaceholder")}
          width={320}
        />
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={() => router.push(config.addRouteId)}
          startIcon={<IconRenderer name="add" size={16} />}
        >
          {t("actions.add")}
        </Button>
      </Box>

      {recruiters.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {t("workload.title")}
          </Typography>
          {recruiters.map((r) => {
            const active = owner === r.name;
            return (
              <Chip
                key={r.name}
                variant="soft"
                color={active ? "primary" : "default"}
                onClick={() => setOwner(active ? null : r.name)}
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: r.avatarBg,
                      color: r.avatarFg,
                      fontSize: 9.5,
                      fontWeight: 600,
                    }}
                  >
                    {r.initials}
                  </Avatar>
                }
                label={`${r.name} · ${t("workload.summary", {
                  roles: r.roles,
                  candidates: r.candidates,
                })}`}
              />
            );
          })}
        </Box>
      ) : null}

      {sla && sla.count > 0 ? (
        <Alert
          severity="warning"
          icon={<IconRenderer name="timer" size={18} />}
        >
          {t("sla.banner", { count: sla.count, names: slaLabel })}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {config.columns.map((column) => (
          <PipelineColumn
            key={column.stage}
            column={column}
            cards={cardsByStage.get(column.stage) ?? []}
            config={config}
            t={t}
            isOver={overStage === column.stage}
            onAdd={() => router.push(config.addRouteId)}
            onOpen={openCard}
            onDragStart={startDrag}
            onDragOver={() => setOverStage(column.stage)}
            onDragLeave={() =>
              setOverStage((s) => (s === column.stage ? null : s))
            }
            onDrop={() => dropOn(column.stage)}
          />
        ))}
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
