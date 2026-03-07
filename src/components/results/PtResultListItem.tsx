import type { TestResult } from "../../types/testResult";
import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";
import StanineDisplay from "./StanineDisplay";
import ScoreStreak from "../shared/ScoreStreak";

interface Props {
  test: TestResult;
  nbOfTest: number;
  onClick: (t: TestResult) => void;
  streak?: number;
}

function PtResultListItem({ test, onClick, nbOfTest, streak = 0 }: Props) {
  return (
    <Card sx={{ bgcolor: "whitesmoke", width: "100%" }}>
      <CardActionArea sx={{ p: 2 }} onClick={() => onClick(test)}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography>{test.test}</Typography>
            <Stack direction="row" gap={1}>
              <Typography>{nbOfTest} Results</Typography>
              <Typography>best : {test.score}</Typography>
            </Stack>
          </Box>
          <ScoreStreak streak={streak} />
        </Box>
        <StanineDisplay stanine={test.stanine} />
        <Typography variant="caption">{test.at}</Typography>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
