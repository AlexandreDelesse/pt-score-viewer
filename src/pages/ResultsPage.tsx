import { useState } from "react";
import { Alert, Button, Box, Chip, Snackbar, Stack } from "@mui/material";
import Save from "@mui/icons-material/Save";
import type { TestCategoryMap, TestResult } from "../types/testResult";
import PageBloc from "../components/layout/PageBloc";
import PtResultNbResume from "../components/results/PtResultNbResume";
import WorkOnPanel from "../components/results/WorkOnPanel";
import PtResultList from "../components/results/PtResultList";
import JsonImportButton from "../components/import/JsonImportButton";
import SyncButton from "../components/sync/SyncButton";
import useScoreDerived from "../hooks/useScoreDerived";
import { countNewResults, filterByCategory, type CategoryFilter } from "../utils/scoreTools";

interface Props {
  scoreList: TestResult[];
  updateScoreList: (list: TestResult[]) => void;
  save: (list?: TestResult[]) => void;
  onTestClick: (test: string) => void;
  categories: TestCategoryMap;
}

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "Tout",
  psy0: "Psy0",
  psy1: "Psy1",
};

const CATEGORY_FILTERS: CategoryFilter[] = ["all", "psy0", "psy1"];

export default function ResultsPage({
  scoreList,
  updateScoreList,
  save,
  onTestClick,
  categories,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [newResultsCount, setNewResultsCount] = useState<number | null>(null);

  const filteredScoreList = filterByCategory(scoreList, categories, categoryFilter);

  const { meanStanineList, workOnList, trendMap, totalResume, getStreak } =
    useScoreDerived(filteredScoreList);

  const getNbOfResults = (testName: string) =>
    filteredScoreList.filter((r) => r.test === testName).length;

  const handleTestClick = (t: TestResult) => onTestClick(t.test);

  return (
    <PageBloc>
      <Box display="flex" flexWrap="wrap" gap={1} my={2} alignItems="flex-start">
        <JsonImportButton onImport={updateScoreList} />
        {scoreList.length > 0 && (
          <Button color="primary" variant="contained" onClick={() => save()}>
            <Save />
          </Button>
        )}
        <SyncButton
          onSyncComplete={(results) => {
            setNewResultsCount(countNewResults(scoreList, results));
            updateScoreList(results);
            save(results);
          }}
        />
      </Box>

      {scoreList.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
          {CATEGORY_FILTERS.map((f) => (
            <Chip
              key={f}
              label={CATEGORY_LABELS[f]}
              onClick={() => setCategoryFilter(f)}
              variant={categoryFilter === f ? "filled" : "outlined"}
              color={categoryFilter === f ? "primary" : "default"}
            />
          ))}
        </Stack>
      )}

      <PtResultNbResume
        totalResults={totalResume.totalScore}
        totalDayResult={totalResume.totalTodayScore}
        totalWeekResult={totalResume.totalWeekScore}
      />
      <WorkOnPanel entries={workOnList} />
      <PtResultList
        nbOfTest={getNbOfResults}
        onClick={handleTestClick}
        ptResults={meanStanineList}
        getStreak={getStreak}
        trendMap={trendMap}
      />

      <Snackbar
        open={newResultsCount !== null}
        autoHideDuration={4000}
        onClose={() => setNewResultsCount(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNewResultsCount(null)}
          severity={newResultsCount ? "success" : "info"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {newResultsCount
            ? `${newResultsCount} nouveau${newResultsCount > 1 ? "x" : ""} résultat${newResultsCount > 1 ? "s" : ""} récupéré${newResultsCount > 1 ? "s" : ""} depuis pilotest.com`
            : "Aucun nouveau résultat depuis la dernière synchronisation"}
        </Alert>
      </Snackbar>
    </PageBloc>
  );
}
