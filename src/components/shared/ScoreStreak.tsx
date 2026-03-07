import { Box, Stack, useTheme } from "@mui/material";

interface Props {
  streak?: number;
}

export default function ScoreStreak({ streak = 4 }: Props) {
  const theme = useTheme();
  const STREAK_NUMBER = 5;
  const array = Array.from({ length: STREAK_NUMBER });
  const shallHighlight = (i: number) => i + 1 > streak;

  return (
    <Stack direction="row" gap={1}>
      {array.map((_v, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: shallHighlight(i)
              ? theme.palette.action.disabledBackground
              : theme.palette.primary.main,
            height: 24,
            width: 4,
            borderRadius: 5,
          }}
        />
      ))}
    </Stack>
  );
}
