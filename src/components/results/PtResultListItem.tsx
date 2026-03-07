import type { TestResult } from "../../types/testResult";
import { Box, Card, CardActionArea, IconButton, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StanineDisplay from "./StanineDisplay";
import ScoreStreak from "../shared/ScoreStreak";
import { testNameToSlug } from "../../utils/scoreTools";

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
          <Stack direction="row" gap={0.5} alignItems="center">
            <ScoreStreak streak={streak} />
            <IconButton
              size="small"
              component="a"
              href={`https://www.pilotest.com/fr/tests/${testNameToSlug(test.test)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <StanineDisplay stanine={test.stanine} />
        <Typography variant="caption">{test.at}</Typography>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
