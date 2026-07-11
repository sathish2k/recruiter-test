"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ArrowUpwardRounded from "@mui/icons-material/ArrowUpwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import SearchOffRounded from "@mui/icons-material/SearchOffRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@recruit/ui";
import { type ReactNode, useState } from "react";

function Section({
  title,
  span,
  children,
}: {
  title: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ gridColumn: span ? { md: "1 / -1" } : undefined }}>
      <Card>
        <Typography variant="subtitle1" sx={{ mb: 1.75 }}>
          {title}
        </Typography>
        {children}
      </Card>
    </Box>
  );
}

const ratingDots = [1, 2, 3, 4, 5];

export default function UiShowcasePage() {
  const [tab, setTab] = useState("today");
  const [rating, setRating] = useState(3);
  const [confirm, setConfirm] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline
        sx={{
          bgcolor: "background.default",
          borderRadius: 3,
          p: { xs: 2, md: 3.5 },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Component library
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            The Troy design system — <b>plain MUI</b>, restyled entirely by the{" "}
            <code>@recruit/ui</code> theme. No wrapper components: every look is
            a theme override or a custom <code>variant</code>.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Section title="01 · Buttons">
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              <Button variant="contained">Primary</Button>
              <Button variant="outlined">Outline</Button>
              <Button variant="text">Ghost</Button>
              <Button variant="contained" color="error">
                Destructive
              </Button>
              <Button variant="contained" disabled>
                Disabled
              </Button>
              <Button variant="contained" startIcon={<AutoAwesomeRounded />}>
                With icon
              </Button>
              <Button
                variant="contained"
                loading
                loadingPosition="start"
                startIcon={<AutoAwesomeRounded />}
              >
                Saving…
              </Button>
              <IconButton
                size="small"
                sx={{ border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <MoreHorizRounded fontSize="small" />
              </IconButton>
              <Button variant="outlined" size="small">
                Small
              </Button>
            </Stack>
          </Section>

          <Section title="02 · Status chips & badges">
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}
            >
              <Chip
                variant="soft"
                color="success"
                label="Active"
                size="small"
              />
              <Chip
                variant="soft"
                color="warning"
                label="Pending"
                size="small"
              />
              <Chip
                variant="soft"
                color="primary"
                label="Interviewing"
                size="small"
              />
              <Chip variant="soft" color="error" label="Overdue" size="small" />
              <Chip
                variant="soft"
                color="info"
                label="Lead view"
                size="small"
              />
              <Chip
                variant="soft"
                color="default"
                label="Closed"
                size="small"
              />
              <Chip
                variant="soft"
                color="primary"
                icon={<AutoAwesomeRounded sx={{ fontSize: 13 }} />}
                label="AI 94%"
                size="small"
              />
              <Badge badgeContent={3} color="primary">
                <Box
                  sx={{ px: 1, py: 0.5, color: "text.secondary", fontSize: 12 }}
                >
                  Inbox
                </Box>
              </Badge>
              <Badge color="primary" variant="dot" overlap="circular">
                <IconButton
                  size="small"
                  sx={{ border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <NotificationsRounded fontSize="small" />
                </IconButton>
              </Badge>
            </Stack>
          </Section>

          <Section title="03 · Form controls" span>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Text input"
                  placeholder="Default state"
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Error state"
                  defaultValue="not-an-email"
                  error
                  helperText="Enter a valid work email"
                  size="small"
                  fullWidth
                />
                <Box>
                  <InputLabel sx={{ fontSize: 12, mb: 0.5 }}>Select</InputLabel>
                  <Select size="small" defaultValue="nortech" fullWidth>
                    <MenuItem value="nortech">Nortech</MenuItem>
                    <MenuItem value="acme">Acme</MenuItem>
                  </Select>
                </Box>
              </Stack>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Toggle"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Checkbox"
                />
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Slider — threshold
                  </Typography>
                  <Slider defaultValue={80} min={50} max={95} />
                </Box>
              </Stack>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Rating dots
                  </Typography>
                  <Stack direction="row" spacing={0.75}>
                    {ratingDots.map((n) => {
                      const on = n <= rating;
                      return (
                        <Box
                          key={n}
                          component="button"
                          type="button"
                          onClick={() => setRating(n)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            border: `1px solid ${on ? "rgba(242,106,27,0.6)" : "rgba(255,255,255,0.14)"}`,
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            color: on ? "#fff" : "text.disabled",
                            background: on
                              ? "linear-gradient(135deg,#FF8A3C,#E4560F)"
                              : "#141413",
                          }}
                        >
                          {n}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Removable chips
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip
                      variant="soft"
                      color="default"
                      label="Go"
                      size="small"
                      onDelete={() => {}}
                    />
                    <Chip
                      variant="soft"
                      color="default"
                      label="PostgreSQL"
                      size="small"
                      onDelete={() => {}}
                    />
                  </Stack>
                </Box>
                <TextField placeholder="Search…" size="small" fullWidth />
              </Stack>
            </Box>
          </Section>

          <Section title="04 · Avatars">
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: "#3A5B4A", fontSize: 12 }}
              >
                MJ
              </Avatar>
              <AvatarGroup
                max={4}
                sx={{
                  "& .MuiAvatar-root": { width: 30, height: 30, fontSize: 11 },
                }}
              >
                <Avatar sx={{ bgcolor: "#3A4A5B" }}>DS</Avatar>
                <Avatar sx={{ bgcolor: "#3A5B4A" }}>MJ</Avatar>
                <Avatar sx={{ bgcolor: "#5B4A3A" }}>RK</Avatar>
                <Avatar>+2</Avatar>
              </AvatarGroup>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      bgcolor: "#4EA874",
                      border: "2px solid #1C1C1B",
                    }}
                  />
                }
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#3A4A5B",
                    fontSize: 11,
                  }}
                >
                  DS
                </Avatar>
              </Badge>
            </Stack>
          </Section>

          <Section title="05 · Progress & data viz" span>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Linear · 68%
                </Typography>
                <LinearProgress variant="determinate" value={68} />
                <Typography variant="body2" sx={{ mt: 2, mb: 0.5 }}>
                  Distribution
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: "4px",
                    height: 9,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "26%",
                      background: "linear-gradient(90deg,#FF8A3C,#E4560F)",
                    }}
                  />
                  <Box sx={{ width: "31%", background: "#D98E5A" }} />
                  <Box sx={{ width: "27%", background: "#B9A18C" }} />
                  <Box sx={{ width: "16%", background: "#F5F3F0" }} />
                </Box>
              </Box>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <CircularProgress variant="determinate" value={94} size={56} />
                <Typography variant="body2">94% AI match</Typography>
              </Stack>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Funnel row · 79%
                </Typography>
                <Card
                  variant="inset"
                  sx={{ p: 0, height: 22, overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: "79%",
                      background:
                        "linear-gradient(90deg,rgba(242,106,27,.65),rgba(242,106,27,.35))",
                    }}
                  />
                </Card>
              </Box>
            </Box>
          </Section>

          <Section title="06 · Overlays & feedback">
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => setConfirm(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                Open confirmation
              </Button>
              <Alert
                severity="success"
                action={
                  <Button color="inherit" size="small">
                    View
                  </Button>
                }
              >
                <AlertTitle sx={{ fontSize: 13, mb: 0 }}>
                  CV submitted to Nortech
                </AlertTitle>
                Noor Haddad · Senior Backend Engineer
              </Alert>
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small">
                    Retry
                  </Button>
                }
              >
                <AlertTitle sx={{ fontSize: 13, mb: 0 }}>
                  Couldn’t send the invite
                </AlertTitle>
                LinkedIn rate limit — retrying in 5 min
              </Alert>
              <Card sx={{ p: 0.75, width: 210 }}>
                <Typography
                  variant="overline"
                  sx={{ display: "block", px: 1.5, pt: 0.5 }}
                >
                  Dropdown menu
                </Typography>
                {[
                  {
                    icon: <EditRounded sx={{ fontSize: 15 }} />,
                    label: "Edit",
                  },
                  {
                    icon: <ContentCopyRounded sx={{ fontSize: 15 }} />,
                    label: "Duplicate",
                  },
                ].map((m) => (
                  <Box
                    key={m.label}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      borderRadius: 1,
                      fontSize: 12.5,
                      color: "text.secondary",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                    }}
                  >
                    {m.icon} {m.label}
                  </Box>
                ))}
                <Box
                  sx={{
                    height: "1px",
                    bgcolor: "rgba(255,255,255,0.08)",
                    mx: 0.75,
                    my: 0.5,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    fontSize: 12.5,
                    color: "#E89A9A",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(200,80,80,0.12)" },
                  }}
                >
                  <DeleteRounded sx={{ fontSize: 15 }} /> Delete…
                </Box>
              </Card>
            </Stack>
          </Section>

          <Section title="07 · Alerts, empty & loading">
            <Stack spacing={1.5}>
              <Alert severity="info">
                Lead view — showing only your assigned roles
              </Alert>
              <Alert severity="warning">
                Approval rate dipped to 50% this week
              </Alert>
              <Box
                sx={{
                  border: "1px dashed rgba(255,255,255,0.14)",
                  borderRadius: "12px",
                  p: 2.5,
                  textAlign: "center",
                }}
              >
                <SearchOffRounded sx={{ color: "text.disabled" }} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, mt: 0.5 }}>
                  No candidates match the filters
                </Typography>
                <Typography
                  sx={{ fontSize: 11.5, color: "text.disabled", mt: 0.25 }}
                >
                  Try clearing a filter, or add a candidate
                </Typography>
              </Box>
              <Stack spacing={0.75}>
                <Skeleton variant="rounded" width="64%" height={13} />
                <Skeleton variant="rounded" width="88%" height={13} />
                <Skeleton variant="rounded" width="45%" height={13} />
              </Stack>
            </Stack>
          </Section>

          <Section title="08 · Navigation">
            <Stack spacing={2}>
              <Stack spacing={0.5} sx={{ width: 220 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.25,
                    fontSize: 13,
                    fontWeight: 600,
                    background:
                      "linear-gradient(90deg,rgba(242,106,27,.28),rgba(242,106,27,.05))",
                    border: "1px solid rgba(242,106,27,.35)",
                  }}
                >
                  <SpaceDashboardRounded sx={{ fontSize: 16 }} /> Active item
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.25,
                    fontSize: 13,
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "text.primary",
                    },
                  }}
                >
                  <GroupRounded sx={{ fontSize: 16 }} /> Default item
                </Box>
              </Stack>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab value="today" label="Today (4)" />
                <Tab value="week" label="This week" />
                <Tab value="past" label="Past" />
              </Tabs>
              <Pagination count={5} defaultPage={1} shape="rounded" />
            </Stack>
          </Section>

          <Section title="09 · Table & stage stepper" span>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.primary",
                      }}
                    >
                      Candidate{" "}
                      <ArrowUpwardRounded
                        sx={{ fontSize: 13, color: "primary.light" }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>AI Match</TableCell>
                  <TableCell>Stage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "#4A3A5B",
                          fontSize: 10,
                        }}
                      >
                        SN
                      </Avatar>
                      Savannah Nguyen
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                    94%
                  </TableCell>
                  <TableCell>
                    <Chip
                      variant="soft"
                      color="primary"
                      label="Submitted"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "#3A5B4A",
                          fontSize: 10,
                        }}
                      >
                        MJ
                      </Avatar>
                      Marcus Johnson
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                    88%
                  </TableCell>
                  <TableCell>
                    <Chip
                      variant="soft"
                      color="success"
                      label="Active"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Box sx={{ mt: 3, maxWidth: 480 }}>
              <Stepper activeStep={2} alternativeLabel>
                {["Invited", "CV", "Submitted", "Interview"].map((s) => (
                  <Step key={s}>
                    <StepLabel>{s}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Section>

          <Section title="10 · Cards & surfaces" span>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              <Card>
                <Typography variant="subtitle1">Base card</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Default surface — every panel.
                </Typography>
                <Card variant="inset" sx={{ mt: 1.5 }}>
                  <Typography variant="body2">Inset well #141413</Typography>
                </Card>
              </Card>
              <Card variant="interactive">
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="subtitle1">Interactive</Typography>
                  <ArrowForwardRounded
                    sx={{ fontSize: 16, color: "primary.light" }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Hover: orange border + lift.
                </Typography>
              </Card>
              <Card variant="accent">
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center" }}
                >
                  <AutoAwesomeRounded sx={{ fontSize: 15, color: "#FFD9BC" }} />
                  <Typography variant="subtitle1">Accent card</Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5, color: "#E8C4A6" }}>
                  One highlighted thing per view.
                </Typography>
              </Card>
              <Card variant="feature">
                <Typography variant="overline">Feature card</Typography>
                <Typography variant="subtitle1">Radial glow header</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Hero moments — next interview.
                </Typography>
              </Card>
              <Card variant="ghost">
                <AddRounded sx={{ color: "text.disabled" }} />
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: "text.primary" }}
                >
                  Ghost / add card
                </Typography>
              </Card>
            </Box>
          </Section>
        </Box>

        <Dialog open={confirm} onClose={() => setConfirm(false)}>
          <Box sx={{ p: "24px 26px", width: 400, maxWidth: "100%" }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", mb: 1.5 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "rgba(200,80,80,0.14)",
                  border: "1px solid rgba(200,80,80,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DeleteRounded sx={{ color: "#E89A9A", fontSize: 19 }} />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                Close this job?
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "text.secondary",
                mb: 2.5,
              }}
            >
              “Senior Backend Engineer · Nortech” will stop accepting
              applicants. The pipeline stays archived. This can be undone for 30
              days.
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "flex-end" }}
            >
              <Button variant="outlined" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirm(false)}
              >
                Close job
              </Button>
            </Stack>
          </Box>
        </Dialog>
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}
