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
  avatarSwatch,
  fetchOptions,
  IconRenderer,
  initialsOf,
  Modal,
  SearchField,
  type SelectOption,
  SlidingPillTabs,
  useModal,
  useToast,
} from "@recruit/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PipelineBoardConfiguration } from "./pipeline-board.configuration";

const CLOSED = "__closed__";

interface BoardCard {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  matchScore: number;
  offLimits: boolean;
  doNotContact: boolean;
  jobId: string;
  jobTitle: string;
  clientName: string;
  stageId: string;
  stageName: string;
  status: string;
  ownerId: string;
  ownerName: string;
  rejectionReason: string;
  daysInStage: number;
  slaDays: number;
  slaOverBy: number;
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

interface Reason {
  id: string;
  label: string;
  category: string;
}

interface Move {
  card: BoardCard;
  toId: string;
  toName: string;
  /** Set when the target is the closed column — the reason becomes required. */
  rejecting: boolean;
}

/**
 * The pipeline board. Columns are the workspace's own stages, so a rename or a
 * reorder in Settings moves the board with it; the closed-out column is drawn
 * last and is not a stage. Every drop goes through the move dialog, because
 * the note and (on a rejection) the reason are part of the record.
 */
export function PipelineBoardComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PipelineBoardConfiguration>(id);
  const router = usePortalRouter();
  const { show } = useToast();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ownerId, setOwnerId] = useState("");
  const [focus, setFocus] = useState(false);
  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [over, setOver] = useState("");
  const [options, setOptions] = useState<Record<string, SelectOption[]>>({});
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [reasonId, setReasonId] = useState("");
  const [note, setNote] = useState("");
  const [blocked, setBlocked] = useState<{ message: string; code: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const moveModal = useModal<Move>();

  const { data, isLoading, mutate, mutation } = useFetch<Board>(id, {
    filters: { ...filters, ownerId, search, wipLimit: String(config?.wipLimit ?? 0) },
  });
  const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;

  // Filter options and the rejection catalogue are workspace data, fetched
  // once rather than per render.
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
    (mutation as Record<string, (() => Promise<unknown>) | undefined>)
      .rejectionReasons?.()
      .then((list) => setReasons((list as Reason[]) ?? []))
      .catch(() => undefined);
  }, [config?.filters, mutation]);

  const columns = useMemo(() => {
    const list = data?.columns ?? [];
    if (!focus) return list;
    // "Needs action" — anything past its stage SLA, or with a flag on it.
    return list.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.slaOverBy > 0 || card.offLimits),
    }));
  }, [data?.columns, focus]);

  const openMove = useCallback(
    (card: BoardCard, toId: string, toName: string) => {
      setReasonId("");
      setNote("");
      setBlocked(null);
      moveModal.open({ card, toId, toName, rejecting: toId === CLOSED });
    },
    [moveModal],
  );

  const confirm = async (force?: boolean) => {
    const move = moveModal.data;
    if (!move) return;
    setSaving(true);
    setBlocked(null);
    try {
      await mut.move?.({
        id: move.card.id,
        ...(move.rejecting
          ? { status: "rejected", reasonId }
          : { toStageId: move.toId, status: "active" }),
        note,
        force,
      });
      moveModal.close();
      await mutate();
      show(
        t(move.rejecting ? "toast.rejected" : "toast.moved", {
          name: move.card.candidateName,
          stage: move.toName,
        }),
        t("toast.sub", { from: move.card.stageName }),
        move.rejecting ? "warning" : "success",
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
    } finally {
      setSaving(false);
    }
  };

  if (!config?.filters) return null;

  const activeFilters = Object.values(filters).filter(Boolean).length + (ownerId ? 1 : 0);

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
          variant={ownerId ? "soft" : "soft"}
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
                  {` — ${t("sla.reason", { days: breach.daysInStage, stage: breach.stageName, over: breach.slaOverBy })}`}
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
            <Skeleton key={column} variant="rounded" height={380} sx={{ flex: 1 }} />
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
                if (dragging && dragging.stageId !== column.id) {
                  openMove(dragging, column.id, column.name);
                }
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
                  <Box
                    key={card.id}
                    data-card-id={card.id}
                    data-card-name={card.candidateName}
                    draggable={column.id !== CLOSED}
                    onDragStart={() => setDragging(card)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => router.push(config.candidateRouteId, { id: card.candidateId })}
                    sx={{
                      bgcolor: "surface.elevated",
                      border: "1px solid",
                      borderColor: card.slaOverBy ? "surface.warningSoftBorder" : "divider",
                      borderRadius: "12px",
                      p: "13px 14px",
                      cursor: column.id === CLOSED ? "pointer" : "grab",
                      "&:hover": { borderColor: "surface.primarySoftBorder" },
                    }}
                  >
                    {card.offLimits || card.doNotContact ? (
                      <Box sx={{ display: "flex", gap: "6px", mb: "9px" }}>
                        {card.offLimits ? (
                          <Chip
                            variant="soft"
                            color="error"
                            size="small"
                            label={t("flags.offLimits")}
                          />
                        ) : null}
                        {card.doNotContact ? (
                          <Chip
                            variant="soft"
                            color="warning"
                            size="small"
                            label={t("flags.doNotContact")}
                          />
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
                          bgcolor: avatarSwatch(card.candidateName).bg,
                          color: avatarSwatch(card.candidateName).fg,
                        }}
                      >
                        {initialsOf(card.candidateName)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {card.candidateName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "text.secondary",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {card.jobTitle}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "text.disabled",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {card.clientName}
                        </Typography>
                      </Box>
                      {column.id === CLOSED ? null : (
                        <Box
                          component="button"
                          type="button"
                          aria-label={t("card.move", { name: card.candidateName })}
                          onClick={(event) => {
                            event.stopPropagation();
                            openMove(card, "", "");
                          }}
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
                      )}
                    </Box>

                    {card.matchScore ? (
                      <Box sx={{ display: "flex", pb: "9px" }}>
                        <Chip
                          variant="soft"
                          size="small"
                          color="primary"
                          label={t("card.match", { score: card.matchScore })}
                        />
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
                        borderTop: "1px solid",
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
                          color: card.slaOverBy ? "surface.errorFg" : "text.disabled",
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "999px",
                            flex: "none",
                            bgcolor: card.slaOverBy ? "surface.errorFg" : "surface.textDisabled",
                          }}
                        />
                        {card.slaOverBy
                          ? t("card.overSla", { count: card.slaOverBy })
                          : t("card.inStage", { count: card.daysInStage })}
                      </Box>
                      <Box sx={{ flex: 1 }} />
                      {card.ownerName ? (
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
                            bgcolor: avatarSwatch(card.ownerName).bg,
                            color: avatarSwatch(card.ownerName).fg,
                          }}
                        >
                          {initialsOf(card.ownerName)}
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
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

      {/* The move dialog — where the note, and a rejection's reason, are captured. */}
      <Modal
        open={moveModal.isOpen}
        onClose={moveModal.close}
        width={470}
        title={t("move.title")}
        description={
          moveModal.data
            ? `${moveModal.data.card.candidateName} · ${moveModal.data.card.jobTitle}`
            : ""
        }
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "20px" }}>
            <Button variant="outlined" onClick={moveModal.close} disabled={saving}>
              {t("move.cancel")}
            </Button>
            {blocked?.code === "hired-elsewhere" ? (
              <Button variant="outlined" onClick={() => confirm(true)} loading={saving}>
                {t("move.anyway")}
              </Button>
            ) : null}
            <Button
              variant="contained"
              loading={saving}
              disabled={!moveModal.data?.toId || (moveModal.data?.rejecting ? !reasonId : false)}
              onClick={() => confirm()}
              startIcon={<IconRenderer name="check" size={15} />}
            >
              {moveModal.data?.rejecting
                ? t("move.reject")
                : t("move.confirm", { stage: moveModal.data?.toName ?? "" })}
            </Button>
          </Box>
        }
      >
        {moveModal.data ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <Chip variant="soft" size="small" label={moveModal.data.card.stageName} />
              <Box sx={{ color: "surface.accentBright", display: "flex" }}>
                <IconRenderer name="arrow-forward" size={16} />
              </Box>
              {moveModal.data.toId ? (
                <Chip
                  variant="soft"
                  color="primary"
                  size="small"
                  label={moveModal.data.rejecting ? t("move.rejected") : moveModal.data.toName}
                />
              ) : (
                <TextField
                  select
                  hiddenLabel
                  size="small"
                  sx={{ minWidth: 200 }}
                  value=""
                  onChange={(event) => {
                    const target = event.target.value;
                    const column = (data?.columns ?? []).find((entry) => entry.id === target);
                    moveModal.open({
                      card: moveModal.data?.card as BoardCard,
                      toId: target,
                      toName: column?.name ?? "",
                      rejecting: target === CLOSED,
                    });
                  }}
                >
                  <MenuItem value="">{t("move.pick")}</MenuItem>
                  {(data?.columns ?? [])
                    .filter((entry) => entry.id !== moveModal.data?.card.stageId)
                    .map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.id === CLOSED ? t("move.rejected") : entry.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            </Box>

            {moveModal.data.rejecting ? (
              <TextField
                select
                hiddenLabel
                size="small"
                fullWidth
                value={reasonId}
                onChange={(event) => setReasonId(event.target.value)}
                helperText={t("move.reasonHelp")}
              >
                <MenuItem value="">{t("move.reasonPlaceholder")}</MenuItem>
                {reasons.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            <TextField
              hiddenLabel
              multiline
              minRows={3}
              fullWidth
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("move.notePlaceholder")}
              helperText={t("move.noteHelp")}
            />

            {blocked ? (
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
                }}
              >
                <Box sx={{ color: "surface.warningFg", display: "flex", flex: "none" }}>
                  <IconRenderer name="warning" size={15} />
                </Box>
                <Typography sx={{ fontSize: 11.5, color: "surface.warningFg" }}>
                  {blocked.message}
                </Typography>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Modal>
    </Box>
  );
}
