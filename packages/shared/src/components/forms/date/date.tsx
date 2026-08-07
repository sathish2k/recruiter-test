"use client";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/**
 * Date / time / date-time.
 *
 * The value stays an ISO-ish string on the wire (`YYYY-MM-DD`, `HH:mm`,
 * `YYYY-MM-DDTHH:mm`) — that is what the API stores, and swapping the control
 * must not migrate the data. Everything between the field and that string is
 * MUI X's picker, so the calendar, the clock and the keyboard behaviour are
 * the library's rather than ours.
 *
 * The typed input stays live: a recruiter types a date faster than they click
 * one, and the design insists the picker is paired with it, never a substitute.
 */
export function DateWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
  const kind = prop.widget === "time" ? "time" : prop.widget === "datetime" ? "datetime" : "date";

  const value = parse(field.value, kind);
  const min = parse(prop.min, kind);
  const max = parse(prop.max, kind);

  const shared = {
    value,
    disabled,
    onChange: (next: Date | null) => field.onChange(next ? format(next, kind) : ""),
    slotProps: {
      textField: {
        fullWidth: true,
        hiddenLabel: true,
        error: !!fieldState.error,
        onBlur: field.onBlur,
        inputRef: field.ref,
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FieldShell
        label={t(prop.title ?? "")}
        hideLabel={prop.hideLabel}
        help={prop.help ? t(prop.help) : undefined}
        error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
      >
        {/* 15-minute boundaries: interviews are booked on the quarter hour, and
            a free-running minute list is a list nobody wants to scroll. Only the
            time-bearing pickers take it — DatePicker forwards it to the DOM. */}
        {kind === "time" ? (
          <TimePicker
            {...shared}
            minutesStep={15}
            minTime={min ?? undefined}
            maxTime={max ?? undefined}
          />
        ) : kind === "datetime" ? (
          <DateTimePicker
            {...shared}
            minutesStep={15}
            minDateTime={min ?? undefined}
            maxDateTime={max ?? undefined}
          />
        ) : (
          <DatePicker {...shared} minDate={min ?? undefined} maxDate={max ?? undefined} />
        )}
      </FieldShell>
    </LocalizationProvider>
  );
}

type Kind = "date" | "time" | "datetime";

/** `new Date("2026-01-05")` parses as UTC and lands a day early west of
 * Greenwich — a real off-by-one in a scheduling product. Parse the parts. */
function parse(raw: unknown, kind: Kind): Date | null {
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  if (typeof raw !== "string" || !raw) return null;

  if (kind === "time") {
    const [h, m] = raw.split(":").map(Number);
    if (!Number.isFinite(h)) return null;
    const date = new Date();
    date.setHours(h, m || 0, 0, 0);
    return date;
  }

  const [datePart, timePart] = raw.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const [h, mi] = (timePart ?? "").split(":").map(Number);
  const date = new Date(y, mo - 1, d, h || 0, mi || 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value: number) => String(value).padStart(2, "0");

function format(date: Date, kind: Kind): string {
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (kind === "time") return time;
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return kind === "datetime" ? `${day}T${time}` : day;
}
