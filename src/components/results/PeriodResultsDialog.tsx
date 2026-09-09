import {
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { TestResult } from "../../types/testResult";
import { getStanineColor, parseAtDate } from "../../utils/scoreTools";

interface Props {
  open: boolean;
  title: string;
  results: TestResult[];
  onClose: () => void;
  onSelectTest: (test: TestResult) => void;
}

function PeriodResultsDialog({ open, title, results, onClose, onSelectTest }: Props) {
  const sortedResults = [...results].sort(
    (a, b) => parseAtDate(b.at).getTime() - parseAtDate(a.at).getTime()
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {sortedResults.length === 0 ? (
          <Typography color="text.secondary" p={2}>
            Aucun résultat sur cette période.
          </Typography>
        ) : (
          <List disablePadding>
            {sortedResults.map((r) => (
              <ListItemButton
                key={`${r.test}__${r.at}`}
                onClick={() => {
                  onSelectTest(r);
                  onClose();
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography fontWeight={500}>{r.test}</Typography>
                      <Chip
                        label={`Classe ${r.stanine}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: getStanineColor(r.stanine),
                          borderColor: getStanineColor(r.stanine),
                        }}
                      />
                    </Stack>
                  }
                  secondary={`${r.score} — ${r.at}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PeriodResultsDialog;
