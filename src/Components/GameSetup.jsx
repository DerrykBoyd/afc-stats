import React, { useState } from "react";
import { useFetchTeams } from "../react-query/teams";
import "../styles/GameSetup.css";

export default function GameSetup(props) {
  const [time, setTime] = useState("25");
  const [dark, setDark] = useState("");
  const [light, setLight] = useState("");
  const [statTeam, setStatTeam] = useState("");
  const [offence, setOffence] = useState("");
  const [error, setError] = useState("");
  const [gameFormat, setGameFormat] = useState("6v6");

  const { data: teams } = useFetchTeams();

  let teamNames = [<option value="" key=""></option>];
  for (let team of teams || []) {
    teamNames.push(
      <option value={team.name} key={team.name}>
        {team.name}
      </option>
    );
  }

  const isValidTime = (timeStr) => {
    let formTime = parseInt(timeStr);
    if (formTime >= 1 && formTime <= 120) return true;
    else return false;
  };

  const submitFinish = () => {
    if (!isValidTime(time)) {
      setError("Time should be between 1 - 120 mins");
      return;
    }
    if (!dark || !light || !statTeam || (props.forStats && !offence)) {
      setError("Please choose all options");
      return;
    }
    let offenceBool;
    if (props.forStats) {
      statTeam === offence ? (offenceBool = true) : (offenceBool = false);
    } else {
      offenceBool = "subs";
    }
    props.finishSetup(time, dark, light, statTeam, offenceBool, gameFormat);
  };

  const handleCheck = (e) => {
    e.target.checked ? props.setTestGame(true) : props.setTestGame(false);
  };

  return (
    <div className="game-setup card">
      <h3 id="setup-title">Game Setup</h3>
      <div className="stat-reminder">
        <div className="stat-reminder-title">
          <span>Check Roster!</span>
        </div>
        <div>
          <span>
            Confirm roster on the Teams page before setting up your game.
          </span>
        </div>
      </div>
      <label htmlFor="game-length">Game Length (mins)</label>
      <input
        name="game-length"
        type="number"
        min="1"
        max="120"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <label htmlFor="dark-team">Select Dark Team</label>
      <select
        name="dark-team"
        value={dark}
        onChange={(e) => setDark(e.target.value)}
      >
        {teamNames}
      </select>
      <label htmlFor="light-team">Select Light Team</label>
      <select
        name="light-team"
        value={light}
        onChange={(e) => setLight(e.target.value)}
      >
        {teamNames}
      </select>

      <label htmlFor="stat-team">{`Tracking ${
        props.forStats ? "Stats" : "Subs"
      } For`}</label>
      <select
        name="stat-team"
        value={statTeam}
        onChange={(e) => setStatTeam(e.target.value)}
      >
        <option></option>
        <option>{`${dark}`}</option>
        <option>{`${light}`}</option>
      </select>
      {props.forStats && (
        <>
          <label htmlFor="offence-team">Team on Offence</label>
          <select
            name="offence-team"
            value={offence}
            onChange={(e) => setOffence(e.target.value)}
          >
            <option></option>
            <option>{`${dark}`}</option>
            <option>{`${light}`}</option>
          </select>
        </>
      )}
      {!props.forStats && (
        <>
          <label htmlFor="game-format">Game Format</label>
          <select
            name="game-format"
            value={gameFormat}
            onChange={(e) => setGameFormat(e.target.value)}
          >
            <option>{`3v3`}</option>
            <option>{`4v4`}</option>
            <option>{`5v5`}</option>
            <option>{`6v6`}</option>
            <option>{`7v7`}</option>
          </select>
        </>
      )}
      <div id="test-game-checkbox" onChange={handleCheck}>
        <input type="checkbox" />
        <span>Check for test game</span>
      </div>
      <button className="btn" onClick={submitFinish}>
        Finish Setup
      </button>
      {error && <span className="form-err">{error}</span>}
    </div>
  );
}
