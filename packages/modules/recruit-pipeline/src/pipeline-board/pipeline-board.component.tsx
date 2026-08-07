"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import {
  FormModal,
  type FormValues,
  fetchOptions,
  IconRenderer,
  PipelineCard,
  type PipelineCardData,
  PipelineCardSkeleton,
  SearchField,
  type SelectOption,
  SlidingPillTabs,
  useModal,
  useSnackbar,
  useToast,
} from "@recruit/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PipelineBoardConfiguration } from "./pipeline-board.configuration";

const CLOSED = "__closed__";

interface BoardCard extends PipelineCardData {
  jobId: string;
  stageId: string;
  stageName: string;
}

interface Column {
  id: string;
  name: string;
  kind: string;
  slaDays: number;
  count: number;
  avgDays: number;
  oldestDays: number;
  wipLimit: number;
  overWip: boolean;
  cards: BoardCard[];
}

interface Board {
  columns: Column[];
  owners: { id: string; name: string; count: number; breaches: number }[];
  breaches: {
    id: string;
    candidateName: string;
    stageName: string;
    daysInStage: number;
    slaOverBy: number;
  }[];
  total: number;
}

/** What the move dialog opens with — the card, and the target when a drop has
 * already chosen one. */
interface Move {
  card: BoardCard;
  toId: string;
  rejecting: boolean;
}

/**
 * The pipeline board. Columns are the workspace's own stages, so a rename or a
 * reorder in Settings moves the board with it; the closed-out column is drawn
 * last and is not a stage. Every move — dropped or picked — goes through the
 * same schema-driven dialog, because the note and (on a rejection) the reason
 * are part of the record.
 */
export function PipelineBoardComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PipelineBoardConfiguration>(id);
  const router = usePortalRouter();
  const { show } = useToast();
  const { show: showReceipt } = useSnackbar();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ownerId, setOwnerId] = useState("");
  const [focus, setFocus] = useState(false);
  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [over, setOver] = useState("");
  const [options, setOptions] = useState<Record<string, SelectOption[]>>({});
  const [blocked, setBlocked] = useState<{ message: string; code: string } | null>(null);
  const [pending, setPending] = useState<FormValues | null>(null);
  const moveModal = useModal<Move>();

  const { data, isLoading, mutate, mutation } = useFetch<Board>(id, {
    filters: { ...filters, ownerId, search, wipLimit: String(config?.wipLimit ?? 0) },
  });
  const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;

  // Toolbar options are workspace data — fetched once, not per render.
  useEffect(() => {
    for (const filter of config?.filters ?? []) {
      fetchOptions({
        url: filter.url,
        path: filter.path,
        valueKey: filter.valueKey,
        labelKey: filter.labelKey,
      })
        .then((list) => setOptions((current) => ({ ...current, [filter.key]: list })))
        .catch(() => undefined);
    }
  }, [config?.filters]);

  const columns = useMemo(() => {
    const list = data?.columns ?? [];
    if (!focus) return list;
    // "Needs action" — anything past its stage SLA, or with a flag on it.
    return list.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => (card.slaOverBy ?? 0) > 0 || card.offLimits),
    }));
  }, [data?.columns, focus]);

  const openMove = useCallback(
    (card: BoardCard, toId = "") => {
      setBlocked(null);
      setPending(null);
      moveModal.open({ card, toId, rejecting: toId === CLOSED });
    },
    [moveModal],
  );

  /** The one write. `force` repeats a move the advisory guard stopped. */
  const submitMove = async (values: FormValues, force?: boolean) => {
    const move = moveModal.data;
    if (!move) return;
    const rejecting = values.outcome === "reject";
    setBlocked(null);
    setPending(values);
    try {
      await mut.move?.({
        id: move.card.id,
        ...(rejecting
          ? { status: "rejected", reasonId: String(values.reasonId ?? "") }
          : { toStageId: String(values.toStageId ?? ""), status: "active" }),
        note: String(values.note ?? ""),
        force,
      });
      const toName =
        (data?.columns ?? []).find((column) => column.id === values.toStageId)?.name ?? "";
      moveModal.close();
      await mutate();
      // A stage move is the recruiter's own write, and it is reversible — so
      // it gets the snackbar's receipt-with-undo, not a toast. Toasts are for
      // things that happened elsewhere.
      showReceipt(
        t(rejecting ? "toast.rejected" : "toast.moved", {
          name: move.card.candidateName,
          stage: toName,
        }),
        {
          label: t("toast.undo"),
          onClick: () => {
            void mut
              .move?.({
                id: move.card.id,
                toStageId: move.card.stageId,
                status: "active",
                force: true,
              })
              .then(() => mutate());
          },
        },
      );
    } catch (error) {
      const response = (error as { response?: { data?: { error?: string; code?: string } } })
        .response;
      setBlocked({
        message: response?.data?.error ?? t("errors.generic"),
        code: response?.data?.code ?? "unknown",
      });
    }
  };

  if (!config?.filters) return null;

  const activeFilters = Object.values(filters).filter(Boolean).length + (ownerId ? 1 : 0);
  const cardLabels = (card: BoardCard) => ({
    match: t("card.match", { score: card.matchScore ?? 0 }),
    inStage: t("card.inStage", { count: card.daysInStage ?? 0 }),
    overSla: t("card.overSla", { count: card.slaOverBy ?? 0 }),
    offLimits: t("flags.offLimits"),
    doNotContact: t("flags.doNotContact"),
    move: t("card.move", { name: card.candidateName }),
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px", minWidth: 0 }}>
      {/* Title + the Table / Board switch the design puts beside it. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{t("title")}</Typography>
        <SlidingPillTabs
          items={[
            { value: "table", render: () => t("views.table") },
            { value: "board", render: () => t("views.board") },
          ]}
          value="board"
          onChange={(value) => {
            if (value === "table") router.push(config.tableRouteId);
          }}
        />
        <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>{t("hint")}</Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <SearchField value={search} onChange={setSearch} placeholder={t("filters.search")} />
        {config.filters.map((filter) => (
          <TextField
            key={filter.key}
            select
            hiddenLabel
            size="small"
            sx={{ minWidth: 190 }}
            value={filters[filter.key] ?? ""}
            onChange={(event) =>
              setFilters((current) => ({ ...current, [filter.key]: event.target.value }))
            }
          >
            <MenuItem value="">{t(filter.label)}</MenuItem>
            {(options[filter.key] ?? []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <Button
          variant={focus ? "contained" : "outlined"}
          onClick={() => setFocus((current) => !current)}
          startIcon={<IconRenderer name="sparkle" size={15} />}
        >
          {t("filters.focus", { count: data?.breaches.length ?? 0 })}
        </Button>
        {activeFilters || search || focus ? (
          <Button
            variant="text"
            onClick={() => {
              setFilters({});
              setOwnerId("");
              setSearch("");
              setFocus(false);
            }}
          >
            {t("filters.clear")}
          </Button>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<IconRenderer name="person-add" size={16} />}
          onClick={() => router.push(config.addRouteId)}
        >
          {t("actions.add")}
        </Button>
      </Box>

      {/* Owner strip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mr: "4px" }}>
          {t("owners.label")}
        </Typography>
        <Chip
          variant="soft"
          color={ownerId ? "default" : "primary"}
          label={t("owners.all", { count: data?.total ?? 0 })}
          onClick={() => setOwnerId("")}
        />
        {(data?.owners ?? []).map((owner) => (
          <Chip
            key={owner.id}
            variant="soft"
            color={ownerId === owner.id ? "primary" : "default"}
            onClick={() => setOwnerId(ownerId === owner.id ? "" : owner.id)}
            label={`${owner.name} · ${owner.count}${owner.breaches ? ` · ${owner.breaches}!` : ""}`}
          />
        ))}
      </Box>

      {/* SLA banner — the same figures the cards carry. */}
      {data?.breaches.length ? (
        <Box
          sx={{
            bgcolor: "surface.warningSoftBg",
            border: "1px solid",
            borderColor: "surface.warningSoftBorder",
            borderRadius: "12px",
            p: "12px 15px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ color: "surface.warningFg", display: "flex" }}>
              <IconRenderer name="timer" size={16} />
            </Box>
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 700, color: "surface.warningFg", flex: 1 }}
            >
              {t("sla.headline", { count: data.breaches.length })}
            </Typography>
          </Box>
          {data.breaches.map((breach) => (
            <Box
              key={breach.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                mt: "9px",
                pt: "9px",
                borderTop: "1px solid",
                borderColor: "surface.warningSoftBorder",
              }}
            >
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600 }}>
                {breach.candidateName}
                <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>
                  {` — ${t("sla.reason", {
                    days: breach.daysInStage,
                    stage: breach.stageName,
                    over: breach.slaOverBy,
                  })}`}
                </Box>
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      {/* Board */}
      {isLoading && !data ? (
        <Box sx={{ display: "flex", gap: "11px" }}>
          {[0, 1, 2, 3].map((column) => (
            <Box
              key={column}
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <Skeleton variant="text" width="50%" height={18} />
              <PipelineCardSkeleton />
              <PipelineCardSkeleton />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(225px,1fr)",
            gap: "11px",
            alignItems: "start",
            overflowX: "auto",
            maxWidth: "100%",
            pb: "8px",
          }}
        >
          {columns.map((column) => (
            <Box
              key={column.id}
              data-column-id={column.id}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(column.id);
              }}
              onDragLeave={() => setOver((current) => (current === column.id ? "" : current))}
              onDrop={(event) => {
                event.preventDefault();
                setOver("");
                if (dragging && dragging.stageId !== column.id) openMove(dragging, column.id);
                setDragging(null);
              }}
              sx={{
                minWidth: 0,
                minHeight: 400,
                borderRadius: "14px",
                p: "12px",
                bgcolor: over === column.id ? "surface.primarySoftBg" : "surface.inset",
                border: "1px solid",
                borderColor:
                  over === column.id
                    ? "surface.primarySoftBorder"
                    : column.overWip
                      ? "surface.warningSoftBorder"
                      : "divider",
                transition: "border-color .15s",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: "2px 4px 10px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "999px",
                      flex: "none",
                      bgcolor:
                        column.id === CLOSED
                          ? "surface.textDisabled"
                          : column.kind === "hire"
                            ? "surface.successFg"
                            : "surface.accentBright",
                    }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {column.id === CLOSED ? t("closed") : column.name}
                  </Typography>
                  <Chip variant="soft" size="small" label={String(column.count)} />
                </Box>
                {column.overWip ? (
                  <Box sx={{ color: "surface.warningFg", display: "flex" }} title={t("wip")}>
                    <IconRenderer name="warning" size={15} />
                  </Box>
                ) : null}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {column.cards.map((card) => (
                  <PipelineCard
                    key={card.id}
                    card={card}
                    labels={cardLabels(card)}
                    draggable={column.id !== CLOSED}
                    onOpen={() => router.push(config.candidateRouteId, { id: card.candidateId })}
                    onMove={column.id === CLOSED ? undefined : () => openMove(card)}
                    onDragStart={() => setDragging(card)}
                    onDragEnd={() => setDragging(null)}
                  />
                ))}

                {column.cards.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "7px",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: "12px",
                      p: "26px 14px",
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {t("empty.title", {
                        stage: column.id === CLOSED ? t("closed") : column.name,
                      })}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                      {t("empty.hint")}
                    </Typography>
                  </Box>
                ) : null}
              </Box>

              {column.id !== CLOSED && column.count ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "8px",
                    mt: "11px",
                    pt: "9px",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {[
                    { key: "avg", value: t("stats.days", { count: column.avgDays }) },
                    { key: "oldest", value: t("stats.days", { count: column.oldestDays }) },
                    {
                      key: "capacity",
                      value: column.wipLimit ? `${column.count}/${column.wipLimit}` : "—",
                    },
                  ].map((stat) => (
                    <Box key={stat.key}>
                      <Typography
                        sx={{
                          fontSize: 9.5,
                          letterSpacing: ".05em",
                          fontWeight: 700,
                          color: "text.disabled",
                        }}
                      >
                        {t(`stats.${stat.key}`)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          mt: "1px",
                          color:
                            stat.key === "capacity" && column.overWip
                              ? "surface.warningFg"
                              : "text.secondary",
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>
      )}

      {/* The move dialog is the shared form modal: the schema decides what is
          asked for, including that a rejection cannot save without a reason. */}
      {moveModal.data ? (
        <FormModal
          key={`${moveModal.data.card.id}-${moveModal.data.toId}`}
          open={moveModal.isOpen}
          onClose={moveModal.close}
          width={470}
          id={id}
          title={t("move.title")}
          description={`${moveModal.data.card.candidateName} · ${moveModal.data.card.jobTitle ?? ""}`}
          schema={config.moveSchema}
          defaultValues={{
            outcome: moveModal.data.rejecting ? "reject" : "move",
            toStageId: moveModal.data.rejecting ? "" : moveModal.data.toId,
            reasonId: "",
            note: "",
          }}
          submitLabel="move.confirm"
          cancelLabel="move.cancel"
          // The dialog stays open when a guard refuses, so the warning is read
          // where the decision is being made.
          closeOnSubmit={false}
          onSubmit={(values) => submitMove(values)}
          beforeSubmit={
            blocked ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  bgcolor: "surface.warningSoftBg",
                  border: "1px solid",
                  borderColor: "surface.warningSoftBorder",
                  borderRadius: "10px",
                  p: "9px 12px",
                  mb: "12px",
                }}
              >
                <Box sx={{ color: "surface.warningFg", display: "flex", flex: "none" }}>
                  <IconRenderer name="warning" size={15} />
                </Box>
                <Typography sx={{ flex: 1, fontSize: 11.5, color: "surface.warningFg" }}>
                  {blocked.message}
                </Typography>
                {blocked.code === "hired-elsewhere" && pending ? (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ flex: "none" }}
                    onClick={() => void submitMove(pending, true)}
                  >
                    {t("move.anyway")}
                  </Button>
                ) : null}
              </Box>
            ) : null
          }
        />
      ) : null}
    </Box>
  );
}
