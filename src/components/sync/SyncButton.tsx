import { useEffect, useRef, useState } from "react";
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
  const { results, isSyncing, isConfigured, serverDown, sync, configure, error, updatedAt } =
    usePilotestSync();
  const [open, setOpen] = useState(false);
  const [cookie, setCookie] = useState("");

  // Toujours appeler la dernière version de onSyncComplete (elle capture le
  // scoreList courant du parent pour calculer les nouveautés) sans pour autant
  // redéclencher l'effet à chaque re-render : seul un changement de `results`
  // doit déclencher un appel.
  const onSyncCompleteRef = useRef(onSyncComplete);
  useEffect(() => {
    onSyncCompleteRef.current = onSyncComplete;
  });

  useEffect(() => {
    if (results?.length) onSyncCompleteRef.current(results);
  }, [results]);

  const handleSubmit = () => {
    configure(cookie);
    setOpen(false);
    setCookie("");
  };

  const handleSyncClick = () => {
    if (isConfigured) sync();
    else setOpen(true);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1}>
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
              disabled={(serverDown || isSyncing) ?? false}
              onClick={handleSyncClick}
            >
              Sync
            </Button>
          </span>
        </Tooltip>
        {isConfigured && (
          <Button size="small" onClick={() => setOpen(true)}>
            Modifier la session
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Synchroniser pilotest.com</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            Pilotest.com protège désormais sa page de connexion par un
            contrôle anti-robot (Cloudflare Turnstile) : un login automatique
            avec email/mot de passe n&apos;est plus possible. Il faut copier
            la session d&apos;un navigateur où tu t&apos;es connecté
            toi-même :
            <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
              <li>Connecte-toi normalement sur pilotest.com.</li>
              <li>
                Ouvre les outils de développement (F12) → onglet
                Réseau/Network.
              </li>
              <li>
                Recharge la page, clique sur une requête vers pilotest.com,
                et copie la valeur de l&apos;en-tête de requête{" "}
                <code>Cookie</code>.
              </li>
              <li>Colle-la ci-dessous.</li>
            </ol>
          </Alert>
          <TextField
            label="Cookie de session"
            placeholder="_pilotest_session=...; remember_user_token=..."
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            autoComplete="off"
          />
          <Alert severity="warning" sx={{ mt: 1 }}>
            Le cookie est transmis au serveur local uniquement, jamais stocké
            dans l&apos;appli. Il expirera au bout d&apos;un moment : il
            faudra alors en recoller un nouveau.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!cookie.trim()}
          >
            Synchroniser
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
