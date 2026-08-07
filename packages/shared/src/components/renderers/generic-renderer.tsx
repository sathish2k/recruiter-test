import { ActionsMenu, type MenuRendererConfig } from "./actions-menu";
import {
  type ActionHandler,
  ActionsRenderer,
  type ActionsRendererConfig,
} from "./actions-renderer";
import { AiMatchRenderer, type AiMatchRendererConfig } from "./ai-match-renderer";
import { BooleanRenderer, type BooleanRendererConfig } from "./boolean-renderer";
import { CurrencyRenderer, type CurrencyRendererConfig } from "./currency-renderer";
import { DateRenderer, type DateRendererConfig } from "./date-renderer";
import { DotRenderer, type DotRendererConfig } from "./dot-renderer";
import { EntityRenderer, type EntityRendererConfig } from "./entity-renderer";
import { IconRenderer, type IconRendererConfig } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { MetricGroupRenderer, type MetricGroupRendererConfig } from "./metric-group-renderer";
import { NumberRenderer, type NumberRendererConfig } from "./number-renderer";
import { PillRenderer, type PillRendererConfig } from "./pill-renderer";
import { RatingRenderer, type RatingRendererConfig } from "./rating-renderer";
import { RoleRenderer, type RoleRendererConfig } from "./role-renderer";
import { ScoreBarRenderer, type ScoreBarRendererConfig } from "./score-bar-renderer";
import { SegmentBarRenderer, type SegmentBarRendererConfig } from "./segment-bar-renderer";
import { StackRenderer, type StackRendererConfig } from "./stack-renderer";
import {
  StaticTranslationRenderer,
  type StaticTranslationRendererConfig,
} from "./static-translation-renderer";
import { StatusRenderer, type StatusRendererConfig } from "./status-renderer";
import { TextRenderer, type TextRendererConfig } from "./text-renderer";
import { TimeRenderer, type TimeRendererConfig } from "./time-renderer";

export type GenericRendererConfig =
  | TextRendererConfig
  | StaticTranslationRendererConfig
  | NumberRendererConfig
  | CurrencyRendererConfig
  | DateRendererConfig
  | TimeRendererConfig
  | BooleanRendererConfig
  | StatusRendererConfig
  | EntityRendererConfig
  | AiMatchRendererConfig
  | PillRendererConfig
  | RatingRendererConfig
  | RoleRendererConfig
  | ScoreBarRendererConfig
  | SegmentBarRendererConfig
  | StackRendererConfig
  | MetricGroupRendererConfig
  | DotRendererConfig
  | ActionsRendererConfig
  | MenuRendererConfig
  | ({ type: "icon" } & IconRendererConfig)
  | ({ type: "link" } & LinkRendererConfig);

export function GenericRenderer({
  config,
  data = {},
  actionHandler,
  id,
}: {
  config: GenericRendererConfig;
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
  /** Component id, for cells that resolve their own copy (a button action). */
  id?: string;
}) {
  switch (config.type) {
    case "string":
    case "text":
      return <TextRenderer config={config} data={data} />;
    case "static-translation":
      return <StaticTranslationRenderer config={config} data={data} />;
    case "number":
      return <NumberRenderer config={config} data={data} />;
    case "currency":
      return <CurrencyRenderer config={config} data={data} />;
    case "date":
      return <DateRenderer config={config} data={data} />;
    case "time":
      return <TimeRenderer config={config} data={data} />;
    case "boolean":
      return <BooleanRenderer config={config} data={data} />;
    case "status":
      return <StatusRenderer config={config} data={data} />;
    case "entity":
      return <EntityRenderer config={config} data={data} />;
    case "ai-match":
      return <AiMatchRenderer config={config} data={data} />;
    case "pill":
      return <PillRenderer config={config} data={data} />;
    case "rating":
      return <RatingRenderer config={config} data={data} />;
    case "dot":
      return <DotRenderer config={config} data={data} />;
    case "metric-group":
      return <MetricGroupRenderer config={config} data={data} />;
    case "score-bar":
      return <ScoreBarRenderer config={config} data={data} />;
    case "segment-bar":
      return <SegmentBarRenderer config={config} data={data} />;
    case "stack":
      return <StackRenderer config={config} data={data} />;
    case "role":
      return <RoleRenderer config={config} data={data} actionHandler={actionHandler} />;
    case "actions":
      return <ActionsRenderer config={config} data={data} actionHandler={actionHandler} id={id} />;
    case "menu":
      return (
        <ActionsMenu
          id={config.id}
          actions={config.actions}
          data={data}
          actionHandler={actionHandler}
        />
      );
    case "icon":
      return <IconRenderer {...config} data={data} />;
    case "link":
      return <LinkRenderer config={config} data={data} />;
    default:
      return null;
  }
}
