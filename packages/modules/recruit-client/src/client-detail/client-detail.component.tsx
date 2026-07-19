"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import {
  FormModal,
  type FormValues,
  IconRenderer,
  LinkRenderer,
  Modal,
  StatCardRenderer,
  TableRenderer,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import { type MouseEvent, type ReactNode, useState } from "react";
import type { ClientDetailConfig } from "./client-detail.configuration";

interface Submission {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  score: number;
  role: string;
  submittedWhen: string;
  sourcer: string;
  decision: "pending" | "approved" | "rejected";
  reason: string;
}

interface Contact {
  name: string;
  role: string;
  email: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

interface Agreement {
  feeModel: string;
  guarantee: string;
  paymentTerms: string;
  renews: string;
  contractFile: string;
  signedDate: string;
}

interface ActivityEntry {
  icon: string;
  text: string;
  when: string;
  tone: string;
}

interface RoleRow {
  id: string;
  title: string;
  meta: string;
  empName: string;
  empInitials: string;
  empBg: string;
  empFg: string;
  leadName: string;
  pipeline: number;
  submitted: number;
  status: string;
}

interface ClientDetail {
  id: string;
  name: string;
  industry: string;
  manager: string;
  status: "hiring" | "paused";
  since: string;
  initial: string;
  primaryContact: string;
  placementFee: string;
  kpis: {
    openRoles: number;
    pipeline: number;
    awaiting: number;
    hires: number;
    avgTimeToHire: number;
  };
  submissions: Submission[];
  roles: RoleRow[];
  contacts: Contact[];
  agreement: Agreement;
  activity: ActivityEntry[];
}

const STATUS_TONE: Record<string, { fg: string; bg: string; border: string }> =
  {
    hiring: {
      fg: "#8FD6AC",
      bg: "rgba(78,168,116,.14)",
      border: "rgba(78,168,116,.35)",
    },
    paused: {
      fg: "#F0C27C",
      bg: "rgba(214,155,60,.14)",
      border: "rgba(214,155,60,.35)",
    },
  };

function RailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="base" sx={{ p: "20px" }}>
      <Typography sx={{ fontSize: 14.5, fontWeight: 600, mb: "14px" }}>
        {title}
      </Typography>
      {children}
    </Card>
  );
}

export function ClientDetailComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientDetailConfig>(id);
  const router = usePortalRouter();
  const { id: clientId } = useRouteParams();
  const { toast, show, clear } = useToast();
  const { data, mutation, mutate } = useFetch<ClientDetail>(id, {
    filters: { id: clientId },
  });

  const editModal = useModal();
  const deleteModal = useModal();
  const reportModal = useModal();
  const rejectModal = useModal<Submission>();
  const [reason, setReason] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!config || !data) return null;
  const client = data;

  const decide = async (
    submission: Submission,
    decision: "approved" | "rejected",
    note = "",
  ) => {
    await mutation.decide?.(clientId, submission.id, {
      decision,
      reason: note,
    });
    await mutate();
    show(
      decision === "approved" ? t("toast.approved") : t("toast.rejected"),
      t("toast.decisionSub", { name: submission.name }),
    );
  };

  const confirmReject = async () => {
    const submission = rejectModal.data;
    if (!submission) return;
    await decide(submission, "rejected", reason);
    setReason("");
    rejectModal.close();
  };

  const updateClient = async (values: FormValues) => {
    await mutation.update?.(clientId, {
      ...values,
      status: String(values.status ?? "Hiring").toLowerCase(),
    });
    await mutate();
    show(t("toast.updated"), t("toast.updatedSub", { name: client.name }));
  };

  const deleteClient = async () => {
    await mutation.remove?.(clientId);
    deleteModal.close();
    show(t("toast.deleted"), t("toast.deletedSub", { name: client.name }));
    setTimeout(() => router.push(config.backRouteId), 1000);
  };

  const openMenu = (e: MouseEvent<HTMLElement>) =>
    setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const tone = STATUS_TONE[client.status] ?? STATUS_TONE.hiring;
  const pending = client.submissions.filter((s) => s.decision === "pending");

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 350px",
        gap: "24px",
        alignItems: "start",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <LinkRenderer config={{ id, routeId: config.backRouteId }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: 12.5,
              color: "text.secondary",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            <IconRenderer name="arrow-back" size={15} />
            {t("back")}
          </Box>
        </LinkRenderer>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                borderRadius: "15px",
                bgcolor: "#3A4A5B",
                color: "#CFE3F5",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {client.initial}
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-.01em",
                  }}
                >
                  {client.name}
                </Typography>
                <Box
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: tone.fg,
                    background: tone.bg,
                    border: `1px solid ${tone.border}`,
                    px: "10px",
                    py: "3px",
                    borderRadius: "999px",
                  }}
                >
                  {client.status === "hiring"
                    ? t("status.hiring")
                    : t("status.paused")}
                </Box>
              </Box>
              <Typography
                sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}
              >
                {[
                  client.industry,
                  t("since", { since: client.since || "—" }),
                  t("lead", { lead: client.manager || "—" }),
                ].join(" · ")}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
            <Button
              variant="outlined"
              onClick={() => reportModal.open()}
              startIcon={<IconRenderer name="bar-chart" size={16} />}
              sx={{ fontWeight: 400 }}
            >
              {t("actions.weeklyReport")}
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push(config.addJobRouteId)}
              startIcon={<IconRenderer name="add" size={16} />}
            >
              {t("actions.newRole")}
            </Button>
            <IconButton onClick={openMenu} sx={{ width: 38, height: 38 }}>
              <IconRenderer name="more-vert" size={18} />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  editModal.open();
                }}
              >
                {t("actions.edit")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  router.push(config.feesRouteId);
                }}
              >
                {t("actions.fees")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  deleteModal.open();
                }}
                sx={{ color: "#E89A9A" }}
              >
                {t("actions.delete")}
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <StatCardRenderer id={id} config={config.kpis} data={client.kpis} />

        <Card variant="base" sx={{ p: "22px 24px" }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "16px" }}>
            {t("submissions.title", { name: client.name })}
          </Typography>
          {pending.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
              {t("submissions.empty")}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pending.map((submission) => (
                <Box
                  key={submission.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "13px",
                    p: "12px 14px",
                    borderRadius: "13px",
                    border: "1px solid rgba(255,255,255,.06)",
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: submission.avatarBg,
                      color: submission.avatarFg,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {submission.initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                        {submission.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#FF9D57",
                          background: "rgba(242,106,27,.12)",
                          border: "1px solid rgba(242,106,27,.25)",
                          px: "8px",
                          py: "2px",
                          borderRadius: "999px",
                        }}
                      >
                        <IconRenderer
                          name="sparkle"
                          size={11}
                          color="#FF9D57"
                        />
                        {t("submissions.ai", { score: submission.score })}
                      </Box>
                    </Box>
                    <Typography
                      sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}
                    >
                      {t("submissions.meta", {
                        role: submission.role,
                        when: submission.submittedWhen,
                        sourcer: submission.sourcer,
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
                    <Button
                      onClick={() => decide(submission, "approved")}
                      startIcon={<IconRenderer name="check" size={15} />}
                      sx={{
                        color: "#8FD6AC",
                        background: "rgba(78,168,116,.14)",
                        border: "1px solid rgba(78,168,116,.35)",
                        fontWeight: 600,
                        "&:hover": { background: "rgba(78,168,116,.24)" },
                      }}
                    >
                      {t("submissions.approve")}
                    </Button>
                    <Button
                      onClick={() => {
                        setReason("");
                        rejectModal.open(submission);
                      }}
                      startIcon={<IconRenderer name="close" size={15} />}
                      sx={{
                        color: "#E89A9A",
                        background: "rgba(200,80,80,.12)",
                        border: "1px solid rgba(200,80,80,.4)",
                        fontWeight: 600,
                        "&:hover": { background: "rgba(200,80,80,.22)" },
                      }}
                    >
                      {t("submissions.reject")}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Card>

        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "12px" }}>
            {t("roles.title", { name: client.name })}
          </Typography>
          <TableRenderer
            id={id}
            config={config.rolesTable}
            data={client.roles as unknown as Record<string, unknown>[]}
            cells={{
              roleTitle: (row) => (
                <Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    {String(row.title)}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                    {String(row.meta)}
                  </Typography>
                </Box>
              ),
              employee: (row) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: String(row.empBg),
                      color: String(row.empFg),
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {String(row.empInitials)}
                  </Avatar>
                  <Typography sx={{ fontSize: 13 }}>
                    {String(row.empName)}
                  </Typography>
                </Box>
              ),
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <RailCard title={t("contacts.title")}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {client.contacts.map((contact) => (
              <Box
                key={contact.email || contact.name}
                sx={{ display: "flex", alignItems: "center", gap: "11px" }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: contact.avatarBg,
                    color: contact.avatarFg,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {contact.initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {contact.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                    {contact.role}
                  </Typography>
                </Box>
                <IconButton
                  edge="end"
                  href={`mailto:${contact.email}`}
                  sx={{ width: 30, height: 30 }}
                >
                  <IconRenderer name="mail" size={15} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </RailCard>

        <RailCard title={t("agreement.title")}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {[
              {
                label: t("agreement.feeModel"),
                value: client.agreement.feeModel,
              },
              {
                label: t("agreement.guarantee"),
                value: client.agreement.guarantee,
              },
              {
                label: t("agreement.paymentTerms"),
                value: client.agreement.paymentTerms,
              },
              { label: t("agreement.renews"), value: client.agreement.renews },
            ].map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  {row.label}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                  {row.value || "—"}
                </Typography>
              </Box>
            ))}
            {client.agreement.contractFile ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  mt: "4px",
                  p: "10px 12px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <IconRenderer name="pdf" size={18} color="#E89A9A" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                    {client.agreement.contractFile}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                    {t("agreement.signed", {
                      date: client.agreement.signedDate,
                    })}
                  </Typography>
                </Box>
                <IconButton edge="end" sx={{ width: 30, height: 30 }}>
                  <IconRenderer name="download" size={15} />
                </IconButton>
              </Box>
            ) : null}
          </Box>
        </RailCard>

        <RailCard title={t("activity.title")}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {client.activity.map((entry) => (
              <Box
                key={`${entry.text}-${entry.when}`}
                sx={{ display: "flex", gap: "11px" }}
              >
                <IconRenderer name={entry.icon} size={16} color="#9A968E" />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {entry.text}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                    {entry.when}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </RailCard>
      </Box>

      <FormModal
        open={editModal.isOpen}
        onClose={editModal.close}
        id={id}
        title={t("edit.title")}
        description={t("edit.description")}
        schema={config.editForm}
        defaultValues={{
          name: client.name,
          industry: client.industry,
          manager: client.manager,
          primaryContact: client.primaryContact,
          placementFee: client.placementFee,
          status: client.status === "paused" ? "Paused" : "Hiring",
        }}
        submitLabel="edit.submit"
        cancelLabel="cancel"
        onSubmit={updateClient}
      />

      <Modal
        open={rejectModal.isOpen}
        onClose={rejectModal.close}
        title={t("reject.title")}
        description={t("reject.description", {
          name: rejectModal.data?.name ?? "",
        })}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={rejectModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={confirmReject}
              sx={{
                background: "rgba(200,80,80,.2)",
                border: "1px solid rgba(200,80,80,.5)",
                color: "#E89A9A",
                fontWeight: 700,
              }}
            >
              {t("reject.confirm")}
            </Button>
          </Box>
        }
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          hiddenLabel
          placeholder={t("reject.placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: "18px" }}
        />
      </Modal>

      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title={t("delete.title", { name: client.name })}
        description={t("delete.body", {
          name: client.name,
          count: client.roles.length,
        })}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={deleteModal.close}
              sx={{ fontWeight: 400 }}
            >
              {t("delete.keep")}
            </Button>
            <Button
              onClick={deleteClient}
              sx={{
                background: "rgba(200,80,80,.9)",
                border: "1px solid rgba(200,80,80,.5)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {t("delete.confirm")}
            </Button>
          </Box>
        }
      />

      <Modal
        open={reportModal.isOpen}
        onClose={reportModal.close}
        width={460}
        title={t("report.title", { name: client.name })}
        description={t("report.description")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="outlined"
              onClick={() => {
                reportModal.close();
                show(t("report.downloaded"), t("report.downloadedSub"));
              }}
              startIcon={<IconRenderer name="download" size={15} />}
              sx={{ fontWeight: 400 }}
            >
              {t("report.download")}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                reportModal.close();
                show(t("report.emailed"), t("report.emailedSub"));
              }}
              startIcon={<IconRenderer name="mail" size={15} />}
            >
              {t("report.email")}
            </Button>
          </Box>
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            mb: "16px",
          }}
        >
          {[
            { label: t("kpi.openRoles"), value: client.kpis.openRoles },
            { label: t("kpi.pipeline"), value: client.kpis.pipeline },
            { label: t("kpi.awaiting"), value: client.kpis.awaiting },
            { label: t("kpi.hires"), value: client.kpis.hires },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                p: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Modal>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
