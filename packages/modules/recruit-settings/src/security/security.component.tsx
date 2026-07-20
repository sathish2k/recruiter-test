"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { httpClient } from "@recruit/sdk";
import { Toast, useToast } from "@recruit/shared";
import { useState } from "react";
import { Row, SectionCard, Toggle } from "../ui";

export function SettingsSecurityComponent() {
  const { toast, show, clear } = useToast();
  const [twoFa, setTwoFa] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const changePassword = async () => {
    try {
      await httpClient.put("/profile/password", {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      show("Password updated", "Use it next time you sign in");
    } catch {
      show("Couldn't update password", "Your current password is incorrect");
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: "16px" }}>
      <SectionCard>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700, mb: "4px" }}>Authentication</Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", mb: "16px" }}>
          Change your password and manage sign-in security
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <TextField
            type="password"
            label="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            size="small"
          />
          <TextField
            type="password"
            label="New password (8+ characters)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ mt: "14px" }}>
          <Button
            variant="contained"
            size="small"
            disabled={current.length < 1 || next.length < 8}
            onClick={changePassword}
          >
            Change password
          </Button>
        </Box>
        <Row
          title="Two-factor authentication"
          desc="Require a code at sign-in"
          action={<Toggle on={twoFa} onClick={() => setTwoFa((v) => !v)} />}
        />
      </SectionCard>
      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
