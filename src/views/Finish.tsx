import { Container } from "react-bootstrap";
import { Tokens } from "../types/AppTypes";
import Logout from "./Logout";

function Finish({
  apiUrl,
  isLoggedIn,
  setIsLoggedIn,
  setLoggedAs,
  tokens,
  setTokens,
}: {
  apiUrl: string;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setLoggedAs: React.Dispatch<React.SetStateAction<string>>;
  tokens: Tokens;
  setTokens: React.Dispatch<React.SetStateAction<Tokens>>;
}) {
  return (
    <Container>
      <h1>Thank you!</h1>
      <p>
        Thank you for participating in this experiment. Your task is done! You
        can close this browser tab now.
      </p>
      <Logout
        apiUrl={apiUrl}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setLoggedAs={setLoggedAs}
        tokens={tokens}
        setTokens={setTokens}
      />
    </Container>
  );
}

export default Finish;
