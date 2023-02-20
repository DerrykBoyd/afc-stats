import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import Header from "./Header";

// Firebase
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { useFetchUser } from "../react-query/users";
import { User } from "firebase/auth";
import { firebaseApp, uiConfig } from "../App";

interface Props {
  user: User;
}

export default function Home({ user }: Props) {
  const { data: dbUser } = useFetchUser(user);

  return (
    <div className="App">
      <Header />
      <div className="home-content">
        {!dbUser && (
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
