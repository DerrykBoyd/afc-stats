import { Link } from "react-router-dom";
import "../styles/Home.css";
import Header from "./Header";

// Firebase
import SFB from "react-firebaseui/StyledFirebaseAuth";
import { useFetchUser } from "../react-query/users";
import { firebaseApp, uiConfig } from "../App";
import { useAuthUser } from "../hooks/useAuthUser";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const StyledFirebaseAuth = SFB.default ? SFB.default : SFB;

export default function Home() {
  const authUser = useAuthUser();
  const { data: dbUser, isInitialLoading } = useFetchUser(authUser);

  if (isInitialLoading) return <div>Loading...</div>;

  return (
    <div className="App">
      <Header />
      <div className="home-content">
        {!authUser && (
          <StyledFirebaseAuth
            uiConfig={uiConfig}
            firebaseAuth={firebaseApp.auth()}
          />
        )}
        {dbUser && (
          <>
            <p>{`Welcome, ${dbUser.name || dbUser.email}`}</p>
            <div className="home-btn-group">
              <Link className="btn" to="/stats">
                Stats
              </Link>
              <Link className="btn" to="/subs">
                Subs
              </Link>
              <Link className="btn" to="/teams">
                Teams
              </Link>
              <Link className="btn" to="/games">
                Past Games
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
