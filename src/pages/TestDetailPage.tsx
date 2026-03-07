import { Button, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
import { green } from "@mui/material/colors";
import type { TestResult } from "../types/testResult";
import PageBloc from "../components/layout/PageBloc";

interface Props {
  testName: string;
  scores: TestResult[];
  onBack: () => void;
}

export default function TestDetailPage({ testName, scores, onBack }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <PageBloc>
      <Button onClick={onBack}>Retour</Button>
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
              curve: "step",
              showMark: false,
              data: scores.map((r) => r.stanine),
            },
          ]}
          height={isMobile ? 260 : 400}
        >
          <ChartsReferenceLine
            y={7}
            label="Objectif Classe 7"
            lineStyle={{ stroke: green[400], strokeWidth: 2 }}
          />
        </LineChart>
      </Box>
    </PageBloc>
  );
}
