import { useRef, useState } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import PageBloc from "./Components/Shared/PageBloc";
import PtResultList from "./Components/PtResults/PtResultList";
import type { TestResult } from "./types/testRestult";
import { Alert, Box, Button, Typography } from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile"; //TODO: A placer dans un file picker.
import Save from "@mui/icons-material/Save";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import useScoreService from "./services/useScoreService";
import { green } from "@mui/material/colors";
import PtResultNbResume from "./Components/PtResults/PtResultNbResume";
import WorkOnPanel from "./Components/PtResults/WorkOnPanel";

function App() {
  const { scoreList, meanStanineList, updateScoreList, getStreak, totalResume, workOnList, trendMap } =
    useScoreService();
  const [selectedResult, setSelectedResult] = useState<TestResult>();
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null); // TODO: A placer dans un composant file picker

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
    // const date = file.lastModified
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

  if (selectedResult)
    return (
      <PageBloc>
        <Button onClick={clearSelectedResult}>Retour</Button>
        <Typography my={2} textAlign={"center"} variant="h2" fontSize={32}>
          {selectedResult.test}
        </Typography>
        <Box mt={1}>
          <LineChart
            grid={{ horizontal: true }}
            yAxis={[
              {
                min: 1,
                max: 9,
              },
            ]}
            series={[
              {
                curve: "step",
                showMark: false,
                data: scoreList
                  .filter((r) => r.test === selectedResult.test)
                  .map((r) => r.stanine),
              },
            ]}
            height={400}
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

        <Button
          sx={{ my: 2 }}
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={handleClick}
        >
          Importer un fichier JSON
        </Button>

        {importError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {importError}
          </Alert>
        )}

        {!scoreList.length || (
          <Button
            color="primary"
            variant="contained"
            sx={{ ml: 1 }}
            onClick={handleOnSaveClick}
          >
            <Save />
          </Button>
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
    </PageBloc>
  );
}

export default App;
