import { Box, Stack } from "@mui/material";

interface ScoreStreakProps {
  streak?: number;
}
export default function ScoreStreak(props: ScoreStreakProps) {
  const { streak = 4 } = props;
  const STREAK_NUMBER = 5;

  const array = Array.from({ length: STREAK_NUMBER });
  const shallHighlight = (i: number) => i + 1 > streak;

  return (
    <Stack direction={"row"} gap={1}>
      {array.map((_v, i) => (
        <Box
          sx={{
            bgcolor: shallHighlight(i) ? "lightgray" : "navy",
            height: 24,
            width: 4,
            borderRadius: 5,
          }}
          key={i}
        />
      ))}
    </Stack>
  );
}
