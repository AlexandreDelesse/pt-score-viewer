import { Grid } from "@mui/material";
import type { TestResult } from "../../types/testRestult";
import PtResultListItem from "./PtResultListItem";

interface Props {
  ptResults: TestResult[];
}

function PtResultList(props: Props) {
  const { ptResults } = props;

  return (
    <Grid container spacing={2}>
      {ptResults.map((i) => (
        <PtResultListItem test={i} key={i.at} />
      ))}
    </Grid>
  );
}

export default PtResultList;
