import type { TestResult } from "../../types/testRestult";
import {
  Card,
  CardActionArea,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import StanineDisplay from "./StanineDisplay";

interface Props {
  test: TestResult;
  nbOfTest: number;
  onClick: (t: TestResult) => void;
}

function PtResultListItem(props: Props) {
  const { test, onClick, nbOfTest } = props;

  const handleOnClick = () => onClick(test);

  return (
    <Card sx={{ bgcolor: "whitesmoke", width: 350 }}>
      <CardActionArea sx={{ p: 2 }} onClick={handleOnClick}>
        <Typography>{test.test}</Typography>
        <Stack direction={"row"} gap={1}>
          <Typography>{nbOfTest} Results </Typography>
          <Typography>best : {test.score}</Typography>
        </Stack>

        <StanineDisplay stanine={test.stanine} />
        <Typography variant="caption">{test.at} </Typography>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
