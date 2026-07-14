"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DomainRounded from "@mui/icons-material/DomainRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import EventRounded from "@mui/icons-material/EventRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import GroupRounded from "@mui/icons-material/GroupRounded";
import HandshakeRounded from "@mui/icons-material/HandshakeRounded";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import MailRounded from "@mui/icons-material/MailRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import TableViewRounded from "@mui/icons-material/TableViewRounded";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import ViewKanbanRounded from "@mui/icons-material/ViewKanbanRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import WorkRounded from "@mui/icons-material/WorkRounded";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import delve from "dlv";

// Single icon registry for the whole app. Config passes a `name` (or an image
// `src`); consumers size/color via props. Replaces the per-component icon maps.
export const ICON_REGISTRY: Record<string, SvgIconComponent> = {
  add: AddRounded,
  edit: EditOutlined,
  delete: DeleteOutlineRounded,
  view: VisibilityOutlined,
  visibility: VisibilityRounded,
  "visibility-off": VisibilityOffRounded,
  download: FileDownloadOutlined,
  upload: UploadFileRounded,
  event: EventRounded,
  mail: MailOutlineRounded,
  "mail-filled": MailRounded,
  more: MoreHorizRounded,
  "more-vert": MoreVertRounded,
  lock: LockOutlined,
  "lock-reset": LockResetRounded,
  person: PersonOutlineRounded,
  "person-add": PersonAddAlt1Rounded,
  login: LoginRounded,
  domain: DomainRounded,
  close: CloseRounded,
  check: CheckRounded,
  search: SearchRounded,
  "expand-more": ExpandMoreRounded,
  "arrow-forward": ArrowForwardRounded,
  "bar-chart": BarChartRounded,
  sparkle: AutoAwesomeRounded,
  notifications: NotificationsRounded,
  // File formats (export).
  pdf: PictureAsPdfRounded,
  excel: TableViewRounded,
  csv: TableViewRounded,
  word: DescriptionRounded,
  json: DescriptionRounded,
  // Navigation.
  dashboard: SpaceDashboardRounded,
  work: WorkRounded,
  group: GroupRounded,
  kanban: ViewKanbanRounded,
  monitoring: InsightsRounded,
  handshake: HandshakeRounded,
  aiScreening: AutoAwesomeRounded,
  automation: BoltRounded,
  settings: SettingsRounded,
  help: HelpOutlineRounded,
};

export interface IconRendererConfig {
  type?: "icon";
  /** Registry key (see ICON_REGISTRY). */
  name?: string;
  /** Image source (url / data-uri / asset) — takes priority over `name`. */
  src?: string;
  /** Read the name/src out of `data` at this path (data-driven icons). */
  path?: string;
  size?: number;
  color?: string;
  sx?: SxProps<Theme>;
  alt?: string;
}

export function IconRenderer({
  name,
  src,
  path,
  size = 18,
  color,
  sx,
  alt = "",
  data,
}: IconRendererConfig & { data?: Record<string, unknown> }) {
  const resolved = path
    ? (delve(data ?? {}, path) as string | undefined)
    : undefined;
  const source =
    src ??
    (resolved && /^(https?:|data:|\/)/.test(resolved) ? resolved : undefined);
  const iconName = name ?? (source ? undefined : resolved);

  if (source) {
    return (
      <Box
        component="img"
        src={source}
        alt={alt}
        sx={{ width: size, height: size, objectFit: "contain", ...sx }}
      />
    );
  }
  const Icon = iconName ? ICON_REGISTRY[iconName] : undefined;
  if (!Icon) return null;
  return <Icon sx={{ fontSize: size, color, ...sx }} />;
}
