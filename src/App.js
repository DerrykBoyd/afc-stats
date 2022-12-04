import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, NavLink } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import Timer from 'easytimer.js';
import { ToastContainer, cssTransition, toast } from 'react-toastify';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Styles
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Home from './Components/Home';
import Stats from './Components/Stats';
import Subs from './Components/Subs';
import Teams from './Components/Teams';
import Games from './Components/Games';
import ServiceWorkerToast from './Components/Toasts/ServiceWorkerToast';

// assets
import defaultProfile from './assets/profile-avatars/050.svg';

// utils
import { downloadGameCsv } from '../src/utils/getCsvData';

const Timestamp = firebase.firestore.Timestamp;

const Slide = cssTransition({
  enter: 'toast-in',
  exit: 'toast-out',
  duration: [500, 100],
});

let firebaseConfig = {
  apiKey: 'AIzaSyCrkAF4y3mmQsutAmonYLVmJbhUQiYHe98',
  authDomain: 'afcpl-stats.firebaseapp.com',
  databaseURL: 'https://afcpl-stats.firebaseio.com',
  projectId: 'afcpl-stats',
  storageBucket: 'afcpl-stats.appspot.com',
  messagingSenderId: '776486237669',
  appId: '1:776486237669:web:cc37c431513793409feb0c',
  measurementId: 'G-CC84WXERHT',
};

if (process.env.REACT_APP_ENV === 'staging') {
  firebaseConfig = {
    apiKey: 'AIzaSyDR3HjhpgdbByApMwFsMhN4pqbapKXOk9o',
    authDomain: 'afcpl-stats-staging.firebaseapp.com',
    databaseURL: 'https://afcpl-stats-staging.firebaseio.com',
    projectId: 'afcpl-stats-staging',
    storageBucket: 'afcpl-stats-staging.appspot.com',
    messagingSenderId: '929297586839',
    appId: '1:929297586839:web:e82366ea65c8a457b7e7d2',
    measurementId: 'G-X5EY3MEEL8',
  };
}

const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: 'none',
  signInFlow: 'popup',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

// Instantiate a Firebase app and database
const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();
// enable the offline database capability
db.enablePersistence()
  .then(() => console.log('Offline Database Active'))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error(
        'Multiple tabs open, persistence can only be enabled in one tab at a a time.',
        err
      );
    } else if (err.code === 'unimplemented') {
      console.error(
        'The current browser does not support all of the features required to enable persistence',
        err
      );
    }
  });

function App() {
  // set state (global)
  const [gameTime, setGameTime] = useState(localStorage.getItem('gameTime') || '00:00');
  const [gameTimeSecs, setGameTimeSecs] = useState(localStorage.getItem('gameTimeSecs') || 0);
  const [darkTeam, setDarkTeam] = useState(localStorage.getItem('darkTeam') || ''); //test str Dark
  const [dbUser, setDbUser] = useState(null);
  const [fetchedGames, setFetchedGames] = useState([]);
  const [gameFinished, setGameFinished] = useState(localStorage.getItem('gameFinished') === 'true');
  const [gameFormat, setGameFormat] = useState(6); // number of players per team, default 6
  const [gameLength, setGameLength] = useState(localStorage.getItem('gameLength') || 25); //1 for testing
  const [gameStarted, setGameStarted] = useState(localStorage.getItem('gameStarted') === 'true');
  const [gameHistory, setGameHistory] = useState(
    JSON.parse(localStorage.getItem('gameHistory')) || []
  );
  const [lastGame, setLastGame] = useState(null);
  const [lightTeam, setLightTeam] = useState(localStorage.getItem('lightTeam') || ''); // test str Light Team
  const [offense, setOffense] = useState(localStorage.getItem('offense') === 'true');
  const [playerStats, setPlayerStats] = useState(
    JSON.parse(localStorage.getItem('playerStats')) || []
  );
  const [score, setScore] = useState(
    JSON.parse(localStorage.getItem('score')) || {
      dark: 0,
      light: 0,
    }
  );
  const [statTeam, setStatTeam] = useState(localStorage.getItem('statTeam') || ''); //test str Dark or Light
  const [testGame, setTestGame] = useState(localStorage.getItem('testGame') === 'true');

  const [paused, setPaused] = useState(localStorage.getItem('paused') === 'true');
  const [showStatSetup, setShowStatSetup] = useState(
    localStorage.getItem('showStatSetup') === 'true'
  ); //set false for testing
  const [showSubSetup, setShowSubSetup] = useState(localStorage.getItem('showSubSetup') === 'true'); ////set false for testing
  const [teams, setTeams] = useState([]);

  // state for sub page
  const [subStats, setSubStats] = useState(JSON.parse(localStorage.getItem('subStats')) || []);
  const [subInSelected, setSubInSelected] = useState(
    localStorage.getItem('subInSelected') === 'true'
  );
  const [subOutSelected, setSubOutSelected] = useState(
    localStorage.getItem('subOutSelected') === 'true'
  );
  const [subPlayerSelected, setSubPlayerSelected] = useState(
    localStorage.getItem('subPlayerSelected') || ''
  );
  const [subHistory, setSubHistory] = useState(
    JSON.parse(localStorage.getItem('subHistory')) || []
  );

  const [serviceWorkerInit, setServiceWorkerInit] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] = useState(null);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.register({
    onSuccess: () => setServiceWorkerInit(true),
    onUpdate: (reg) => {
      setServiceWorkerReg(reg);
    },
  });

  // show service worker toast on first install
  useEffect(() => {
    if (serviceWorkerInit) {
      console.log('App available for offline use.');
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
        let newTime = timer.getTimeValues().toString(['minutes', 'seconds']);
        let newTimeSecs = timer.getTotalTimeValues().seconds;
        localStorage.setItem('gameTime', newTime);
        localStorage.setItem('curTimeSecs', newTimeSecs);
        setGameTime(newTime);
        setGameTimeSecs(newTimeSecs);
      },
    })
  );

  const loadUser = useCallback(() => {
    // get user from localStorage if loaded already
    if (
      localStorage.getItem('dbUser') !== 'null' &&
      localStorage.getItem('dbUser') !== 'undefined'
    ) {
      return;
    }
    if (!user.uid) return;
    // get the user from the db and load into state
    // add the user to the database if doesn't exist
    db.collection('users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          let newDbUser = doc.data();
          setDbUser(newDbUser);
          console.log('User fetched from database');
        } else {
          let newDbUser = {
            email: user.email,
            name: user.displayName || '',
            profileURL: user.photoURL || defaultProfile,
            uid: user.uid,
          };
          db.collection('users').doc(user.uid).set(newDbUser);
          setDbUser(newDbUser);
        }
      })
      .catch((error) => console.error('Error loading User', error));
  }, [user]);

  // load games on first load
  useEffect(() => {
    if (!user) return;
    let newGames = [];
    db.collection('games')
      .orderBy('date', 'desc')
      .limit(10)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.docs.length === 10)
          setLastGame(querySnapshot.docs[querySnapshot.docs.length - 1]);
        querySnapshot.forEach((doc) => {
          newGames.push(doc.data());
        });
        setFetchedGames(newGames);
        console.log('First 10 Games Loaded');
      });
  }, [user]);

  // listen for realtime updates to dbUser and teams if loaded
  useEffect(() => {
    // add listeners
    let updateUser = null;
    let updateTeams = null;
    if (user) {
      console.log('Adding snapshot listeners');
      updateTeams = db.collection('teams').onSnapshot((querySnapShot) => {
        let newTeams = [...teams];
        querySnapShot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let addedTeam = change.doc.data();
            // add to teams if not included
            if (newTeams.findIndex((team) => team._id === addedTeam._id) === -1) {
              if (!addedTeam.deleted) {
                newTeams.push(addedTeam);
                setTeams(newTeams);
                console.log(`${addedTeam.name} - added`);
              }
            }
          }
          if (change.type === 'modified') {
            let changedTeam = change.doc.data();
            let newTeams = [...teams];
            let changeInd = newTeams.findIndex((team) => team._id === changedTeam._id);
            // check if deleted and remove from state
            if (changedTeam.deleted) {
              if (changeInd !== -1) {
                newTeams.splice(changeInd, 1);
                setTeams(newTeams);
              }
            } else {
              // update the team info for other changes
              // add to state if not included
              if (changeInd === -1) {
                newTeams.push(changedTeam);
              } else {
                newTeams[changeInd] = changedTeam;
              }
              setTeams(newTeams);
            }
            console.log(`${change.doc.id} - changed`);
          }
          if (change.type === 'removed') {
            let changedTeam = change.doc.data();
            let changeInd = newTeams.findIndex((team) => team._id === changedTeam._id);
            newTeams.splice(changeInd, 1);
            setTeams(newTeams);
            console.log(`${change.doc.id} - removed`);
          }
        });
      });
      updateUser = db
        .collection('users')
        .doc(user.uid)
        .onSnapshot((doc) => {
          setDbUser(doc.data());
        });
    }
    return () => {
      if (updateUser !== null) {
        console.log('Removing snapshot listeners');
        updateUser();
        updateTeams();
      }
    };
  }, [user, teams]);

  useEffect(() => {
    // show toast for successful update
    if (localStorage.getItem('serviceWorkerUpdated') === 'true') {
      toast.success('Site Updated');
      localStorage.setItem('serviceWorkerUpdated', 'false');
    }
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        // user signed in
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // user signed out
        localStorage.removeItem('user');
        localStorage.removeItem('dbUser');
        setUser(user);
        setDbUser(null);
        setFetchedGames([]);
        setTeams([]);
        removeLocalGame();
      }
    });
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) {
      loadUser();
    }
  }, [user, loadUser]);

  // save game variables to localstorage to allow continuation of games on page reload
  useEffect(() => {
    localStorage.setItem('gameTime', gameTime);
    localStorage.setItem('gameTimeSecs', gameTimeSecs);
    localStorage.setItem('darkTeam', darkTeam);
    localStorage.setItem('dbUser', JSON.stringify(dbUser));
    localStorage.setItem('fetchedGames', JSON.stringify(fetchedGames));
    localStorage.setItem('gameFinished', gameFinished);
    localStorage.setItem('gameFormat', gameFormat);
    localStorage.setItem('gameLength', gameLength);
    localStorage.setItem('gameStarted', gameStarted);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    localStorage.setItem('lightTeam', lightTeam);
    localStorage.setItem('offense', offense);
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
    localStorage.setItem('score', JSON.stringify(score));
    localStorage.setItem('statTeam', statTeam);
    localStorage.setItem('testGame', testGame);
    localStorage.setItem('paused', paused);
    localStorage.setItem('showStatSetup', showStatSetup);
    localStorage.setItem('showSubSetup', showSubSetup);
    localStorage.setItem('subStats', JSON.stringify(subStats));
    localStorage.setItem('subInSelected', subInSelected);
    localStorage.setItem('subOutSelected', subOutSelected);
    localStorage.setItem('subPlayerSelected', subPlayerSelected);
    localStorage.setItem('subHistory', JSON.stringify(subHistory));
  }, [
    darkTeam,
    dbUser,
    fetchedGames,
    gameFinished,
    gameFormat,
    gameHistory,
    gameLength,
    gameStarted,
    gameTime,
    gameTimeSecs,
    lightTeam,
    offense,
    paused,
    playerStats,
    score,
    showStatSetup,
    showSubSetup,
    statTeam,
    subHistory,
    subInSelected,
    subOutSelected,
    subPlayerSelected,
    subStats,
    testGame,
  ]);

  // finish the game setup and set state for stat taking
  const finishSetup = (time, dark, light, statTeam, offense, gameFormat) => {
    setGameLength(parseInt(time));
    setGameTime(`${gameLength.toString().padStart(2, 0)}:00`);
    setDarkTeam(dark);
    setLightTeam(light);
    setStatTeam(statTeam);
    setGameFormat(parseInt(gameFormat[0]));
    let opponent = statTeam === dark ? light : dark;
    let opponentTeam = teams.find((team) => team.name === opponent);
    offense === 'subs' ? setShowSubSetup(false) : setShowStatSetup(false);
    let findTeam = teams.find((team) => team.name === statTeam);
    if (offense === 'subs') {
      let initSubsStats = [];
      for (let player of findTeam.players) {
        initSubsStats.push({
          name: player,
          timeOnField: 0,
          lastTimeIn: `${time}:00`,
          shiftLengths: [],
        });
      }
      setSubStats(initSubsStats);
    } else {
      setOffense(offense);
      let initPlayerStats = [];
      for (let player of findTeam.players) {
        initPlayerStats.push({
          name: player,
          GM: findTeam.gm || '',
          VS: opponentTeam.gm || '',
          Touch: 0,
          Assist: 0,
          Point: 0,
          'T-Away': 0,
          Drop: 0,
          'D-Play': 0,
          GSO: 0,
          'GSO-Mark': 0,
        });
      }
      setPlayerStats(initPlayerStats);
    }
  };

  const removeLocalGame = () => {
    toast.dismiss();
    localStorage.removeItem('activePoint');
    localStorage.removeItem('activeTimeOut');
    localStorage.removeItem('gameTime');
    localStorage.removeItem('gameTimeSecs');
    localStorage.removeItem('darkTeam');
    localStorage.removeItem('gameFinished');
    localStorage.removeItem('gameFormat');
    localStorage.removeItem('gameLength');
    localStorage.removeItem('gameStarted');
    localStorage.removeItem('gameHistory');
    localStorage.removeItem('lightTeam');
    localStorage.removeItem('offense');
    localStorage.removeItem('playerStats');
    localStorage.removeItem('score');
    localStorage.removeItem('statTeam');
    localStorage.removeItem('testGame');
    localStorage.removeItem('showStatSetup');
    localStorage.removeItem('showSubSetup');
    localStorage.removeItem('subStats');
    localStorage.removeItem('subInSelected');
    localStorage.removeItem('subOutSelected');
    localStorage.removeItem('subPlayerSelected');
    localStorage.removeItem('subHistory');
    localStorage.setItem('paused', 'true');
    // reset the state variables
    resetGame();
  };

  const resetGame = () => {
    setGameLength(25);
    setGameTimeSecs(0);
    gameTimer.current.stop();
    setDarkTeam('');
    setLightTeam('');
    setStatTeam('');
    setShowStatSetup(true);
    setShowSubSetup(true);
    setPlayerStats([]);
    setSubStats([]);
    setGameHistory([]);
    setSubHistory([]);
    setGameStarted(false);
    setGameFinished(false);
    setSubPlayerSelected('');
    setSubInSelected(false);
    setSubOutSelected(false);
    setPaused(false);
    setTestGame(false);
    setScore({
      dark: 0,
      light: 0,
    });
  };

  const saveGame = (gameType) => {
    const gameDate = new Date();
    const gameDetails = {
      _id: gameDate.toISOString(),
      date: Timestamp.fromDate(gameDate),
      docType: gameType,
      darkTeam: darkTeam,
      lightTeam: lightTeam,
      statTeam: statTeam,
      gameLength: gameLength,
      testGame: testGame,
      statTaker: dbUser.email,
    };
    if (gameType === 'stats') {
      gameDetails.playerStats = playerStats;
      gameDetails.score = score;
      gameDetails.gameHistory = gameHistory;
    }
    if (gameType === 'subs') {
      gameDetails.subStats = subStats;
      gameDetails.subHistory = subHistory;
    }
    const newFetchedGames = [...fetchedGames];
    newFetchedGames.unshift(gameDetails);
    setFetchedGames(newFetchedGames);
    // add to the Database
    db.collection('games').doc(gameDetails._id).set(gameDetails);

    // download backup data
    downloadGameCsv(gameDetails);

    resetGame();
  };

  const toggleOffense = () => {
    setOffense(!offense);
  };

  const initSubHistory = () => {
    // add the first 4 players to the subHistory
    let newSubHistory = [];
    let time = new Date();
    for (let i = 0; i < 4; i++) {
      newSubHistory.push({
        date: time.toDateString(),
        time: time.toTimeString(),
        gameTime: gameTime,
        darkTeam: darkTeam,
        lightTeam: lightTeam,
        statTeam: statTeam,
        player: subStats[i].name,
        action: 'In',
        timeOnField: '',
      });
    }
    setSubHistory(newSubHistory);
  };

  const addSubHistory = (playerIn, playerOut, timeOn) => {
    // add an entry to the subHistory
    let newSubHistory = [...subHistory];
    let time = new Date();
    let inEntry = {
      date: time.toDateString(),
      time: time.toTimeString(),
      gameTime: gameTime,
      darkTeam: darkTeam,
      lightTeam: lightTeam,
      statTeam: statTeam,
      player: playerIn,
      action: 'In',
      timeOnField: '',
    };
    let outEntry = {
      date: time.toDateString(),
      time: time.toTimeString(),
      gameTime: gameTime,
      darkTeam: darkTeam,
      lightTeam: lightTeam,
      statTeam: statTeam,
      player: playerOut,
      action: 'Out',
      timeOnField: timeOn,
    };
    newSubHistory.push(outEntry, inEntry);
    setSubHistory(newSubHistory);
  };

  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home db={db} firebaseApp={firebaseApp} uiConfig={uiConfig} dbUser={dbUser} />
        </Route>
        <Route path="/stats">
          {user ? (
            <Stats
              userID={user.email}
              teams={teams}
              showStatSetup={showStatSetup}
              showSubSetup={showSubSetup}
              finishSetup={finishSetup}
              gameLength={gameLength}
              darkTeam={darkTeam}
              lightTeam={lightTeam}
              statTeam={statTeam}
              offense={offense}
              score={score}
              setScore={setScore}
              gameHistory={gameHistory}
              setGameHistory={setGameHistory}
              gameTime={gameTime}
              startTimer={() => {
                if (gameFinished) return;
                gameTimer.current.start({
                  startValues: {
                    minutes: parseInt(gameTime.split(':')[0]),
                    seconds: parseInt(gameTime.split(':')[1]),
                  },
                });
                setPaused(false);
                if (!gameStarted && !gameFinished) {
                  setGameStarted(true);
                  gameTimer.current.addEventListener('targetAchieved', (e) => {
                    console.log('Time Finished');
                    setPaused(true);
                    setGameFinished(true);
                  });
                }
              }}
              pauseTimer={() => gameTimer.current.pause()}
              stopTimer={() => gameTimer.current.stop()}
              resetTimer={() => {
                gameTimer.current.reset();
                setGameTime(`${gameLength.toString().padStart(2, 0)}:00`);
              }}
              paused={paused}
              setPaused={setPaused}
              playerStats={playerStats}
              setPlayerStats={setPlayerStats}
              toggleOffense={toggleOffense}
              testGame={testGame}
              setTestGame={setTestGame}
              saveGame={saveGame}
              resetGame={resetGame}
            />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/subs">
          {user ? (
            <Subs
              userID={user.email}
              teams={teams}
              darkTeam={darkTeam}
              lightTeam={lightTeam}
              statTeam={statTeam}
              finishSetup={finishSetup}
              setTestGame={setTestGame}
              showSubSetup={showSubSetup}
              showStatSetup={showStatSetup}
              gameFormat={gameFormat}
              gameLength={gameLength}
              gameTime={gameTime}
              startTimer={() => {
                if (gameFinished) return;
                gameTimer.current.start({ startValues: { minutes: gameLength } });
                setPaused(false);
                if (!gameStarted && !gameFinished) {
                  setGameStarted(true);
                  gameTimer.current.addEventListener('targetAchieved', (e) => {
                    console.log('Time Finished');
                    setPaused(true);
                    setGameFinished(true);
                  });
                  initSubHistory();
                }
              }}
              pauseTimer={() => gameTimer.current.pause()}
              stopTimer={() => gameTimer.current.stop()}
              resetTimer={() => {
                gameTimer.current.reset();
                setGameTime(`${gameLength.toString().padStart(2, 0)}:00`);
              }}
              paused={paused}
              setPaused={setPaused}
              subStats={subStats}
              setSubStats={setSubStats}
              subInSelected={subInSelected}
              setSubInSelected={setSubInSelected}
              subOutSelected={subOutSelected}
              setSubOutSelected={setSubOutSelected}
              subPlayerSelected={subPlayerSelected}
              setSubPlayerSelected={setSubPlayerSelected}
              addSubHistory={addSubHistory}
              resetGame={resetGame}
              saveGame={saveGame}
            />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/teams">
          {user ? <Teams teams={teams} setTeams={setTeams} db={db} /> : <Redirect to="/" />}
        </Route>
        <Route path="/games">
          {user ? (
            <Games
              allGameHistory={fetchedGames}
              db={db}
              lastGame={lastGame}
              setAllGameHistory={setFetchedGames}
              setLastGame={setLastGame}
              teams={teams}
            />
          ) : (
            <Redirect to="/" />
          )}
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
        transition={Slide}
        autoClose={false}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnVisibilityChange={false}
        draggable={false}
        pauseOnHover={false}
      />
    </Router>
  );
}

export default App;
