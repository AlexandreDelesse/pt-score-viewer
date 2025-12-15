import { Box, Grid, Typography } from "@mui/material";
import type { TestResult } from "../../types/testRestult";
import PtResultListItem from "./PtResultListItem";

interface Props {
  ptResults: TestResult[];
  onClick: (t: TestResult) => void;
  nbOfTest: (resultName: string) => number;
  getStreak: (t: string) => number;
}

function PtResultList(props: Props) {
  const { ptResults, onClick, nbOfTest, getStreak } = props;

  if (!ptResults.length)
    return (
      <Box mt={5}>
        <Typography textAlign={"center"}>
          Importer un fichier JSON PiloteTest pour afficher les résultats !
        </Typography>
      </Box>
    );

  return (
    <Grid container spacing={2}>
      {ptResults.map((i) => (
        <PtResultListItem
          nbOfTest={nbOfTest(i.test)}
          onClick={onClick}
          test={i}
          key={i.test + i.at}
          streak={getStreak(i.test)}
        />
      ))}
    </Grid>
  );
}

export default PtResultList;
