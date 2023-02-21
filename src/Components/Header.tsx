import { useState } from "react";
import { firebaseApp } from "../App";
import "../styles/Header.css";

export default function Header() {
  const [seenModal, setSeenModal] = useState(
    sessionStorage.getItem("seenStagingModal") === "true"
  );

  const signOut = () => {
    firebaseApp.auth().signOut();
    localStorage.clear();
  };

  return (
    <>
      <header className="app-header">
        <h1>{`AFC PL Stats`}</h1>
        {firebaseApp.auth().currentUser && (
          <button className="btn logout-btn" onClick={signOut}>
            Logout
          </button>
        )}
      </header>
      {window.location.origin.includes("staging--") ? (
        <>
          <h1>** STAGING SITE **</h1>
          {seenModal ? null : (
            <div className="staging-modal">
              <h2>This is the staging site for testing only.</h2>
              <p>
                If you are taking stats for premier league go to the{" "}
                <a href="https://afc-stats.netlify.app/">Live Site</a>
              </p>
              <a href="https://afc-stats.netlify.app/">
                <button className="btn">Go to real app</button>
              </a>
              <button
                className="btn btn-del"
                onClick={() => {
                  setSeenModal(true);
                  sessionStorage.setItem("seenStagingModal", "true");
                }}
              >
                Go to test app
              </button>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
