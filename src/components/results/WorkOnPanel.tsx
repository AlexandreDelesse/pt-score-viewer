import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { TestResult } from "../../types/testResult";
import { type WorkOnEntry, testNameToSlug } from "../../utils/scoreTools";

const labelColor: Record<WorkOnEntry["label"], "error" | "warning" | "info"> = {
  Insuffisant: "error",
  "À améliorer": "warning",
  "Proche de l'objectif": "info",
};

interface Props {
  entries: WorkOnEntry[];
  weekResults: TestResult[];
}

function WorkOnPanel({ entries, weekResults }: Props) {
  if (!entries.length) return null;

  const doneThisWeek = (test: string) => weekResults.some((r) => r.test === test);
  const doneCount = entries.filter((e) => doneThisWeek(e.test)).length;

  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FitnessCenterIcon fontSize="small" />
          <Typography fontWeight={600}>À travailler cette semaine</Typography>
          <Chip label={`${doneCount}/${entries.length}`} size="small" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {entries.map((e) => {
            const done = doneThisWeek(e.test);
            return (
              <Box
                key={e.test}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Tooltip title={done ? "Retravaillé cette semaine" : "Pas encore fait cette semaine"}>
                    {done ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                    )}
                  </Tooltip>
                  <Box>
                    <Typography variant="body2">{e.test}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {e.reason}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {e.meanStanine.toFixed(1)} / 9
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
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default WorkOnPanel;
