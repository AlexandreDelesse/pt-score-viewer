import { Container } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function PageBloc(props: Props) {
  const { children } = props;

  return <Container>{children || <></>}</Container>;
}

export default PageBloc;
