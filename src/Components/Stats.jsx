import React, { useState } from "react";
import GameSetup from "./GameSetup";
import GameInfo from "./GameInfo";
import StatPlayerList from "./StatPlayerList";
import "../styles/Stats.css";
import { toast } from "react-toastify";
import { useFetchTeams } from "../react-query/teams";

export default function Stats(props) {
  // show warning on page reload attempt during game
  window.onbeforeunload = (e) => {
    if (!props.showStatSetup) e.returnValue = "Game will not be saved.";
  };

  const { data: teams } = useFetchTeams();

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [prevEntry, setPrevEntry] = useState({
    action: "",
    player: "",
    turnover: false,
  });

  const handleStatClick = (e, player = "", turnover = true) => {
    // start timer automatically if not started already
    if (!props.gameHistory.length || props.paused) props.startTimer();
    toast.dismiss();
    let action = e.currentTarget.name;
    // set the game history
    let newHistory = [...props.gameHistory];
    // get the last entry and set player if available
    let lastEntry = newHistory[newHistory.length - 1] || "";
    let secLastEntry = newHistory[newHistory.length - 2] || "";
    let lastPlayer = "";
    let secLastPlayer = "";
    // set last throwers for Point and Drop
    if (lastEntry && (action === "Point" || action === "Drop")) {
      lastPlayer = lastEntry.player || "";
      if (!secLastEntry.turnover) secLastPlayer = secLastEntry.player || "";
    }
    // Validate first action of a possession is a touch
    if (
      props.offense &&
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
    let newScore = { ...props.score };
    if (action === "Point") {
      props.statTeam === props.darkTeam ? newScore.dark++ : newScore.light++;
    }
    if (action === "GSO") {
      props.statTeam === props.darkTeam ? newScore.light++ : newScore.dark++;
    }
    props.setScore(newScore);
    // add action to game history
    let time = new Date();
    let historyEntry = {
      date: time.toDateString(),
      time: time.toTimeString(),
      gameTime: props.gameTime,
      statTeam: props.statTeam,
      [`${props.darkTeam}_score`]: newScore.dark,
      [`${props.lightTeam}_score`]: newScore.light,
      action: action,
      player: player,
      lastPlayer: lastPlayer,
      secLastPlayer: secLastPlayer,
      turnover: turnover,
    };
    // set new player stats
    let newPlayerStats = [...props.playerStats];
    newPlayerStats.forEach((el) => {
      if (el.name === player) {
        //debugger
        // Add touch for a drop
        if (action === "Drop") el.Touch++;
        // Add touch for a point if not added already, also add to game history
        if (action === "Point") {
          if (lastPlayer !== player) {
            el.Touch++;
            let addHistEntry = {
              date: time.toDateString(),
              time: time.toTimeString(),
              gameTime: props.gameTime,
              statTeam: props.statTeam,
              [`${props.darkTeam}_score`]: newScore.dark,
              [`${props.lightTeam}_score`]: newScore.light,
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
    props.setPlayerStats(newPlayerStats);
    // log entry to console
    console.log(`${player}: ${action}: gameClock: ${props.gameTime}: 
            time: ${historyEntry.time}`);

    toast.success(
      `Last Entry: ${action}${player ? " - " + player : ""} ${
        lastPlayer ? " from " + lastPlayer : ""
      }`
    );
    setPrevEntry({ action: action, player: player, turnover: turnover });
    if (turnover) props.toggleOffense();
    newHistory.push(historyEntry);
    props.setGameHistory(newHistory);
  };

  const handleUndo = () => {
    toast.dismiss();
    let newHistory = [...props.gameHistory];
    let newScore = { ...props.score };
    // remove last entry from game history
    let undoEntry = newHistory.pop();
    if (!undoEntry) {
      toast.info("Nothing to undo");
      return;
    }
    console.log("UNDO");
    // undo playerStats count
    let newPlayerStats = [...props.playerStats];
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
    props.setPlayerStats(newPlayerStats);
    // undo turnover and change buttons
    if (undoEntry.turnover) props.toggleOffense();
    // undo points and change score
    if (undoEntry.action === "Point") {
      props.statTeam === props.darkTeam ? newScore.dark-- : newScore.light--;
    }
    if (undoEntry.action === "GSO") {
      props.statTeam === props.darkTeam ? newScore.light-- : newScore.dark--;
    }
    // show undo action
    toast.info(
      `UNDO: ${undoEntry.action}${
        undoEntry.player ? ` by ${undoEntry.player}` : ""
      }`
    );
    // set new state
    props.setScore(newScore);
    props.setGameHistory(newHistory);
    if (!newHistory.length)
      setPrevEntry({ action: "", player: "", turnover: false });
    else {
      let newPrevEntry = newHistory[newHistory.length - 1];
      setPrevEntry({
        action: newPrevEntry.action,
        player: newPrevEntry.player,
        turnover: newPrevEntry.turnover,
      });
    }
  };

  const addStatPlayer = (player) => {
    let newPlayerStats = [...props.playerStats];
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
    props.setPlayerStats(newPlayerStats);
    setShowAddPlayer(false);
    setNewPlayer("");
  };

  return (
    <div className="App">
      <div className="stats">
        {!props.showSubSetup && <p>Currently tracking Subs.</p>}
        {props.showSubSetup && props.showStatSetup && (
          <GameSetup
            teams={teams}
            finishSetup={props.finishSetup}
            setTestGame={props.setTestGame}
            forStats={true}
          />
        )}
        {props.showSubSetup && !props.showStatSetup && (
          <div className="game-stats">
            {props.testGame && (
              <div id="test-notification">
                <p id="test-text">Test Game</p>
              </div>
            )}
            <GameInfo
              darkTeam={props.darkTeam}
              lightTeam={props.lightTeam}
              score={props.score}
              gameTime={props.gameTime}
              gameLength={props.gameLength}
              startTimer={props.startTimer}
              pauseTimer={props.pauseTimer}
              resetTimer={props.resetTimer}
              paused={props.paused}
              setPaused={props.setPaused}
              forStats={true}
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
                    props.resetGame();
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
                className={`btn ${!props.paused ? "btn-inactive" : ""} opt-btn`}
                onClick={() => {
                  if (!props.paused) {
                    toast.error(
                      "Cannot finish game when timer is running. Pause timer to finish game early.",
                      { autoClose: 2500 }
                    );
                    return;
                  }
                  toast.dismiss();
                  toast.success("Game Saved", { autoClose: 3000 });
                  props.saveGame("stats");
                }}
              >
                Finish & Save
              </button>
              <button className="btn opt-btn" onClick={handleUndo}>
                Undo<i className="material-icons md-18">undo</i>
              </button>
            </div>
            <StatPlayerList
              offense={props.offense}
              playerStats={props.playerStats}
              setPlayerStats={props.setPlayerStats}
              statTeam={props.statTeam}
              darkTeam={props.darkTeam}
              handleStatClick={handleStatClick}
              gameHistory={props.gameHistory}
              // use current entry to track and disable correct buttons...
              prevEntry={prevEntry}
            />
            {!props.offense && (
              <button
                className="btn stat-btn stat-btn-after"
                name="O-Error"
                onClick={(e) => handleStatClick(e)}
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
