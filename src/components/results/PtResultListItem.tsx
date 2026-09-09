import type { TestResult } from "../../types/testResult";
import { Box, Card, CardActionArea, Chip, IconButton, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getStanineColor, testNameToSlug } from "../../utils/scoreTools";

interface Props {
  test: TestResult;
  nbOfTest: number;
  bestScore: string | null;
  onClick: (t: TestResult) => void;
}

function PtResultListItem({ test, onClick, nbOfTest, bestScore }: Props) {
  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardActionArea sx={{ p: 1.5, height: "100%" }} onClick={() => onClick(test)}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box minWidth={0}>
            <Typography fontWeight={500} noWrap>
              {test.test}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                {nbOfTest} résultat{nbOfTest > 1 ? "s" : ""}
              </Typography>
              {bestScore && (
                <Typography variant="caption" color="text.secondary">
                  best : {bestScore}
                </Typography>
              )}
            </Stack>
          </Box>
          <Chip
            label={test.stanine.toFixed(1)}
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              bgcolor: getStanineColor(test.stanine),
            }}
          />
        </Box>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={1}>
          <IconButton
            size="small"
            component="a"
            href={`https://www.pilotest.com/fr/tests/${testNameToSlug(test.test)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{ p: 0.5 }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
