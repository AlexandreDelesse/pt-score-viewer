import type { TestCategory, TestResult } from "../../types/testResult";
import {
  Box,
  Card,
  CardActionArea,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StanineDisplay from "./StanineDisplay";
import ScoreStreak from "../shared/ScoreStreak";
import { testNameToSlug } from "../../utils/scoreTools";

interface Props {
  test: TestResult;
  nbOfTest: number;
  onClick: (t: TestResult) => void;
  streak?: number;
  category?: TestCategory | null;
  onCategoryChange?: (category: TestCategory | null) => void;
}

function PtResultListItem({
  test,
  onClick,
  nbOfTest,
  streak = 0,
  category = null,
  onCategoryChange,
}: Props) {
  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <CardActionArea sx={{ p: 2, height: "100%" }} onClick={() => onClick(test)}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography fontWeight={500}>{test.test}</Typography>
            <Stack direction="row" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {nbOfTest} résultats
              </Typography>
              <Typography variant="body2" color="text.secondary">
                best : {test.score}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" gap={0.5} alignItems="center">
            <ScoreStreak streak={streak} />
            <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={category}
                onChange={(_e, value: TestCategory | null) => onCategoryChange?.(value)}
              >
                <ToggleButton value="psy0" sx={{ px: 1, py: 0.25, fontSize: 11 }}>
                  P0
                </ToggleButton>
                <ToggleButton value="psy1" sx={{ px: 1, py: 0.25, fontSize: 11 }}>
                  P1
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <IconButton
              size="small"
              component="a"
              href={`https://www.pilotest.com/fr/tests/${testNameToSlug(test.test)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <StanineDisplay stanine={test.stanine} />
        <Typography variant="caption">{test.at}</Typography>
      </CardActionArea>
    </Card>
  );
}

export default PtResultListItem;
