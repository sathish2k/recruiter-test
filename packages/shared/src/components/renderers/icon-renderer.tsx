"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CallRounded from "@mui/icons-material/CallRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import ManageSearchRounded from "@mui/icons-material/ManageSearchRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PsychologyRounded from "@mui/icons-material/PsychologyRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ShareRounded from "@mui/icons-material/ShareRounded";
import SourceRounded from "@mui/icons-material/SourceRounded";
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DomainRounded from "@mui/icons-material/DomainRounded";
import DoneAllRounded from "@mui/icons-material/DoneAllRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import EventRounded from "@mui/icons-material/EventRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import FormatBoldRounded from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRounded from "@mui/icons-material/FormatItalicRounded";
import FormatListBulletedRounded from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRounded from "@mui/icons-material/FormatListNumberedRounded";
import FormatQuoteRounded from "@mui/icons-material/FormatQuoteRounded";
import ChecklistRounded from "@mui/icons-material/ChecklistRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import DataObjectRounded from "@mui/icons-material/DataObjectRounded";
import HorizontalRuleRounded from "@mui/icons-material/HorizontalRuleRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import StrikethroughSRounded from "@mui/icons-material/StrikethroughSRounded";
import KeyRounded from "@mui/icons-material/KeyRounded";
import MoveUpRounded from "@mui/icons-material/MoveUpRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import HandshakeRounded from "@mui/icons-material/HandshakeRounded";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import MailRounded from "@mui/icons-material/MailRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";
import PersonOffRounded from "@mui/icons-material/PersonOffRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import TableViewRounded from "@mui/icons-material/TableViewRounded";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import UnfoldMoreRounded from "@mui/icons-material/UnfoldMoreRounded";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import ViewKanbanRounded from "@mui/icons-material/ViewKanbanRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import WorkRounded from "@mui/icons-material/WorkRounded";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import PersonSearchRounded from "@mui/icons-material/PersonSearchRounded";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import WorkHistoryRounded from "@mui/icons-material/WorkHistoryRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import delve from "dlv";

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
  "person-off": PersonOffRounded,
  "unfold-more": UnfoldMoreRounded,
  login: LoginRounded,
  logout: LogoutRounded,
  domain: DomainRounded,
  close: CloseRounded,
  check: CheckRounded,
  "check-circle": CheckCircleRounded,
  search: SearchRounded,
  "expand-more": ExpandMoreRounded,
  filter: FilterListRounded,
  bold: FormatBoldRounded,
  italic: FormatItalicRounded,
  strikethrough: StrikethroughSRounded,
  "list-bulleted": FormatListBulletedRounded,
  "list-numbered": FormatListNumberedRounded,
  checklist: ChecklistRounded,
  quote: FormatQuoteRounded,
  code: CodeRounded,
  "code-block": DataObjectRounded,
  link: LinkRounded,
  "horizontal-rule": HorizontalRuleRounded,
  key: KeyRounded,
  "move-up": MoveUpRounded,
  quiz: QuizRounded,
  "arrow-back": ArrowBackRounded,
  "arrow-forward": ArrowForwardRounded,
  "bar-chart": BarChartRounded,
  rocket: RocketLaunchRounded,
  call: CallRounded,
  "chevron-right": ChevronRightRounded,
  copy: ContentCopyRounded,
  flag: FlagRounded,
  hourglass: HourglassTopRounded,
  location: LocationOnRounded,
  "manage-search": ManageSearchRounded,
  "open-in-new": OpenInNewRounded,
  psychology: PsychologyRounded,
  schedule: ScheduleRounded,
  school: SchoolRounded,
  share: ShareRounded,
  source: SourceRounded,
  certificate: WorkspacePremiumRounded,
  sparkle: AutoAwesomeRounded,
  notifications: NotificationsRounded,
  pdf: PictureAsPdfRounded,
  excel: TableViewRounded,
  csv: TableViewRounded,
  word: DescriptionRounded,
  json: DescriptionRounded,
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
  fact_check: FactCheckOutlined,
  done_all: DoneAllRounded,
  task_alt: TaskAltRounded,
  description: DescriptionRounded,
  insights: InsightsRounded,
  send: SendRounded,
  timer: TimerOutlined,
  "attach-file": AttachFileRounded,
  attach_file: AttachFileRounded,
  comment: ChatBubbleOutlineRounded,
  chat_bubble: ChatBubbleOutlineRounded,
  "person-search": PersonSearchRounded,
  remove: RemoveRounded,
  replay: ReplayRounded,
  tune: TuneRounded,
  "work-history": WorkHistoryRounded,
  payments: PaymentsRounded,
  error: ErrorOutlineRounded,
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
