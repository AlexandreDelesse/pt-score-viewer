import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { useState } from "react";
import useScores from "./hooks/useScores";
import ResultsPage from "./pages/ResultsPage";
import TestDetailPage from "./pages/TestDetailPage";

export default function App() {
  const { scoreList, updateScoreList, save } = useScores();
  const [selectedTest, setSelectedTest] = useState<string>();

  if (selectedTest)
    return (
      <TestDetailPage
        testName={selectedTest}
        scores={scoreList.filter((r) => r.test === selectedTest)}
        onBack={() => setSelectedTest(undefined)}
      />
    );

  return (
    <ResultsPage
      scoreList={scoreList}
      updateScoreList={updateScoreList}
      save={save}
      onTestClick={setSelectedTest}
    />
  );
}
