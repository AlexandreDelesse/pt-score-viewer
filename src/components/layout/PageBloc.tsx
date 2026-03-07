import { Container } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function PageBloc({ children }: Props) {
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {children || <></>}
    </Container>
  );
}

export default PageBloc;
