import {
  Button,
  Chip,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import type { TestCategory, TestResult } from "../types/testResult";
import PageBloc from "../components/layout/PageBloc";
import { getStanineColor, parseAtDate, parseScorePercent } from "../utils/scoreTools";

interface Props {
  testName: string;
  scores: TestResult[];
  streak: number;
  onBack: () => void;
  category: TestCategory | null;
  onCategoryChange: (category: TestCategory | null) => void;
}

export default function TestDetailPage({
  testName,
  scores,
  streak,
  onBack,
  category,
  onCategoryChange,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const stanineColor = theme.palette.primary.main;
  const percentColor = theme.palette.warning.main;
  const attemptsByRecent = [...scores].sort(
    (a, b) => parseAtDate(b.at).getTime() - parseAtDate(a.at).getTime()
  );

  return (
    <PageBloc>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Button onClick={onBack} startIcon={<ArrowBackIcon />}>
          Retour
        </Button>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={category}
          onChange={(_e, value: TestCategory | null) => onCategoryChange(value)}
        >
          <ToggleButton value="psy0">Psy0</ToggleButton>
          <ToggleButton value="psy1">Psy1</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography
        my={2}
        textAlign="center"
        variant="h2"
        fontSize={{ xs: 22, md: 32 }}
      >
        {testName}
      </Typography>
      {streak > 0 && (
        <Typography textAlign="center" color="success.main" variant="body2" fontWeight={600} mb={1}>
          {streak} tentative{streak > 1 ? "s" : ""} d'affilée ≥ classe 7
        </Typography>
      )}
      <Box mt={1}>
        <LineChart
          grid={{ horizontal: true }}
          yAxis={[
            {
              id: "stanine",
              min: 1,
              max: 9,
              tickLabelStyle: { fill: stanineColor },
              labelStyle: { fill: stanineColor },
              label: "Stanine",
            },
            {
              id: "percent",
              position: "right",
              min: 0,
              max: 100,
              tickLabelStyle: { fill: percentColor },
              labelStyle: { fill: percentColor },
              label: "Score (%)",
            },
          ]}
          series={[
            {
              label: "Stanine",
              curve: "stepAfter",
              showMark: false,
              yAxisId: "stanine",
              color: stanineColor,
              data: scores.map((r) => r.stanine),
            },
            {
              label: "Score (%)",
              curve: "monotoneX",
              showMark: false,
              yAxisId: "percent",
              color: percentColor,
              data: scores.map((r) => parseScorePercent(r.score)),
            },
          ]}
          height={isMobile ? 260 : 400}
        >
          <ChartsReferenceLine
            axisId="stanine"
            y={7}
            label="Objectif Classe 7"
            lineStyle={{ stroke: theme.palette.success.main, strokeWidth: 2 }}
          />
        </LineChart>
      </Box>
      <Typography variant="subtitle1" fontWeight={600} mt={4} mb={1}>
        Historique des tentatives
      </Typography>
      <List disablePadding>
        {attemptsByRecent.map((r) => (
          <ListItem key={`${r.test}__${r.at}`} divider disableGutters>
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography>{r.score}</Typography>
                  <Chip
                    label={`Classe ${r.stanine}`}
                    size="small"
                    variant="outlined"
                    sx={{ color: getStanineColor(r.stanine), borderColor: getStanineColor(r.stanine) }}
                  />
                </Stack>
              }
              secondary={r.at}
            />
          </ListItem>
        ))}
      </List>
    </PageBloc>
  );
}
