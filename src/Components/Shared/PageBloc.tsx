import { Button, Container } from "@mui/material";
import type { ReactNode } from "react";
import usePilotestSync from "../../services/usePilotestSync";

interface Props {
  children?: ReactNode;
}

function PageBloc(props: Props) {
  const { children } = props;
  const handleOnConfigure = () =>
    configure("alex.delesse.pro@gmail.com", "Wnywwuey6!A9");

  const { configure } = usePilotestSync();
  return (
    <Container>
      <Button onClick={handleOnConfigure}>Configure</Button>
      {children || <></>}
    </Container>
  );
}

export default PageBloc;
