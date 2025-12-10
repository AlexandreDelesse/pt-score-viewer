import { useEffect, useRef, useState } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import PageBloc from "./Components/Shared/PageBloc";
import PtResultList from "./Components/PtResults/PtResultList";
import type { TestResult } from "./types/testRestult";
import { Box, Button, Typography } from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile"; //TODO: A placer dans un file picker.
import Save from "@mui/icons-material/Save";
import { LineChart } from "@mui/x-charts";

function App() {
  const [ptResults, setPtResult] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult>();

  const filterByHighestStanine = () => {
    let stanineFiltered: TestResult[] = [];
    ptResults.forEach((s: TestResult) => {
      let curStan = stanineFiltered.find((t) => t.test == s.test);
      if (!curStan) stanineFiltered = [...stanineFiltered, s];
      else {
        if (curStan.stanine < s.stanine) {
          stanineFiltered = [
            ...stanineFiltered.filter((x) => x.test != s.test),
            s,
          ];
        }
      }
    });
    return stanineFiltered.sort((a, b) => a.stanine - b.stanine);
  };

  useEffect(() => {
    const r = window.localStorage.getItem("results") || "[]";
    setPtResult(JSON.parse(r));
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null); // TODO: A placer dans un composant file picker

  // TODO: A placer dans un composant file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // TODO: A placer dans un composant file picker
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    // const date = file.lastModified
    try {
      const json = JSON.parse(text);

      if (!Array.isArray(json)) {
        console.error("Le fichier JSON doit contenir une liste.");
        return;
      }

      setPtResult(json);
    } catch (err) {
      console.error("JSON invalide", err);
    }
  };

  const getNbOfResults = (resultName: string) =>
    ptResults.filter((r) => r.test == resultName).length;

  const handleOnTestClick = (t: TestResult) => setSelectedResult(t);
  const clearSelectedResult = () => setSelectedResult(undefined);

  const handleOnSaveClick = () =>
    window.localStorage.setItem("results", JSON.stringify(ptResults));

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
                data: ptResults
                  .filter((r) => r.test == selectedResult.test)
                  .map((r) => r.stanine),
              },
            ]}
            height={400}
          />
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
        {!ptResults.length || (
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
      <PtResultList
        nbOfTest={getNbOfResults} //TODO: Renomer et faire quelque chose de propre
        onClick={handleOnTestClick}
        ptResults={filterByHighestStanine()}
      />
    </PageBloc>
  );
}

export default App;
