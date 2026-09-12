import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

// Habillage commun à tous les blocs du Dashboard (icône + titre + contenu),
// pour que chaque section se lise comme une carte du même système plutôt
// qu'un mélange de Box/Accordion aux styles différents.
function DashboardCard({ icon, title, action, children }: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={1.5}>
          {icon}
          <Typography fontWeight={600}>{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
