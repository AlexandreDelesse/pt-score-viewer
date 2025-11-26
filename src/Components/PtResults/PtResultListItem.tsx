import type { TestResult } from "../../types/testRestult";
import { Card, Typography } from "@mui/material";
import StanineDisplay from "./StanineDisplay";

interface Props {
  test: TestResult;
}

function PtResultListItem(props: Props) {
  const { test } = props;

  return (
    <Card sx={{ bgcolor: "whitesmoke", p: 2, width: 350 }}>
      <Typography>{test.test}</Typography>
      <Typography>{test.score}</Typography>

      <StanineDisplay stanine={test.stanine} />
      <Typography variant="caption">{test.at} </Typography>
    </Card>
  );
}

export default PtResultListItem;
