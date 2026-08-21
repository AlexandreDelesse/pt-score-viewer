import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { useState } from "react";
import { AppBar, Toolbar, Typography, Breadcrumbs, Link, Box } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import useScores from "./hooks/useScores";
import ResultsPage from "./pages/ResultsPage";
import TestDetailPage from "./pages/TestDetailPage";

export default function App() {
  const { scoreList, updateScoreList, save } = useScores();
  const [selectedTest, setSelectedTest] = useState<string>();

  return (
    <>
      <AppBar position="sticky" color="primary">
        <Toolbar variant="dense">
          <FlightTakeoffIcon sx={{ mr: 1.5, fontSize: 20 }} />
          {selectedTest ? (
            <Breadcrumbs
              aria-label="navigation"
              sx={{
                color: "inherit",
                "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.5)" },
              }}
            >
              <Link
                component="button"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.8, fontSize: 14, cursor: "pointer" }}
                onClick={() => setSelectedTest(undefined)}
              >
                Mes scores
              </Link>
              <Typography color="inherit" sx={{ fontSize: 14, fontWeight: 600 }}>
                {selectedTest}
              </Typography>
            </Breadcrumbs>
          ) : (
            <Typography variant="subtitle1" fontWeight={600} letterSpacing={0.3}>
              PiloteTest — Mes scores
            </Typography>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            v{__APP_VERSION__}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main">
        {selectedTest ? (
          <TestDetailPage
            testName={selectedTest}
            scores={scoreList.filter((r) => r.test === selectedTest)}
            onBack={() => setSelectedTest(undefined)}
          />
        ) : (
          <ResultsPage
            scoreList={scoreList}
            updateScoreList={updateScoreList}
            save={save}
            onTestClick={setSelectedTest}
          />
        )}
      </Box>
    </>
  );
}
