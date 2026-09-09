import { ButtonBase, Grid, Stack, Typography } from "@mui/material";

export type ResumePeriod = "total" | "today" | "week";

interface Props {
  totalResults: number;
  totalWeekResult: number;
  totalDayResult: number;
  onSelect: (period: ResumePeriod) => void;
}

function PtResultNbResume({ totalDayResult, totalResults, totalWeekResult, onSelect }: Props) {
  const formatResult = (title: string, result: number, period: ResumePeriod) => (
    <Grid size={4}>
      <ButtonBase
        onClick={() => onSelect(period)}
        disabled={result === 0}
        sx={{ width: "100%", borderRadius: 1, p: 0.5 }}
      >
        <Stack textAlign="center" width="100%">
          <Typography variant="caption">{title}</Typography>
          <Typography color="primary" fontSize={32} fontWeight={300}>
            {result}
          </Typography>
        </Stack>
      </ButtonBase>
    </Grid>
  );

  return (
    <Grid container spacing={2} my={2}>
      {formatResult("Total", totalResults, "total")}
      {formatResult("Aujourd'hui", totalDayResult, "today")}
      {formatResult("Cette semaine", totalWeekResult, "week")}
    </Grid>
  );
}

export default PtResultNbResume;
