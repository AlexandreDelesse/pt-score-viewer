import { Box, Chip, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { TestResult } from "../../types/testResult";
import { getStanineColor, testNameToSlug, type DailyFocus, type WorkOnEntry } from "../../utils/scoreTools";
import DashboardCard from "../layout/DashboardCard";

interface Props {
  entries: WorkOnEntry[];
  weekResults: TestResult[];
  dailyFocus: DailyFocus;
}

type Row = WorkOnEntry & { done: number; remaining: number };

// Fusionne "aujourd'hui" et "cette semaine" : dailyFocus.entries EST déjà le
// sous-ensemble d'`entries` qui n'a pas atteint son objectif hebdo (remaining
// > 0), donc les deux anciens panneaux affichaient en réalité les mêmes tests
// à des degrés de détail différents. Un seul panneau, à faire d'abord puis
// atteints (grisés), évite la redondance.
function WeeklyProgressPanel({ entries, weekResults, dailyFocus }: Props) {
  if (!entries.length) return null;

  const pendingTests = new Set(dailyFocus.entries.map((e) => e.test));
  const doneRows: Row[] = entries
    .filter((e) => !pendingTests.has(e.test))
    .map((e) => ({
      ...e,
      done: weekResults.filter((r) => r.test === e.test).length,
      remaining: 0,
    }));

  const rows: Row[] = [...dailyFocus.entries, ...doneRows];

  return (
    <DashboardCard
      icon={<FitnessCenterIcon fontSize="small" />}
      title="Objectifs de la semaine"
      action={
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ ml: "auto" }}>
          <Chip label={`${doneRows.length}/${entries.length}`} size="small" />
          {dailyFocus.dailyMinimum > 0 && (
            <Chip
              label={`Minimum aujourd'hui : ${dailyFocus.dailyMinimum}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        {rows.map((e) => {
          const met = e.remaining === 0;
          const progress = Math.min((e.done / e.target) * 100, 100);
          // Même échelle de couleur que partout ailleurs dans l'appli
          // (liste, graphique de détail) plutôt qu'un code couleur à 3
          // paliers propre à ce panneau.
          const accentColor = met ? "#2e7d32" : getStanineColor(e.meanStanine);
          return (
            <Box key={e.test} sx={{ opacity: met ? 0.6 : 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={0.5}>
                <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
                  {met ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                  )}
                  <Box minWidth={0}>
                    <Typography variant="body2" noWrap>
                      {e.test}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {e.reason}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
                  <Typography variant="body2" color="text.secondary">
                    {e.done}/{e.target}
                  </Typography>
                  <Chip
                    label={e.label}
                    size="small"
                    variant="outlined"
                    sx={{ color: accentColor, borderColor: accentColor }}
                  />
                  <IconButton
                    size="small"
                    component="a"
                    href={`https://www.pilotest.com/fr/tests/${testNameToSlug(e.test)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  borderRadius: 1,
                  height: 6,
                  bgcolor: `${accentColor}33`,
                  "& .MuiLinearProgress-bar": { bgcolor: accentColor },
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </DashboardCard>
  );
}

export default WeeklyProgressPanel;
