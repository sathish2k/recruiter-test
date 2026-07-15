"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  IconRenderer,
  StatCardRenderer,
  TableRenderer,
  Toast,
  useToast,
} from "@recruit/shared";
import { useState } from "react";
import type { InterviewsConfig } from "./interviews.configuration";

interface TodayRow {
  id: string;
  time: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
  round: string;
  with: string;
  joinable: boolean;
}

interface PastRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  meta: string;
  note: string;
  badge: string;
}

interface NeedsSchedulingRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
}

interface FeedbackRow {
  id: string;
  title: string;
  sub: string;
  chip: string;
}

interface InterviewsData {
  kpis: { today: number; thisWeek: number; upcoming: number; passed: number };
  today: TodayRow[];
  upcoming: Record<string, unknown>[];
  past: PastRow[];
  needsScheduling: NeedsSchedulingRow[];
  feedbackPending: FeedbackRow[];
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

function Avatar({
  initials,
  bg,
  fg,
  size = 38,
}: {
  initials: string;
  bg: string;
  fg: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "999px",
        bgcolor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size < 34 ? 11 : 12.5,
        fontWeight: 600,
        flex: "none",
      }}
    >
      {initials}
    </Box>
  );
}

function TodayTimeline({
  rows,
  t,
  onJoin,
}: {
  rows: TodayRow[];
  t: Translate;
  onJoin: (name: string) => void;
}) {
  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "14px" }}>
        {t("today.title")}
      </Typography>
      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          {t("today.empty")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rows.map((row) => (
            <Box key={row.id} sx={{ display: "flex", gap: "16px" }}>
              <Typography
                sx={{
                  width: 64,
                  flex: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: row.joinable ? "#FFD9BC" : "text.secondary",
                }}
              >
                {row.time}
              </Typography>
              <Card
                variant={row.joinable ? "accent" : "inset"}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                }}
              >
                <Avatar
                  initials={row.initials}
                  bg={row.avatarBg}
                  fg={row.avatarFg}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }} noWrap>
                      {row.name}
                    </Typography>
                    <Chip variant="soft" color="primary" label={row.round} />
                  </Box>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", mt: "3px" }}
                    noWrap
                  >
                    {row.roleClient} · {t("today.withPrefix")} {row.with}
                  </Typography>
                </Box>
                {row.joinable ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onJoin(row.name)}
                    sx={{ fontSize: 12 }}
                  >
                    {t("today.join")}
                  </Button>
                ) : null}
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}

function PastList({ rows, t }: { rows: PastRow[]; t: Translate }) {
  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "14px" }}>
        {t("past.title")}
      </Typography>
      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          {t("past.empty")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {rows.map((row) => (
            <Box
              key={row.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                py: "12px",
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Avatar
                initials={row.initials}
                bg={row.avatarBg}
                fg={row.avatarFg}
                size={30}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                  {row.name}
                </Typography>
                <Typography
                  sx={{ fontSize: 11.5, color: "text.secondary" }}
                  noWrap
                >
                  {row.meta} · {row.note}
                </Typography>
              </Box>
              <Chip variant="soft" color="success" label={row.badge} />
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}

function NeedsScheduling({
  rows,
  t,
  onCall,
}: {
  rows: NeedsSchedulingRow[];
  t: Translate;
  onCall: (name: string) => void;
}) {
  return (
    <Card variant="highlight">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          mb: "4px",
        }}
      >
        <IconRenderer name="call" size={17} color="#FF9D57" />
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          {t("needsScheduling.title")}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: "12px" }}>
        {t("needsScheduling.subtitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {rows.map((row) => (
          <Card
            key={row.id}
            variant="inset"
            sx={{ display: "flex", alignItems: "center", gap: "11px" }}
          >
            <Avatar
              initials={row.initials}
              bg={row.avatarBg}
              fg={row.avatarFg}
              size={32}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                {row.name}
              </Typography>
              <Typography
                sx={{ fontSize: 11.5, color: "text.disabled" }}
                noWrap
              >
                {row.roleClient}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => onCall(row.name)}
              sx={{ fontSize: 11.5, px: "16px", py: "6px" }}
            >
              {t("needsScheduling.call")}
            </Button>
          </Card>
        ))}
      </Box>
    </Card>
  );
}

function CalendarSync({
  gcal,
  outlook,
  onToggle,
  t,
}: {
  gcal: boolean;
  outlook: boolean;
  onToggle: (which: "gcal" | "outlook") => void;
  t: Translate;
}) {
  const item = (
    which: "gcal" | "outlook",
    letter: string,
    label: string,
    connected: boolean,
  ) => (
    <Card
      variant="inset"
      onClick={() => onToggle(which)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
      }}
    >
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: "7px",
          bgcolor: "rgba(255,255,255,.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {letter}
      </Box>
      <Typography sx={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: connected ? "#8FD6AC" : "#F0B27C",
        }}
      >
        {connected ? t("calendarSync.connected") : t("calendarSync.connect")}
      </Typography>
    </Card>
  );
  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "12px" }}>
        {t("calendarSync.title")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {item("gcal", "G", t("calendarSync.google"), gcal)}
        {item("outlook", "O", t("calendarSync.outlook"), outlook)}
      </Box>
      <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "10px" }}>
        {t("calendarSync.hint")}
      </Typography>
    </Card>
  );
}

function FeedbackPending({
  rows,
  t,
  onOpen,
}: {
  rows: FeedbackRow[];
  t: Translate;
  onOpen: (title: string) => void;
}) {
  return (
    <Card variant="base" sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
        {t("feedback.title")}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.disabled", mb: "12px" }}>
        {t("feedback.subtitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            onClick={() => onOpen(row.title)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              p: "10px 12px",
              mx: "-12px",
              borderRadius: "11px",
              cursor: "pointer",
              "&:hover": { background: "rgba(255,255,255,.05)" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} noWrap>
                {row.title}
              </Typography>
              <Typography
                sx={{ fontSize: 11.5, color: "text.disabled" }}
                noWrap
              >
                {row.sub}
              </Typography>
            </Box>
            <Chip variant="soft" color="warning" label={row.chip} />
          </Box>
        ))}
      </Box>
    </Card>
  );
}

export function InterviewsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<InterviewsConfig>(id);
  const { toast, show, clear } = useToast();
  const { data } = useFetch<InterviewsData>(id);

  const [view, setView] = useState<"today" | "week" | "past">("today");
  const [gcal, setGcal] = useState(true);
  const [outlook, setOutlook] = useState(false);

  if (!data) return null;

  const toggleCalendar = (which: "gcal" | "outlook") => {
    if (which === "gcal") {
      setGcal((prev) => !prev);
      show(t("toast.gcalTitle"), t("toast.gcalSub"));
    } else {
      setOutlook((prev) => !prev);
      show(t("toast.outlookTitle"), t("toast.outlookSub"));
    }
  };

  return (
    <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Tabs
            value={view}
            onChange={(_, next) => setView(next)}
            aria-label={t("tabs.today")}
          >
            <Tab value="today" label={t("tabs.today")} />
            <Tab value="week" label={t("tabs.week")} />
            <Tab value="past" label={t("tabs.past")} />
          </Tabs>
          <Button
            variant="contained"
            onClick={() =>
              show(t("toast.scheduleTitle"), t("toast.scheduleSub"))
            }
            startIcon={<IconRenderer name="add" size={15} />}
          >
            {t("schedule")}
          </Button>
        </Box>

        <StatCardRenderer
          id={id}
          config={config.kpiCards}
          data={data.kpis as unknown as Record<string, unknown>}
          gap="16px"
        />

        {view === "today" ? (
          <TodayTimeline
            rows={data.today}
            t={t}
            onJoin={(name) =>
              show(t("toast.joinTitle"), t("toast.joinSub", { name }))
            }
          />
        ) : null}
        {view === "week" ? (
          <Card variant="base">
            <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "14px" }}>
              {t("upcoming.title")}
            </Typography>
            <TableRenderer
              id={id}
              config={config.upcoming}
              data={data.upcoming}
            />
          </Card>
        ) : null}
        {view === "past" ? <PastList rows={data.past} t={t} /> : null}
      </Box>

      <Box
        sx={{
          width: 350,
          flex: "0 0 350px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <NeedsScheduling
          rows={data.needsScheduling}
          t={t}
          onCall={(name) =>
            show(t("toast.callTitle"), t("toast.callSub", { name }))
          }
        />
        <CalendarSync
          gcal={gcal}
          outlook={outlook}
          onToggle={toggleCalendar}
          t={t}
        />
        <FeedbackPending
          rows={data.feedbackPending}
          t={t}
          onOpen={(title) =>
            show(t("toast.feedbackTitle"), t("toast.feedbackSub", { title }))
          }
        />
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
