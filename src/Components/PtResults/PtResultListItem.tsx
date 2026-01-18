import type { TestResult } from "../../types/testRestult";
import {
  Box,
  Card,
  CardActionArea,
  Stack,
  Typography,
} from "@mui/material";
import StanineDisplay from "./StanineDisplay";
import ScoreStreak from "../Shared/Streak/ScoreStreak";

interface Props {
  test: TestResult;
  nbOfTest: number;
  onClick: (t: TestResult) => void;
  streak?: number;
}

function PtResultListItem(props: Props) {
  const { test, onClick, nbOfTest, streak = 0 } = props;

  const handleOnClick = () => onClick(test);

  return (
    <Card sx={{ bgcolor: "whitesmoke", width: 350 }}>
      <CardActionArea sx={{ p: 2 }} onClick={handleOnClick}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography>{test.test}</Typography>
            <Stack direction={"row"} gap={1}>
              <Typography>{nbOfTest} Results </Typography>
              <Typography>best : {test.score}</Typography>
            </Stack>
          </Box>
          <ScoreStreak streak={streak} />
        </Box>

        <StanineDisplay stanine={test.stanine} />
        <Typography variant="caption">{test.at} </Typography>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
