import type { ReactNode } from "react";
import { ButtonBase, Grid, Stack, Typography } from "@mui/material";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DashboardCard from "../layout/DashboardCard";

export type ResumePeriod = "total" | "today" | "week";

interface Props {
  totalResults: number;
  totalWeekResult: number;
  totalDayResult: number;
  onSelect: (period: ResumePeriod) => void;
}

const STAT_ICON: Record<ResumePeriod, ReactNode> = {
  total: <Inventory2Icon fontSize="small" color="action" />,
  today: <TodayIcon fontSize="small" color="action" />,
  week: <DateRangeIcon fontSize="small" color="action" />,
};

function PtResultNbResume({ totalDayResult, totalResults, totalWeekResult, onSelect }: Props) {
  const formatResult = (title: string, result: number, period: ResumePeriod) => (
    <Grid size={4}>
      <ButtonBase
        onClick={() => onSelect(period)}
        disabled={result === 0}
        sx={{ width: "100%", borderRadius: 1, p: 1 }}
      >
        <Stack alignItems="center" width="100%" gap={0.25}>
          {STAT_ICON[period]}
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {result}
          </Typography>
        </Stack>
      </ButtonBase>
    </Grid>
  );

  return (
    <DashboardCard icon={<QueryStatsIcon fontSize="small" />} title="Résumé">
      <Grid container spacing={1}>
        {formatResult("Total", totalResults, "total")}
        {formatResult("Aujourd'hui", totalDayResult, "today")}
        {formatResult("Cette semaine", totalWeekResult, "week")}
      </Grid>
    </DashboardCard>
  );
}

export default PtResultNbResume;
