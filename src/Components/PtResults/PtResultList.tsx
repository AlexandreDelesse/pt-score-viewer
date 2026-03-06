import { useState } from "react";
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { TestResult } from "../../types/testRestult";
import PtResultListItem from "./PtResultListItem";
import {
  sortAndFilterResults,
  type FilterOption,
  type SortOption,
} from "../../tools/scoreTools";

interface Props {
  ptResults: TestResult[];
  onClick: (t: TestResult) => void;
  nbOfTest: (resultName: string) => number;
  getStreak: (t: string) => number;
  trendMap: Record<string, number>;
}

const FILTER_LABELS: Record<FilterOption, string> = {
  all: "Tout",
  work_on: "À travailler",
  mastered: "Maîtrisé",
};

const FILTERS: FilterOption[] = ["all", "work_on", "mastered"];

function PtResultList(props: Props) {
  const { ptResults, onClick, nbOfTest, getStreak, trendMap } = props;
  const [sort, setSort] = useState<SortOption>("stanine_asc");
  const [filter, setFilter] = useState<FilterOption>("all");

  if (!ptResults.length)
    return (
      <Box mt={5}>
        <Typography textAlign={"center"}>
          Importer un fichier JSON PiloteTest pour afficher les résultats !
        </Typography>
      </Box>
    );

  const displayList = sortAndFilterResults(
    ptResults,
    nbOfTest,
    trendMap,
    sort,
    filter
  );

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        alignItems="center"
        mb={2}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={FILTER_LABELS[f]}
            onClick={() => setFilter(f)}
            variant={filter === f ? "filled" : "outlined"}
            color={filter === f ? "primary" : "default"}
          />
        ))}

        <Select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          sx={{ ml: "auto" }}
        >
          <MenuItem value="stanine_asc">Plus faible stanine</MenuItem>
          <MenuItem value="stanine_desc">Plus fort stanine</MenuItem>
          <MenuItem value="count_desc">Plus pratiqué</MenuItem>
          <MenuItem value="count_asc">Moins pratiqué</MenuItem>
          <MenuItem value="trend_pos">Tendance positive</MenuItem>
          <MenuItem value="trend_neg">Tendance négative</MenuItem>
        </Select>
      </Stack>

      <Grid container spacing={2}>
        {displayList.map((i) => (
          <PtResultListItem
            nbOfTest={nbOfTest(i.test)}
            onClick={onClick}
            test={i}
            key={i.test + i.at}
            streak={getStreak(i.test)}
          />
        ))}
      </Grid>
    </>
  );
}

export default PtResultList;
