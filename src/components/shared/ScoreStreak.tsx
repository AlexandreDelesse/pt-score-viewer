import { Box, Stack, useTheme } from "@mui/material";

interface Props {
  streak?: number;
  size?: "sm" | "md";
}

const SIZES = {
  sm: { height: 14, width: 3, gap: 0.5 },
  md: { height: 24, width: 4, gap: 1 },
};

export default function ScoreStreak({ streak = 4, size = "md" }: Props) {
  const theme = useTheme();
  const STREAK_NUMBER = 5;
  const array = Array.from({ length: STREAK_NUMBER });
  const shallHighlight = (i: number) => i + 1 > streak;
  const { height, width, gap } = SIZES[size];

  return (
    <Stack direction="row" gap={gap}>
      {array.map((_v, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: shallHighlight(i)
              ? theme.palette.action.disabledBackground
              : theme.palette.primary.main,
            height,
            width,
            borderRadius: 5,
          }}
        />
      ))}
    </Stack>
  );
}
