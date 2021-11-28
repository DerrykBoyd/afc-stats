import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import '../styles/GameList.css';
import StatTable from './StatTable';
import SubStatTable from './SubStatTable';
import { toast } from 'react-toastify';
import { getStatsCsvData, getSubsCsvData } from '../utils/getCsvData';

const statHeaders = [
  { label: 'Name', key: 'name' },
  { label: 'Touches', key: 'Touch' },
  { label: 'Points', key: 'Point' },
  { label: 'Assists', key: 'Assist' },
  { label: 'D-Plays', key: 'D-Play' },
  { label: 'Drops', key: 'Drop' },
  { label: 'Throwaways', key: 'T-Away' },
  { label: 'GSO', key: 'GSO' },
];

const combinedFileName = (str, date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${str}.csv`;
};

const DelToast = (props) => (
  <>
    <span>Game Deleted...</span>
    <button
      className="btn toast-btn"
      onClick={() => {
        props.toggleDeleteGame(props.game._id);
        props.closeToast();
      }}
    >
      Undo<i className="material-icons md-18">undo</i>
    </button>
  </>
);

const GameCard = (props) => {
  const [showStats, setShowStats] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const game = props.game;
  const gameDate = game.date.toDate();

  const {gameHistoryCsv, playerStatsCsv} = getStatsCsvData(game);
  const {subHistoryCsv, subStatsCsv} = getSubsCsvData(game);

  const generateFileName = (str) => {
    return `${gameDate.getFullYear()}-${gameDate.getMonth() + 1}-${gameDate.getDate()}-${
      game.darkTeam
    }-vs-${game.lightTeam}-${str}-${game.statTeam}.csv`;
  };

  const toggleShowStats = () => setShowStats(!showStats);

  const NoteList = (props) => {
    const notes = props.notes.map((note, index) => (
      <p className="card-note" key={index}>
        {note}
      </p>
    ));
    notes.unshift(
      <p className="card-note-title" key="note-title">
        Notes
      </p>
    );
    return <div className="card-notes">{notes}</div>;
  };

  return (
    <div className="card game-list-card">
      <div className="game-list-info">
        <span>{game.date.toDate().toDateString()}</span>
        <span>{`Stat Taker: ${game.statTaker}`}</span>
      </div>
      <div className="game-list-info">
        <span>{`${game.playerStats ? 'Stats' : 'Subs'} For: ${game.statTeam}`}</span>
        {game.testGame && <span className="test-game">Test Game</span>}
      </div>
      <div className="game-score">
        <div className="score-card score-card-games dark">
          <span id="team-name">{game.darkTeam}</span>
          {game.score && <span className="score dark">{game.score.dark}</span>}
        </div>
        <div className="score-card score-card-games light">
          <span id="team-name">{game.lightTeam}</span>
          {game.score && <span className="score light">{game.score.light}</span>}
        </div>
      </div>
      <div className="game-list-btns">
        <CSVLink
          className="btn game-list-btn"
          data={gameHistoryCsv || subHistoryCsv}
          filename={gameHistoryCsv ? generateFileName('GAME') : generateFileName('SUBS')}
          target="_blank"
        >
          {gameHistoryCsv ? `Game CSV` : 'Subs CSV'}
          <i className="material-icons md-18">get_app</i>
        </CSVLink>
        {playerStatsCsv && (
          <CSVLink
            className="btn game-list-btn"
            data={playerStatsCsv}
            headers={statHeaders}
            filename={generateFileName('STATS')}
            target="_blank"
          >
            Stats CSV
            <i className="material-icons md-18">get_app</i>
          </CSVLink>
        )}
        {subStatsCsv && (
          <CSVLink
            className="btn game-list-btn"
            data={subStatsCsv}
            filename={generateFileName('SubStats')}
            target="_blank"
          >
            Stats CSV
            <i className="material-icons md-18">get_app</i>
          </CSVLink>
        )}
        {!showStats && (
          <button className="btn game-list-btn" onClick={toggleShowStats}>
            Show Stats<i className="material-icons md-18">arrow_drop_down</i>
          </button>
        )}
        {showStats && (
          <button className="btn game-list-btn" onClick={toggleShowStats}>
            Hide Stats<i className="material-icons md-18">arrow_drop_up</i>
          </button>
        )}
      </div>
      {showStats && game.playerStats && (
        <>
          <StatTable stats={game.playerStats} />
          {game.notes && <NoteList notes={game.notes} />}
          <div className="game-card-btns">
            <button
              className="btn btn-del game-list-btn"
              onClick={() => {
                props.toggleDeleteGame(game._id);
                toast.error(<DelToast game={game} toggleDeleteGame={props.toggleDeleteGame} />, {
                  autoClose: 4000,
                  hideProgressBar: false,
                });
              }}
            >
              Delete Game
            </button>
            {!showNoteInput && (
              <button
                className="btn game-list-btn"
                onClick={() => {
                  setShowNoteInput(true);
                }}
              >
                Add Note
              </button>
            )}
          </div>
          {showNoteInput && (
            <div>
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="game-card-btns">
                <button className="btn game-list-btn" onClick={() => setShowNoteInput(false)}>
                  Cancel
                </button>
                <button
                  className="btn game-list-btn"
                  onClick={() => {
                    if (!props.game.notes) props.game.notes = [];
                    props.game.notes.push(note);
                    props.updateGame(game);
                    setShowNoteInput(false);
                    setNote('');
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {showStats && game.subStats && (
        <>
          <SubStatTable stats={game.subStats} />
          {game.notes && <NoteList notes={game.notes} />}
          <div className="game-card-btns">
            <button
              className="btn btn-del game-list-btn"
              onClick={() => {
                props.toggleDeleteGame(game._id);
                toast.error(<DelToast game={game} toggleDeleteGame={props.toggleDeleteGame} />, {
                  autoClose: 4000,
                  hideProgressBar: false,
                });
              }}
            >
              Delete Game
            </button>
            {!showNoteInput && (
              <button
                className="btn game-list-btn"
                onClick={() => {
                  setShowNoteInput(true);
                }}
              >
                Add Note
              </button>
            )}
          </div>
          {showNoteInput && (
            <div>
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="game-card-btns">
                <button className="btn game-list-btn" onClick={() => setShowNoteInput(false)}>
                  Cancel
                </button>
                <button
                  className="btn game-list-btn"
                  onClick={() => {
                    if (!props.game.notes) props.game.notes = [];
                    props.game.notes.push(note);
                    props.updateGame(game);
                    setShowNoteInput(false);
                    setNote('');
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GameList = (props) => {
  const showGames = props.games.filter((game) => !game.deleted);
  const games = showGames.map((game) => (
    <GameCard
      key={game.date}
      game={game}
      updateGame={props.updateGame}
      toggleDeleteGame={props.toggleDeleteGame}
    />
  ));
  return <div className="team-list">{games}</div>;
};

const CombinedCSV = (props) => {
  const [CSVDate, setCSVDate] = useState('');
  const [wkNum, setWkNum] = useState('');
  const [combinedStats, setCombinedStats] = useState([]);

  const combinedHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'GM', key: 'GM' },
    { label: 'Vs', key: 'VS' },
    { label: 'Week', key: 'Week' },
    { label: 'Touches', key: 'Touch' },
    { label: 'Points', key: 'Point' },
    { label: 'Assists', key: 'Assist' },
    { label: 'D-Plays', key: 'D-Play' },
    { label: 'Drops', key: 'Drop' },
    { label: 'Throwaways', key: 'T-Away' },
    { label: 'GSO', key: 'GSO' },
  ];

  let dateOptions = new Set();

  dateOptions.add('');

  for (let game of props.games) {
    if (!game.playerStats) continue;
    let gameDate = game.date.toDate();
    dateOptions.add(gameDate.toDateString());
  }

  const DateOptions = (props) => {
    let options = [];
    for (let option of props.options) {
      options.push(
        <option key={option} value={option}>
          {option}
        </option>
      );
    }
    return options;
  };

  const handleSelect = (e) => {
    setCSVDate(e.target.value);
    let newCombinedStats = [];
    for (let game of props.games) {
      let gameDate = game.date.toDate().toDateString();
      if (gameDate === e.target.value && game.playerStats) {
        for (let stat of game.playerStats) {
          if (!stat.GM) stat.GM = '';
          if (!stat.VS) stat.VS = '';
          stat.Week = wkNum;
          newCombinedStats.push(stat);
        }
      }
    }
    setCombinedStats(newCombinedStats);
  };

  const handleWkNumChange = (e) => {
    setWkNum(e.target.value);
    let newCombinedStats = [...combinedStats];
    for (let stat of newCombinedStats) {
      stat.Week = e.target.value;
    }
    setCombinedStats(newCombinedStats);
  };

  return (
    <div className="combined-csv-options">
      <div className="select-title">Select Date</div>
      <select value={CSVDate} onChange={handleSelect}>
        <DateOptions options={dateOptions} />
      </select>
      {CSVDate && (
        <>
          <div className="select-title">Enter Week Number</div>
          <input value={wkNum} onChange={handleWkNumChange} />
          <CSVLink
            className="btn game-list-btn"
            data={combinedStats}
            headers={combinedHeaders}
            filename={combinedFileName('Combined-playerStats', new Date(CSVDate))}
          >
            Combined Stats
            <i className="material-icons md-18">get_app</i>
          </CSVLink>
        </>
      )}
    </div>
  );
};

export default function Games(props) {
  const [showCombinedCSV, setShowCombinedCSV] = useState(false);

  let db = props.db;

  const getGames = () => {
    let newGames = [...props.allGameHistory];
    db.collection('games')
      .orderBy('date')
      .startAfter(props.allGameHistory[0].date)
      .get()
      .then((results) =>
        results.forEach((res) => {
          newGames.unshift(res.data());
        })
      )
      .then(props.setAllGameHistory(newGames));
  };

  const loadMoreGames = () => {
    let newGames = [...props.allGameHistory];
    db.collection('games')
      .orderBy('date', 'desc')
      .startAfter(props.lastGame)
      .limit(10)
      .get()
      .then((snap) => {
        snap.forEach((doc) => {
          newGames.push(doc.data());
        });
        snap.docs.length === 10
          ? props.setLastGame(snap.docs[snap.docs.length - 1])
          : props.setLastGame(null);
        props.setAllGameHistory(newGames);
      });
  };

  const toggleDeleteGame = (id) => {
    // update local state
    let newAllHistory = [...props.allGameHistory];
    for (let game of newAllHistory) {
      if (game._id === id) game.deleted = !game.deleted;
      continue;
    }
    props.setAllGameHistory(newAllHistory);
    // save to the DB
    let gameRef = db.collection('games').doc(id);

    gameRef
      .update({
        deleted: true,
      })
      .then((_) => console.log('Game Deleted'))
      .catch((err) => console.log(err));
  };

  const updateGame = (game) => {
    console.log('Updating game ' + game);
    let newGames = [...props.allGameHistory];
    let gameInd = newGames.findIndex((el) => el._id === game._id);
    newGames[gameInd] = game;
    props.setAllGameHistory(newGames);
    db.collection('games').doc(game._id).update({
      notes: game.notes,
    });
    db.get(game._id)
      .then((doc) => {
        doc.notes = game.notes;
        return db.put(doc);
      })
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleCombinedCSV = () => {
    setShowCombinedCSV(!showCombinedCSV);
  };

  return (
    <div className="App">
      <h1 className="page-header">
        <div>Recorded Games</div>
        <button className="btn game-list-btn header-btn" onClick={toggleCombinedCSV}>
          Combined CSV
          {!showCombinedCSV && <i className="material-icons md-18">arrow_drop_down</i>}
          {showCombinedCSV && <i className="material-icons md-18">arrow_drop_up</i>}
        </button>
        <button className="btn game-list-btn header-btn" onClick={getGames}>
          Refresh <i className="material-icons md-18">autorenew</i>
        </button>
      </h1>
      {showCombinedCSV && <CombinedCSV games={props.allGameHistory} teams={props.teams} />}
      <GameList
        games={props.allGameHistory}
        updateGame={updateGame}
        toggleDeleteGame={toggleDeleteGame}
      />
      {props.lastGame && (
        <button
          className="btn game-list-btn"
          onClick={loadMoreGames}
          style={{ marginBottom: '1rem' }}
        >
          Load More <i className="material-icons md-18">get_app</i>
        </button>
      )}
    </div>
  );
}
