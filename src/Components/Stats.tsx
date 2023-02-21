import { MouseEvent, useState } from "react";
import GameSetup from "./GameSetup";
import GameInfo from "./GameInfo";
import StatPlayerList from "./StatPlayerList";
import "../styles/Stats.css";
import { toast } from "react-toastify";
import { useGameStore } from "../store/store";

export interface StatsSubsProps {
  resetGame: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  saveGame: (gameType: "stats" | "subs") => void;
}

export default function Stats({
  resetGame,
  startTimer,
  pauseTimer,
  resetTimer,
  saveGame,
}: StatsSubsProps) {
  const {
    showStatSetup,
    gameHistory,
    paused,
    isOffense,
    score,
    setScore,
    statTeam,
    darkTeam,
    gameTime,
    lightTeam,
    playerStats,
    setPlayerStats,
    setGameHistory,
    toggleOffense,
    showSubSetup,
    testGame,
    gameType,
  } = useGameStore();
  // show warning on page reload attempt during game
  window.onbeforeunload = (e) => {
    if (!showStatSetup) e.returnValue = "Game will not be saved.";
  };

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [prevEntry, setPrevEntry] = useState({
    action: "",
    player: "",
    turnover: false,
  });

  const handleStatClick = (
    e: MouseEvent<HTMLButtonElement>,
    player = "",
    turnover = true
  ) => {
    // start timer automatically if not started already
    if (!gameHistory.length || paused) startTimer();
    toast.dismiss();
    const action = e.currentTarget.name;
    // set the game history
    const newHistory = [...gameHistory];
    // get the last entry and set player if available
    const lastEntry = newHistory[newHistory.length - 1] || "";
    const secLastEntry = newHistory[newHistory.length - 2] || "";
    let lastPlayer = "";
    let secLastPlayer = "";

    // set last throwers for Point and Drop
    if (lastEntry && (action === "Point" || action === "Drop")) {
      lastPlayer = lastEntry.player || "";
      if (!secLastEntry.turnover) secLastPlayer = secLastEntry.player || "";
    }

    // Validate first action of a possession is a touch
    if (
      isOffense &&
      action !== "Touch" &&
      (lastEntry.turnover || !newHistory.length)
    ) {
      toast.error("First action of a possession must be a touch");
      return;
    }
    // Validate cannot drop own throw
    if (action === "Drop" && lastEntry.player === player) {
      toast.error("Cannot drop own throw");
      return;
    }
    // set last throwers for touch (if not right after turnover)
    if (action === "Touch" && !lastEntry.turnover) {
      if (player === lastEntry.player) {
        toast.error("Cannot touch the disc twice in a row");
        return;
      } else {
        lastPlayer = lastEntry.player || "";
        if (!secLastEntry.turnover) secLastPlayer = secLastEntry.player || "";
      }
    }
    // Validate throwaway was by lastPlayer
    if (action === "T-Away") {
      if (lastEntry.action !== "Touch") {
        toast.error("Throwaway can only be recorded following a touch");
        return;
      } else if (lastEntry.player !== player) {
        console.log(lastEntry.player);
        toast.error(
          `Only player in possession (${lastEntry.player}) can throwaway`
        );
        return;
      }
    }
    // set the score for point, GSO
    const newScore = { ...score };
    if (action === "Point") {
      statTeam === darkTeam ? newScore.dark++ : newScore.light++;
    }
    if (action === "GSO") {
      statTeam === darkTeam ? newScore.light++ : newScore.dark++;
    }
    setScore(newScore);

    // add action to game history
    const time = new Date();
    const historyEntry = {
      date: time.toDateString(),
      time: time.toTimeString(),
      gameTime: gameTime,
      statTeam: statTeam,
      [`${darkTeam}_score`]: newScore.dark,
      [`${lightTeam}_score`]: newScore.light,
      action: action,
      player: player,
      lastPlayer: lastPlayer,
      secLastPlayer: secLastPlayer,
      turnover: turnover,
    };
    // set new player stats
    const newPlayerStats = [...playerStats];
    newPlayerStats.forEach((el) => {
      if (el.name === player) {
        //debugger
        // Add touch for a drop
        if (action === "Drop") el.Touch++;
        // Add touch for a point if not added already, also add to game history
        if (action === "Point") {
          if (lastPlayer !== player) {
            el.Touch++;
            const addHistEntry = {
              date: time.toDateString(),
              time: time.toTimeString(),
              gameTime: gameTime,
              statTeam: statTeam,
              [`${darkTeam}_score`]: newScore.dark,
              [`${lightTeam}_score`]: newScore.light,
              action: "Touch",
              player: player,
              lastPlayer: lastPlayer,
              secLastPlayer: secLastPlayer,
              turnover: false,
            };
            newHistory.push(addHistEntry);
          } else if (secLastEntry.action !== "D-Play") {
            historyEntry.lastPlayer = secLastPlayer;
            historyEntry.secLastPlayer = secLastEntry.lastPlayer;
          }
        }
        el[action]++;
      }
      // give assist to lastPlayer if not the same as current player or if Callahan goal
      if (
        action === "Point" &&
        el.name === lastPlayer &&
        (lastPlayer !== player || secLastEntry.turnover || !secLastEntry)
      )
        el.Assist++;
      // give assist to secLastPlayer if last touch was by same player
      else if (
        action === "Point" &&
        el.name === secLastPlayer &&
        lastPlayer === player
      )
        el.Assist++;
    });
    setPlayerStats(newPlayerStats);
    // log entry to console
    console.log(`${player}: ${action}: gameClock: ${gameTime}: 
            time: ${historyEntry.time}`);

    toast.success(
      `Last Entry: ${action}${player ? " - " + player : ""} ${
        lastPlayer ? " from " + lastPlayer : ""
      }`
    );
    setPrevEntry({ action: action, player: player, turnover: turnover });
    if (turnover) toggleOffense();
    newHistory.push(historyEntry);
    setGameHistory(newHistory);
  };

  const handleUndo = () => {
    toast.dismiss();
    const newHistory = [...gameHistory];
    const newScore = { ...score };
    // remove last entry from game history
    const undoEntry = newHistory.pop();
    if (!undoEntry) {
      toast.info("Nothing to undo");
      return;
    }
    console.log("UNDO");
    // undo playerStats count
    const newPlayerStats = [...playerStats];
    newPlayerStats.forEach((el) => {
      if (el.name === undoEntry.player) {
        if (undoEntry.action === "Drop") el.Touch--;
        if (undoEntry.action === "Point" && !undoEntry.lastPlayer) el.Assist--;
        el[undoEntry.action]--;
      }
      // remove assists and extra touch from game history for goals
      if (undoEntry.action === "Point") {
        if (undoEntry.lastPlayer === el.name) {
          el.Assist--;
        }
      }
    });
    setPlayerStats(newPlayerStats);
    // undo turnover and change buttons
    if (undoEntry.turnover) toggleOffense();
    // undo points and change score
    if (undoEntry.action === "Point") {
      statTeam === darkTeam ? newScore.dark-- : newScore.light--;
    }
    if (undoEntry.action === "GSO") {
      statTeam === darkTeam ? newScore.light-- : newScore.dark--;
    }
    // show undo action
    toast.info(
      `UNDO: ${undoEntry.action}${
        undoEntry.player ? ` by ${undoEntry.player}` : ""
      }`
    );
    // set new state
    setScore(newScore);
    setGameHistory(newHistory);
    if (!newHistory.length)
      setPrevEntry({ action: "", player: "", turnover: false });
    else {
      const newPrevEntry = newHistory[newHistory.length - 1];
      setPrevEntry({
        action: newPrevEntry.action,
        player: newPrevEntry.player,
        turnover: newPrevEntry.turnover,
      });
    }
  };

  const addStatPlayer = (player: string) => {
    const newPlayerStats = [...playerStats];
    newPlayerStats.push({
      name: player,
      Touch: 0,
      Assist: 0,
      Point: 0,
      "T-Away": 0,
      Drop: 0,
      "D-Play": 0,
      GSO: 0,
    });
    setPlayerStats(newPlayerStats);
    setShowAddPlayer(false);
    setNewPlayer("");
  };

  return (
    <div className="App">
      <div className="stats">
        {gameType === "subs" && !showSubSetup && (
          <p>Currently tracking Subs.</p>
        )}
        {!gameType && <GameSetup gameType="stats" />}
        {gameType === "stats" && (
          <div className="game-stats">
            {testGame && (
              <div id="test-notification">
                <p id="test-text">Test Game</p>
              </div>
            )}
            <GameInfo
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resetTimer={resetTimer}
            />
            <div className="game-options">
              <button
                className="btn opt-btn"
                onClick={() => {
                  if (
                    window.confirm("Cancel Game? Progress will not be saved.")
                  ) {
                    toast.dismiss();
                    toast.error("Game Deleted", { autoClose: 2500 });
                    resetGame();
                    setPrevEntry({
                      action: "",
                      player: "",
                      turnover: false,
                    });
                  }
                }}
              >
                Exit Game
              </button>
              <button
                className={`btn ${!paused ? "btn-inactive" : ""} opt-btn`}
                onClick={() => {
                  if (!paused) {
                    toast.error(
                      "Cannot finish game when timer is running. Pause timer to finish game early.",
                      { autoClose: 2500 }
                    );
                    return;
                  }
                  toast.dismiss();
                  saveGame("stats");
                }}
              >
                Finish & Save
              </button>
              <button className="btn opt-btn" onClick={handleUndo}>
                Undo<i className="material-icons md-18">undo</i>
              </button>
            </div>
            <StatPlayerList
              handleStatClick={handleStatClick}
              // use current entry to track and disable correct buttons...
              prevEntry={prevEntry}
            />
            {!isOffense && (
              <button
                className="btn stat-btn stat-btn-after"
                name="O-Error"
                onClick={handleStatClick}
              >
                Offensive Error
              </button>
            )}
            {!showAddPlayer && (
              <button
                className="btn stat-btn stat-btn-after"
                onClick={() => setShowAddPlayer(true)}
              >
                Add Player
              </button>
            )}
            {showAddPlayer && (
              <div className="add-player-input">
                <i
                  className="material-icons"
                  onClick={() => setShowAddPlayer(false)}
                >
                  close
                </i>
                <input
                  placeholder="player name"
                  onChange={(e) => setNewPlayer(e.target.value)}
                  value={newPlayer}
                ></input>
                <button
                  className="btn stat-btn stat-btn-after"
                  onClick={() => addStatPlayer(newPlayer)}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
