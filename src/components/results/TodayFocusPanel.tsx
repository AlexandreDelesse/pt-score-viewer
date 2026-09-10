import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TodayIcon from "@mui/icons-material/Today";
import type { DailyFocusEntry } from "../../utils/scoreTools";

const labelColor: Record<DailyFocusEntry["label"], "error" | "warning" | "info"> = {
  Insuffisant: "error",
  "À améliorer": "warning",
  "Proche de l'objectif": "info",
};

interface Props {
  entries: DailyFocusEntry[];
  dailyMinimum: number;
}

function TodayFocusPanel({ entries, dailyMinimum }: Props) {
  if (!entries.length) return null;

  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <TodayIcon fontSize="small" />
          <Typography fontWeight={600}>Aujourd'hui</Typography>
          <Chip
            label={`Minimum : ${dailyMinimum} tentative${dailyMinimum > 1 ? "s" : ""}`}
            size="small"
            color="primary"
            variant="outlined"
          />
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
              gap={1}
            >
              <Box>
                <Typography variant="body2">{e.test}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {e.done === 0
                    ? "Pas encore fait cette semaine"
                    : `${e.done}/${e.target} fait cette semaine`}
                </Typography>
              </Box>
              <Chip label={e.label} size="small" color={labelColor[e.label]} />
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default TodayFocusPanel;
