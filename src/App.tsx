import { useState } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import PageBloc from "./Components/Shared/PageBloc";
import { results } from "./data/results";
import PtResultList from "./Components/PtResults/PtResultList";
import type { TestResult } from "./types/testRestult";

function App() {
  const [ptResults, setPtResult] = useState(results);

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

  console.log(filterByHighestStanine());

  return (
    <PageBloc>
      <PtResultList ptResults={filterByHighestStanine()} />
    </PageBloc>
  );
}

export default App;
