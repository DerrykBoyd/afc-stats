import { useState } from "react";
import GameSetup from "./GameSetup";
import GameInfo from "./GameInfo";
import SubPlayerList from "./SubPlayerList";
import { toast } from "react-toastify";
import { timeToSecs, timeToMinSec } from "../utils/timeUtils";
import { StatsSubsProps } from "./Stats";
import { useGameStore } from "../store/store";
import { useAddSubEntries } from "../hooks/uesAddSubEntries";

export default function Subs({
  startTimer,
  resetGame,
  resetTimer,
  pauseTimer,
  saveGame,
}: StatsSubsProps) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");

  const { addSubEntries } = useAddSubEntries();

  const {
    gameTime,
    gameType,
    paused,
    showStatSetup,
    showSubSetup,
    subOutSelected,
    subInSelected,
    subPlayerSelected,
    subStats,
    setSubStats,
    setSubInSelected,
    setSubOutSelected,
    setSubPlayerSelected,
  } = useGameStore();

  // show warning on page reload attempt during game
  window.onbeforeunload = (e) => {
    if (!showSubSetup) e.returnValue = "Game will not be saved.";
  };

  const completeSub = (playerIn: string, playerOut: string) => {
    const newSubStats = [...subStats];
    const inInd = newSubStats.findIndex((el) => el.name === playerIn);
    const outInd = newSubStats.findIndex((el) => el.name === playerOut);
    // update player out subStats
    const lastInSecs = timeToSecs(newSubStats[outInd].lastTimeIn);
    const gameTimeSecs = timeToSecs(gameTime);
    const shiftLength = lastInSecs - gameTimeSecs;
    newSubStats[outInd].timeOnField += shiftLength;
    newSubStats[outInd].shiftLengths.push(shiftLength);
    // add entries to subHistory
    addSubEntries({
      playerIn: newSubStats[inInd].name,
      playerOut: newSubStats[outInd].name,
      timeOnField: newSubStats[outInd].timeOnField,
    });
    // set the last time in for player in
    newSubStats[inInd].lastTimeIn = gameTime;
    // switch players in the subStats arr
    // [newSubStats[inInd], newSubStats[outInd]] = [newSubStats[outInd], newSubStats[inInd]];
    // Player on to ind0 and player out to ind[length-1]
    const entryIn = newSubStats.splice(
      newSubStats.findIndex((el) => el.name === playerIn),
      1
    );
    const entryOut = newSubStats.splice(
      newSubStats.findIndex((el) => el.name === playerOut),
      1
    );
    newSubStats.unshift(entryIn[0]);
    newSubStats.push(entryOut[0]);
    //
    setSubStats(newSubStats);
    setSubInSelected(false);
    setSubOutSelected(false);
    setSubPlayerSelected("");
    toast.dismiss();
    toast.success(`Subbed in ${playerIn} for ${playerOut}`);
  };

  const finishGameSubs = () => {
    const newSubStats = [...subStats];
    // update timeOnField for 4 players on field at game end
    for (let i = 0; i < 4; i++) {
      const lastInSecs = timeToSecs(newSubStats[i].lastTimeIn);
      const gameTimeSecs = timeToSecs(gameTime);
      const shiftLength = lastInSecs - gameTimeSecs;
      newSubStats[i].timeOnField += shiftLength;
      newSubStats[i].shiftLengths.push(shiftLength);
    }
    for (const sub of newSubStats) {
      sub.timeMMSS = timeToMinSec(sub.timeOnField);
      sub.shifts = sub.shiftLengths.length;
      sub.averageTimeOnSecs = sub.timeOnField / sub.shifts || 0;
      sub.averageTimeOnMMSS = timeToMinSec(sub.averageTimeOnSecs);
    }
    setSubStats(newSubStats);
  };

  const handleOut = (name: string) => {
    if (subOutSelected) {
      setSubPlayerSelected(name);
      return;
    }
    if (subInSelected) {
      completeSub(subPlayerSelected, name);
      return;
    }
    setSubPlayerSelected(name);
    setSubOutSelected(true);
  };

  const handleIn = (name: string) => {
    if (subInSelected) {
      setSubPlayerSelected(name);
      return;
    }
    if (subOutSelected) {
      completeSub(name, subPlayerSelected);
      return;
    }
    setSubPlayerSelected(name);
    setSubInSelected(true);
  };

  const addSubPlayer = (name: string) => {
    const newSubStats = [...subStats];
    newSubStats.push({
      name,
      timeOnField: 0,
      lastTimeIn: `${gameTime}:00`,
      shiftLengths: [],
    });
    setSubStats(newSubStats);
    setShowAddPlayer(false);
    setNewPlayer("");
  };

  return (
    <div className="App">
      {gameType === "stats" && !showStatSetup ? (
        <p>Currently tracking Stats.</p>
      ) : null}
      {!gameType ? <GameSetup gameType="subs" /> : null}
      {gameType === "subs" ? (
        <div className="game-stats">
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
                finishGameSubs();
                toast.dismiss();
                saveGame("subs");
              }}
            >
              Finish & Save
            </button>
          </div>
          <SubPlayerList handleIn={handleIn} handleOut={handleOut} />
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
                onClick={() => addSubPlayer(newPlayer)}
              >
                Save
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
