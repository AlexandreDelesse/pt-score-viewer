import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LineChart } from "@mui/x-charts";
import type { TestResult } from "../../types/testResult";
import { getScorePercentHistory } from "../../utils/scoreTools";
import DashboardCard from "../layout/DashboardCard";

interface Props {
  todayResults: TestResult[];
  weekResults: TestResult[];
}

type Scope = "today" | "week";

// Contrairement au graphique de TestDetailPage (l'historique complet d'un
// seul test), ici on veut voir la progression réalisée sur la période
// affichée elle-même (aujourd'hui / cette semaine) : chaque courbe ne
// reprend que les tentatives de cette période, pas tout l'historique du
// test, sinon le graphique ne reflète plus le titre de la carte.
function TodayWeekProgressChart({ todayResults, weekResults }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [scope, setScope] = useState<Scope>("today");

  const periodResults = scope === "today" ? todayResults : weekResults;
  const testNames = [...new Set(periodResults.map((r) => r.test))];

  const series = testNames
    .map((name) => ({ name, data: getScorePercentHistory(periodResults, name) }))
    .filter((s) => s.data.length > 1);

  const skippedCount = testNames.length - series.length;

  return (
    <DashboardCard
      icon={<TrendingUpIcon fontSize="small" />}
      title="Progression des exercices travaillés"
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={scope}
          onChange={(_e, value: Scope | null) => value && setScope(value)}
          sx={{ ml: "auto" }}
        >
          <ToggleButton value="today">Aujourd'hui</ToggleButton>
          <ToggleButton value="week">Cette semaine</ToggleButton>
        </ToggleButtonGroup>
      }
    >
      {testNames.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {scope === "today"
            ? "Aucun exercice travaillé aujourd'hui pour l'instant."
            : "Aucun exercice travaillé cette semaine pour l'instant."}
        </Typography>
      )}

      {testNames.length > 0 && series.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Pas encore assez de tentatives pour tracer une courbe (il faut au moins 2 tentatives par exercice).
        </Typography>
      )}

      {series.length > 0 && (
        <>
          <Box mt={1}>
            <LineChart
              grid={{ horizontal: true }}
              yAxis={[{ min: 0, max: 100, label: "Score (%)" }]}
              series={series.map((s) => ({
                label: s.name,
                curve: "monotoneX",
                showMark: true,
                data: s.data,
              }))}
              height={isMobile ? 220 : 300}
              slotProps={{ legend: { direction: "horizontal" } }}
            />
          </Box>
          {skippedCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {skippedCount} exercice{skippedCount > 1 ? "s" : ""} avec une seule tentative, pas encore de courbe.
            </Typography>
          )}
        </>
      )}
    </DashboardCard>
  );
}

export default TodayWeekProgressChart;
