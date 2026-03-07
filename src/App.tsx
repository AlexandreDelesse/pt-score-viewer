import { useEffect, useRef, useState } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import PageBloc from "./Components/Shared/PageBloc";
import PtResultList from "./Components/PtResults/PtResultList";
import type { TestResult } from "./types/testRestult";
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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile"; //TODO: A placer dans un file picker.
import Save from "@mui/icons-material/Save";
import SyncIcon from "@mui/icons-material/Sync";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import useScoreService from "./services/useScoreService";
import { green } from "@mui/material/colors";
import PtResultNbResume from "./Components/PtResults/PtResultNbResume";
import WorkOnPanel from "./Components/PtResults/WorkOnPanel";
import usePilotestSync from "./services/usePilotestSync";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// QueryClient créé en dehors du composant pour ne pas être recréé à chaque render
const queryClient = new QueryClient();

function AppContent() {
  const {
    scoreList,
    meanStanineList,
    updateScoreList,
    getStreak,
    totalResume,
    workOnList,
    trendMap,
  } = useScoreService();

  const {
    results: syncedResults,
    isSyncing,
    serverDown,
    configure,
    error: syncError,
    updatedAt,
  } = usePilotestSync();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedResult, setSelectedResult] = useState<TestResult>();
  const [importError, setImportError] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null); // TODO: A placer dans un composant file picker

  // Quand la sync ramène des résultats, on met à jour la liste
  useEffect(() => {
    if (syncedResults?.length) {
      updateScoreList(syncedResults);
    }
  }, [syncedResults]);

  // TODO: A placer dans un composant file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // TODO: A placer dans un composant file picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const text = await file.text();
    try {
      const json = JSON.parse(text);

      if (!Array.isArray(json)) {
        setImportError("Le fichier JSON doit contenir une liste.");
        return;
      }

      updateScoreList(json);
    } catch {
      setImportError("Fichier JSON invalide.");
    }
  };

  const getNbOfResults = (resultName: string) =>
    scoreList.filter((r) => r.test === resultName).length;

  const handleOnTestClick = (t: TestResult) => setSelectedResult(t);
  const clearSelectedResult = () => setSelectedResult(undefined);

  const handleOnSaveClick = () =>
    window.localStorage.setItem("results", JSON.stringify(scoreList));

  const handleSyncSubmit = () => {
    configure(email, password);
    setSyncDialogOpen(false);
    setEmail("");
    setPassword("");
  };

  if (selectedResult)
    return (
      <PageBloc>
        <Button onClick={clearSelectedResult}>Retour</Button>
        <Typography
          my={2}
          textAlign={"center"}
          variant="h2"
          fontSize={{ xs: 22, md: 32 }}
        >
          {selectedResult.test}
        </Typography>
        <Box mt={1}>
          <LineChart
            grid={{ horizontal: true }}
            yAxis={[{ min: 1, max: 9 }]}
            series={[
              {
                curve: "step",
                showMark: false,
                data: scoreList
                  .filter((r) => r.test === selectedResult.test)
                  .map((r) => r.stanine),
              },
            ]}
            height={isMobile ? 260 : 400}
          >
            <ChartsReferenceLine
              y={7}
              label="Objectif Classe 7"
              lineStyle={{ stroke: green[400], strokeWidth: 2 }}
            />
          </LineChart>
        </Box>
      </PageBloc>
    );

  return (
    <PageBloc>
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <Box display="flex" flexWrap="wrap" gap={1} my={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={handleClick}
          >
            Importer un fichier JSON
          </Button>

          {!scoreList.length || (
            <Button
              color="primary"
              variant="contained"
              onClick={handleOnSaveClick}
            >
              <Save />
            </Button>
          )}

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
                  isSyncing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SyncIcon />
                  )
                }
                disabled={serverDown ?? false}
                onClick={() => setSyncDialogOpen(true)}
              >
                Sync
              </Button>
            </span>
          </Tooltip>
        </Box>

        {importError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {importError}
          </Alert>
        )}

        {syncError && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {syncError}
          </Alert>
        )}
      </>

      <PtResultNbResume
        totalResults={totalResume.totalScore}
        totalDayResult={totalResume.totalTodayScore}
        totalWeekResult={totalResume.totalWeekScore}
      />
      <WorkOnPanel entries={workOnList} />
      <PtResultList
        nbOfTest={getNbOfResults} //TODO: Renomer et faire quelque chose de propre
        onClick={handleOnTestClick}
        ptResults={meanStanineList}
        getStreak={getStreak} //TODO: Pas propre du tout ! a fair eévoluer !
        trendMap={trendMap}
      />

      {/* Dialog de configuration de la sync */}
      <Dialog
        open={syncDialogOpen}
        onClose={() => setSyncDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
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
              if (e.key === "Enter" && email && password) handleSyncSubmit();
            }}
          />
          <Alert severity="info" sx={{ mt: 1 }}>
            Les identifiants sont transmis au serveur local uniquement. Ils ne
            sont jamais stockés dans l&apos;appli.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSyncSubmit}
            disabled={!email || !password}
          >
            Synchroniser
          </Button>
        </DialogActions>
      </Dialog>
    </PageBloc>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
