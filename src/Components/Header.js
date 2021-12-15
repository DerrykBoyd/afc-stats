import React from 'react';
import '../styles/Header.css';

export default function Header(props) {
  const [modalOpen, setModalOpen] = React.useState(process.env.REACT_APP_ENV === 'staging');
  const signOut = () => {
    props.firebaseApp.auth().signOut();
    localStorage.clear();
  };

  return (
    <>
      <header className="app-header">
        <h1>{`AFC PL Stats`}</h1>
        {props.firebaseApp.auth().currentUser && (
          <button className="btn logout-btn" onClick={signOut}>
            Logout
          </button>
        )}
      </header>
      {process.env.REACT_APP_ENV === 'staging' && (
        <>
          <h1>** STAGING SITE **</h1>
          {modalOpen && (
            <div class="staging-modal">
              <h2>This is the staging site for testing only.</h2>
              <p>
                If you are taking stats for premier league go to the{' '}
                <a href="https://afc-stats.netlify.app/">Live Site</a>
              </p>
              <a href="https://afc-stats.netlify.app/">
                <button className="btn">Go to live site</button>
              </a>
              <button className="btn btn-del" onClick={() => setModalOpen(false)}>
                Continue to test
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
