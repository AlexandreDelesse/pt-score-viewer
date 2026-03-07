import { Button, Box } from "@mui/material";
import Save from "@mui/icons-material/Save";
import type { TestResult } from "../types/testResult";
import PageBloc from "../components/layout/PageBloc";
import PtResultNbResume from "../components/results/PtResultNbResume";
import WorkOnPanel from "../components/results/WorkOnPanel";
import PtResultList from "../components/results/PtResultList";
import JsonImportButton from "../components/import/JsonImportButton";
import SyncButton from "../components/sync/SyncButton";
import useScoreDerived from "../hooks/useScoreDerived";

interface Props {
  scoreList: TestResult[];
  updateScoreList: (list: TestResult[]) => void;
  save: () => void;
  onTestClick: (test: string) => void;
}

export default function ResultsPage({
  scoreList,
  updateScoreList,
  save,
  onTestClick,
}: Props) {
  const { meanStanineList, workOnList, trendMap, totalResume, getStreak } =
    useScoreDerived(scoreList);

  const getNbOfResults = (testName: string) =>
    scoreList.filter((r) => r.test === testName).length;

  const handleTestClick = (t: TestResult) => onTestClick(t.test);

  return (
    <PageBloc>
      <Box display="flex" flexWrap="wrap" gap={1} my={2} alignItems="flex-start">
        <JsonImportButton onImport={updateScoreList} />
        {scoreList.length > 0 && (
          <Button color="primary" variant="contained" onClick={save}>
            <Save />
          </Button>
        )}
        <SyncButton onSyncComplete={updateScoreList} />
      </Box>

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
    </PageBloc>
  );
}
