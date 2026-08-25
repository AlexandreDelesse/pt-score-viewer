import {
  Button,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import type { TestCategory, TestResult } from "../types/testResult";
import PageBloc from "../components/layout/PageBloc";

interface Props {
  testName: string;
  scores: TestResult[];
  onBack: () => void;
  category: TestCategory | null;
  onCategoryChange: (category: TestCategory | null) => void;
}

export default function TestDetailPage({
  testName,
  scores,
  onBack,
  category,
  onCategoryChange,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      <Box mt={1}>
        <LineChart
          grid={{ horizontal: true }}
          yAxis={[{ min: 1, max: 9 }]}
          series={[
            {
              curve: "linear",
              showMark: false,
              data: scores.map((r) => r.stanine),
            },
          ]}
          height={isMobile ? 260 : 400}
        >
          <ChartsReferenceLine
            y={7}
            label="Objectif Classe 7"
            lineStyle={{ stroke: theme.palette.success.main, strokeWidth: 2 }}
          />
        </LineChart>
      </Box>
    </PageBloc>
  );
}
