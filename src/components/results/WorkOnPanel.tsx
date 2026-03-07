import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { type WorkOnEntry, testNameToSlug } from "../../utils/scoreTools";

const labelColor: Record<WorkOnEntry["label"], "error" | "warning" | "info"> = {
  Insuffisant: "error",
  "À améliorer": "warning",
  "Proche de l'objectif": "info",
};

interface Props {
  entries: WorkOnEntry[];
}

function WorkOnPanel({ entries }: Props) {
  if (!entries.length) return null;

  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FitnessCenterIcon fontSize="small" />
          <Typography fontWeight={600}>À travailler</Typography>
          <Chip label={entries.length} size="small" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {entries.map((e) => (
            <Box
              key={e.test}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2">{e.test}</Typography>
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
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default WorkOnPanel;
