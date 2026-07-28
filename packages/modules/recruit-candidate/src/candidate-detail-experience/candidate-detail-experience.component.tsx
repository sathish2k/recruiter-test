"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { avatarSwatch, IconRenderer } from "@recruit/shared";

interface Experience {
  jobTitle?: string;
  company?: string;
  summary?: string;
  fromMonth?: string;
  fromYear?: string;
  toMonth?: string;
  toYear?: string;
  current?: boolean;
}

interface Education {
  institution?: string;
  major?: string;
  degree?: string;
  fromYear?: string;
  toYear?: string;
  currentlyPursuing?: boolean;
}

interface Candidate {
  experience: Experience[];
  education: Education[];
  skillSet: string[];
}

const period = (row: Experience | Education, present: string) => {
  const from = [
    (row as Experience).fromMonth,
    (row as Experience).fromYear ?? (row as Education).fromYear,
  ]
    .filter(Boolean)
    .join(" ");
  const open = (row as Experience).current || (row as Education).currentlyPursuing;
  const to = open
    ? present
    : [(row as Experience).toMonth, (row as Experience).toYear ?? (row as Education).toYear]
        .filter(Boolean)
        .join(" ");
  return [from, to].filter(Boolean).join(" – ");
};

/**
 * Experience, education and skills — the parsed body of the CV. The current
 * role is drawn as the design's highlighted block; everything before it runs
 * down a timeline.
 */
export function CandidateDetailExperienceComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Candidate>(id, { filters: { id: params.id } });

  if (isLoading || !data) return <Skeleton variant="rounded" height={220} />;

  const experience = (data.experience ?? []).filter((row) => row.company || row.jobTitle);
  const current = experience.find((row) => row.current) ?? experience[0];
  const previous = experience.filter((row) => row !== current);
  const education = (data.education ?? []).filter((row) => row.institution || row.degree);
  const skills = data.skillSet ?? [];

  const Role = ({ row, highlight }: { row: Experience; highlight?: boolean }) => {
    const swatch = avatarSwatch(row.company ?? row.jobTitle ?? "");
    return (
      <Box
        sx={
          highlight
            ? {
                bgcolor: "surface.successSoftBg",
                border: "1px solid",
                borderColor: "surface.successSoftBorder",
                borderRadius: "13px",
                p: "14px 16px",
              }
            : undefined
        }
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            rowGap: "6px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <Box
              sx={{
                width: highlight ? 28 : 24,
                height: highlight ? 28 : 24,
                flex: "none",
                borderRadius: highlight ? "8px" : "7px",
                display: "grid",
                placeItems: "center",
                bgcolor: swatch.bg,
                color: swatch.fg,
                fontSize: highlight ? 12 : 11,
                fontWeight: 800,
              }}
            >
              {(row.company ?? row.jobTitle ?? "?").slice(0, 1).toUpperCase()}
            </Box>
            <Typography
              sx={{ fontSize: highlight ? 15.5 : 14.5, fontWeight: 800, letterSpacing: ".01em" }}
            >
              {row.company}
              {row.jobTitle ? (
                <Box
                  component="span"
                  sx={{ color: "text.secondary", fontWeight: 400, fontSize: 12.5 }}
                >
                  {` · ${row.jobTitle}`}
                </Box>
              ) : null}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "9px", flex: "none" }}>
            {row.current ? (
              <Chip variant="soft" size="small" color="success" label={t("current")} />
            ) : null}
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              {period(row, t("present"))}
            </Typography>
          </Box>
        </Box>
        {row.summary ? (
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: "text.secondary", mt: "7px" }}>
            {row.summary}
          </Typography>
        ) : null}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Card variant="base" sx={{ p: "20px 22px" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "16px" }}>
          {t("experience")}
        </Typography>

        {experience.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>{t("noExperience")}</Typography>
        ) : (
          <>
            {current ? <Role row={current} highlight /> : null}

            {previous.length ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", m: "16px 0 14px" }}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".1em",
                      color: "text.disabled",
                    }}
                  >
                    {t("previous")}
                  </Typography>
                  <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                </Box>

                {previous.map((row, index) => (
                  <Box key={`${row.company}-${row.jobTitle}`} sx={{ display: "flex", gap: "14px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: 12,
                        flex: "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          border: "2px solid",
                          borderColor: "surface.border",
                          mt: "4px",
                        }}
                      />
                      {index < previous.length - 1 ? (
                        <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: "4px" }} />
                      ) : null}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, pb: "18px" }}>
                      <Role row={row} />
                    </Box>
                  </Box>
                ))}
              </>
            ) : null}
          </>
        )}
      </Card>

      <Card variant="base" sx={{ p: "20px 22px" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
          {t("education")}
          {education.length ? (
            <Box component="span" sx={{ fontWeight: 400, color: "text.disabled", fontSize: 12 }}>
              {` · ${education.length}`}
            </Box>
          ) : null}
        </Typography>
        {education.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled", mt: "12px" }}>
            {t("noEducation")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", mt: "16px" }}>
            {education.map((row) => (
              <Box
                key={`${row.institution}-${row.degree}`}
                sx={{ display: "flex", alignItems: "center", gap: "13px" }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "surface.primarySoftBg",
                    border: "1px solid",
                    borderColor: "surface.primarySoftBorder",
                    color: "surface.accentBright",
                  }}
                >
                  <IconRenderer name="school" size={18} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                    {row.institution || row.degree}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
                    {[row.degree, row.major, period(row, t("present"))].filter(Boolean).join(" · ")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Card variant="base" sx={{ p: "20px 22px" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "14px" }}>
          {t("skills")}
          {skills.length ? (
            <Box component="span" sx={{ fontWeight: 400, color: "text.disabled", fontSize: 12 }}>
              {` · ${skills.length}`}
            </Box>
          ) : null}
        </Typography>
        {skills.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>{t("noSkills")}</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {skills.map((skill) => (
              <Chip key={skill} variant="soft" label={skill} />
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}
