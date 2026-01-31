import { Grid, Stack, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";

interface Props {
  totalResults: number;
  totalWeekResult: number;
  totalDayResult: number;
}

function PtResultNbResume(props: Props) {
  const { totalDayResult, totalResults, totalWeekResult } = props;

  const formatResult = (title: string, result: number) => (
    <Grid size={4}>
      <Stack textAlign={"center"}>
        <Typography variant="caption">{title} </Typography>
        <Typography color={blue[500]} fontSize={32}>
          {result}
        </Typography>
      </Stack>
    </Grid>
  );

  return (
    <Grid container spacing={2} my={2}>
      {formatResult("Total", totalResults)}
      {formatResult("Aujourd'hui", totalDayResult)}
      {formatResult("Cette semaine", totalWeekResult)}
    </Grid>
  );
}

export default PtResultNbResume;
