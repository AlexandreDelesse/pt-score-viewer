import { useState } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import type { TestResult } from "../../types/testResult";
import type { ExamGoal } from "../../hooks/useExamGoal";
import { daysUntil, getStanineColor } from "../../utils/scoreTools";

// Une classe stanine < 5 correspond au label "Insuffisant" de getWorkOnList —
// c'est le jalon que l'utilisateur veut voir descendre à 0 avant l'épreuve.
const INSUFFICIENT_THRESHOLD = 5;

interface Props {
  meanStanineList: TestResult[];
  getNbOfResults: (testName: string) => number;
  onSelectTest: (test: TestResult) => void;
  examGoal: ExamGoal;
  onExamGoalChange: (goal: ExamGoal) => void;
}

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
};

const countdownLabel = (start: string, end: string): string => {
  const toStart = daysUntil(start);
  const toEnd = daysUntil(end);
  if (toStart > 0) return `J-${toStart}`;
  if (toEnd >= 0) return "En cours";
  return "Terminée";
};

function ExamGoalPanel({
  meanStanineList,
  getNbOfResults,
  onSelectTest,
  examGoal,
  onExamGoalChange,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(examGoal.start);
  const [draftEnd, setDraftEnd] = useState(examGoal.end);

  const insufficientTests = meanStanineList
    .filter((r) => r.stanine < INSUFFICIENT_THRESHOLD)
    .sort((a, b) => a.stanine - b.stanine);

  const openEditDialog = () => {
    setDraftStart(examGoal.start);
    setDraftEnd(examGoal.end);
    setEditOpen(true);
  };

  const saveExamGoal = () => {
    if (draftStart && draftEnd) onExamGoalChange({ start: draftStart, end: draftEnd });
    setEditOpen(false);
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="caption" color="text.secondary">
            Épreuve du {formatDate(examGoal.start)} au {formatDate(examGoal.end)}
          </Typography>
          <IconButton size="small" onClick={openEditDialog} sx={{ p: 0.25 }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
        <Typography variant="h5" fontWeight={600}>
          {countdownLabel(examGoal.start, examGoal.end)}
        </Typography>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <ButtonBase
        onClick={() => setListOpen(true)}
        disabled={insufficientTests.length === 0}
        sx={{ borderRadius: 1, p: 1 }}
      >
        <Stack alignItems="center">
          <Typography variant="caption" color="text.secondary">
            À travailler → objectif 0
          </Typography>
          <Typography
            variant="h5"
            fontWeight={600}
            color={insufficientTests.length > 0 ? "error.main" : "success.main"}
          >
            {insufficientTests.length}
          </Typography>
        </Stack>
      </ButtonBase>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Dates de l'épreuve</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Début"
              type="date"
              fullWidth
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Fin"
              type="date"
              fullWidth
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={saveExamGoal}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={listOpen} onClose={() => setListOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Tests encore insuffisants
          <IconButton onClick={() => setListOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List disablePadding>
            {insufficientTests.map((t) => (
              <ListItemButton
                key={t.test}
                onClick={() => {
                  onSelectTest(t);
                  setListOpen(false);
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography fontWeight={500}>{t.test}</Typography>
                      <Chip
                        label={`Classe ${t.stanine.toFixed(1)}`}
                        size="small"
                        variant="outlined"
                        sx={{ color: getStanineColor(t.stanine), borderColor: getStanineColor(t.stanine) }}
                      />
                    </Stack>
                  }
                  secondary={`${getNbOfResults(t.test)} résultat${getNbOfResults(t.test) > 1 ? "s" : ""}`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ExamGoalPanel;
