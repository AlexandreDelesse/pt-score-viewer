import { Button, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ChartsReferenceLine, LineChart } from "@mui/x-charts";
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
      <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
        Retour
      </Button>
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
