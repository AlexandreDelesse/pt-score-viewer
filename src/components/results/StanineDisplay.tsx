import { Box, Stack } from "@mui/material";
import { getStanineColor } from "../../utils/scoreTools";

interface Props {
  stanine: number;
}

function StanineDisplay({ stanine }: Props) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const fixedStanine = parseInt(stanine.toFixed(0));

  return (
    <Stack direction="row" spacing={{ xs: 1, sm: 2 }} p={{ xs: 1, sm: 2 }} mt={1}>
      {numbers.map((n) =>
        fixedStanine === n ? (
          <Box key={n} sx={{ fontSize: 36, alignSelf: "center", color: getStanineColor(n) }}>
            {fixedStanine}
          </Box>
        ) : (
          <Box key={n} sx={{ fontSize: 12, alignSelf: "center", color: "inherit" }}>
            {n}
          </Box>
        )
      )}
    </Stack>
  );
}

export default StanineDisplay;
