import { Box, Stack } from "@mui/material";

interface Props {
  stanine: number;
}

function StanineDisplay(props: Props) {
  const { stanine } = props;
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const getStanineColor = (stanine: number) => {
    const colors = [
      "#b33939", // 1 - Rouge mat
      "#cd533b", // 2
      "#d87b5a", // 3 - Orange brûlé
      "#d8a657", // 4 - Ocre
      "#c7b98b", // 5 - Taupe ton chaud
      "#8aa87f", // 6 - Vert olive doux
      "#5d8c61", // 7 - Vert mat
      "#3e7c59", // 8 - Vert foncé mat
      "#2d5d4d", // 9 - Vert sapin profond
    ];

    return colors[stanine - 1] ?? "#9e9e9e"; // fallback gris
  };

  const fixedStanine = parseInt(stanine.toFixed(0));

  return (
    <Stack direction={"row"} spacing={2} p={2} mt={1}>
      {numbers.map((n) =>
        Math.trunc(stanine) == n ? (
          <Box
            key={n}
            sx={{
              fontSize: 36,
              alignSelf: "center",
              color: getStanineColor(n),
            }}
          >
            {stanine.toFixed(1)}
          </Box>
        ) : (
          <Box
            key={n}
            sx={{
              fontSize: 12,
              alignSelf: "center",
              color: "inherit",
            }}
          >
            {n}
          </Box>
        )
      )}
    </Stack>
  );
}

export default StanineDisplay;
