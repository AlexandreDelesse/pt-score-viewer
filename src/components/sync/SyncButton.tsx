import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import usePilotestSync from "../../hooks/usePilotestSync";
import type { TestResult } from "../../types/testResult";

interface Props {
  onSyncComplete: (results: TestResult[]) => void;
}

export default function SyncButton({ onSyncComplete }: Props) {
  const { results, isSyncing, serverDown, configure, error, updatedAt } =
    usePilotestSync();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (results?.length) onSyncComplete(results);
  }, [results]);

  const handleSubmit = () => {
    configure(email, password);
    setOpen(false);
    setEmail("");
    setPassword("");
  };

  return (
    <Box>
      <Tooltip
        title={
          serverDown
            ? "Serveur local indisponible (node server.js)"
            : isSyncing
            ? "Synchronisation en cours…"
            : updatedAt
            ? `Dernière sync : ${new Date(updatedAt).toLocaleString("fr-FR")}`
            : "Synchroniser avec pilotest.com"
        }
      >
        <span>
          <Button
            variant="outlined"
            startIcon={
              isSyncing ? <CircularProgress size={16} /> : <SyncIcon />
            }
            disabled={serverDown ?? false}
            onClick={() => setOpen(true)}
          >
            Sync
          </Button>
        </span>
      </Tooltip>

      {error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Synchroniser pilotest.com</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            inputProps={{ autoComplete: "off" }}
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            inputProps={{ autoComplete: "new-password" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && email && password) handleSubmit();
            }}
          />
          <Alert severity="info" sx={{ mt: 1 }}>
            Les identifiants sont transmis au serveur local uniquement. Ils ne
            sont jamais stockés dans l&apos;appli.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!email || !password}
          >
            Synchroniser
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
