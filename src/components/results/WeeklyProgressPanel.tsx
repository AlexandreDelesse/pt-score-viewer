import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { TestResult } from "../../types/testResult";
import { testNameToSlug, type DailyFocus, type WorkOnEntry } from "../../utils/scoreTools";

const labelColor: Record<WorkOnEntry["label"], "error" | "warning" | "info"> = {
  Insuffisant: "error",
  "À améliorer": "warning",
  "Proche de l'objectif": "info",
};

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
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <FitnessCenterIcon fontSize="small" />
          <Typography fontWeight={600}>Objectifs de la semaine</Typography>
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
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {rows.map((e) => {
            const met = e.remaining === 0;
            const progress = Math.min((e.done / e.target) * 100, 100);
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
                    <Chip label={e.label} size="small" color={labelColor[e.label]} />
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
                  color={met ? "success" : labelColor[e.label]}
                  sx={{ borderRadius: 1, height: 6 }}
                />
              </Box>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default WeeklyProgressPanel;
