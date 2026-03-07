import { Container } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function PageBloc({ children }: Props) {
  return <Container>{children || <></>}</Container>;
}

export default PageBloc;
