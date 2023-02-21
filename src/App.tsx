import { useEffect, useState, useCallback, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
} from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import Timer from "easytimer.js";
import { ToastContainer, toast, Slide } from "react-toastify";

// Firebase
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Styles
import "./styles/App.css";
import "react-toastify/dist/ReactToastify.css";

// Components
import Home from "./Components/Home";
import Stats from "./Components/Stats";
import Subs from "./Components/Subs";
import Teams from "./Components/Teams";
import Games from "./Components/Games";
import ServiceWorkerToast from "./Components/Toasts/ServiceWorkerToast";

// utils
import { downloadGameCsv } from "./utils/getCsvData";
import { useFetchUser } from "./react-query/users";
import { useSaveGame } from "./react-query/games";
import { useGameStore } from "./store/store";
import { useAuthUser } from "./hooks/useAuthUser";
import { useGetGameDetails } from "./hooks/useGetGameDetails";
import { useAddSubEntries } from "./hooks/uesAddSubEntries";

let firebaseConfig = {
  apiKey: "AIzaSyCrkAF4y3mmQsutAmonYLVmJbhUQiYHe98",
  authDomain: "afcpl-stats.firebaseapp.com",
  databaseURL: "https://afcpl-stats.firebaseio.com",
  projectId: "afcpl-stats",
  storageBucket: "afcpl-stats.appspot.com",
  messagingSenderId: "776486237669",
  appId: "1:776486237669:web:cc37c431513793409feb0c",
  measurementId: "G-CC84WXERHT",
};

if (import.meta.env.VITE_ENV === "staging") {
  firebaseConfig = {
    apiKey: "AIzaSyDR3HjhpgdbByApMwFsMhN4pqbapKXOk9o",
    authDomain: "afcpl-stats-staging.firebaseapp.com",
    databaseURL: "https://afcpl-stats-staging.firebaseio.com",
    projectId: "afcpl-stats-staging",
    storageBucket: "afcpl-stats-staging.appspot.com",
    messagingSenderId: "929297586839",
    appId: "1:929297586839:web:e82366ea65c8a457b7e7d2",
    measurementId: "G-X5EY3MEEL8",
  };
}

export const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: "none",
  signInFlow: "popup",
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

// Instantiate a Firebase app and database
export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
// enable the offline database capability
enableIndexedDbPersistence(db)
  .then(() => console.log("Offline Database Active"))
  .catch((err) => {
    if (err.code === "failed-precondition") {
      console.error(
        "Multiple tabs open, persistence can only be enabled in one tab at a a time.",
        err
      );
    } else if (err.code === "unimplemented") {
      console.error(
        "The current browser does not support all of the features required to enable persistence",
        err
      );
    }
  });

function App() {
  const gameStarted = useGameStore((state) => state.gameStarted);
  const setGameTime = useGameStore((state) => state.setGameTime);
  const setGameTimeSeconds = useGameStore((state) => state.setGameTimeSeconds);
  const resetGameStore = useGameStore((state) => state.resetGameStore);
  const gameFinished = useGameStore((state) => state.gameFinished);
  const gameLength = useGameStore((state) => state.gameLength);
  const gameTime = useGameStore((state) => state.gameTime);
  const setPaused = useGameStore((state) => state.setPaused);
  const setGameFinished = useGameStore((state) => state.setGameFinished);
  const setGameStarted = useGameStore((state) => state.setGameStarted);

  const authUser = useAuthUser();
  const { data: userDb } = useFetchUser(authUser);

  const [serviceWorkerInit, setServiceWorkerInit] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] =
    useState<ServiceWorkerRegistration | null>(null);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.register({
    onSuccess: () => setServiceWorkerInit(true),
    onUpdate: (reg: ServiceWorkerRegistration) => {
      setServiceWorkerReg(reg);
    },
  });

  // show service worker toast on first install
  useEffect(() => {
    if (serviceWorkerInit) {
      console.log("App available for offline use.");
    }
  }, [serviceWorkerInit]);

  // allow user to update site when service worker changes and no active game
  useEffect(() => {
    if (!gameStarted && serviceWorkerReg && serviceWorkerReg.waiting) {
      toast.info(<ServiceWorkerToast serviceWorkerReg={serviceWorkerReg} />, {
        closeOnClick: false,
        autoClose: false,
      });
    }
  }, [gameStarted, serviceWorkerReg]);

  const gameTimer = useRef(
    new Timer({
      countdown: true,
      callback: (timer) => {
        const newTime = timer.getTimeValues().toString(["minutes", "seconds"]);
        const newTimeSecs = timer.getTotalTimeValues().seconds;
        setGameTime(newTime);
        setGameTimeSeconds(newTimeSecs);
      },
    })
  );

  const { mutateAsync: addGame } = useSaveGame();
  const getGameDetails = useGetGameDetails();
  const { initSubEntries } = useAddSubEntries();

  const resetGame = () => {
    gameTimer.current.stop();
    resetGameStore();
  };

  const saveGame = (gameType: "subs" | "stats") => {
    const gameDate = new Date();
    const gameDetails = getGameDetails(gameDate, gameType, userDb?.email);

    // add to the Database and show if successful
    toast.promise(addGame(gameDetails), {
      pending: "Saving Game",
      success: "Game Saved",
      error: "Error Saving Game",
    });

    // download backup data
    downloadGameCsv(gameDetails);

    resetGame();
  };

  const startTimer = useCallback(() => {
    if (gameFinished) return;
    gameTimer.current.start({
      startValues: {
        minutes: parseInt(gameTime.split(":")[0]),
        seconds: parseInt(gameTime.split(":")[1]),
      },
    });
    setPaused(false);
    if (!gameStarted && !gameFinished) {
      setGameStarted(true);
      gameTimer.current.addEventListener("targetAchieved", () => {
        console.log("Time Finished");
        setPaused(true);
        setGameFinished(true);
      });
    }
  }, [gameFinished, gameStarted, gameTime]);

  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/stats">
          {authUser ? (
            <Stats
              startTimer={startTimer}
              pauseTimer={() => gameTimer.current.pause()}
              resetTimer={() => {
                gameTimer.current.reset();
                setGameTime(`${gameLength.toString().padStart(2, "0")}:00`);
              }}
              saveGame={saveGame}
              resetGame={resetGame}
            />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/subs">
          {authUser ? (
            <Subs
              startTimer={() => {
                if (gameFinished) return;
                gameTimer.current.start({
                  startValues: { minutes: gameLength },
                });
                setPaused(false);
                if (!gameStarted && !gameFinished) {
                  setGameStarted(true);
                  gameTimer.current.addEventListener("targetAchieved", () => {
                    console.log("Time Finished");
                    setPaused(true);
                    setGameFinished(true);
                  });
                  initSubEntries();
                }
              }}
              pauseTimer={() => gameTimer.current.pause()}
              resetTimer={() => {
                gameTimer.current.reset();
                setGameTime(`${gameLength.toString().padStart(2, "0")}:00`);
              }}
              resetGame={resetGame}
              saveGame={saveGame}
            />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/teams">
          {authUser ? <Teams /> : <Redirect to="/" />}
        </Route>
        <Route path="/games">
          {authUser ? <Games /> : <Redirect to="/" />}
        </Route>
      </Switch>
      <div className="bottom-nav">
        <NavLink className="nav-link" to="/" exact activeClassName="nav-active">
          Home
        </NavLink>
        <NavLink className="nav-link" to="/stats" activeClassName="nav-active">
          Stats
        </NavLink>
        <NavLink className="nav-link" to="/subs" activeClassName="nav-active">
          Subs
        </NavLink>
        <NavLink className="nav-link" to="/teams" activeClassName="nav-active">
          Teams
        </NavLink>
        <NavLink className="nav-link" to="/games" activeClassName="nav-active">
          Games
        </NavLink>
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={false}
        hideProgressBar
        newestOnTop={false}
        rtl={false}
        draggable={false}
        pauseOnHover={false}
        transition={Slide}
      />
    </Router>
  );
}

export default App;
