import { ChangeEvent, useCallback, useState } from "react";
import { useFetchTeams } from "../react-query/teams";
import { useGameStore } from "../store/store";
import "../styles/GameSetup.css";

interface Props {
  gameType: "stats" | "subs";
}

export default function GameSetup({ gameType }: Props) {
  const [time, setTime] = useState("25");
  const [dark, setDark] = useState("");
  const [light, setLight] = useState("");
  const [statTeam, setStatTeam] = useState("");
  const [offenseTeam, setOffenseTeam] = useState("");
  const [error, setError] = useState("");

  const { data: teams } = useFetchTeams();

  const finishSetup = useGameStore((state) => state.finishSetup);
  const setTestGame = useGameStore((state) => state.setTestGame);

  const teamNames = [<option value="" key=""></option>];
  for (const team of teams || []) {
    teamNames.push(
      <option value={team.name} key={team.name}>
        {team.name}
      </option>
    );
  }

  const isValidTime = (timeStr: string) => {
    const formTime = parseInt(timeStr);
    if (formTime >= 1 && formTime <= 120) return true;
    else return false;
  };

  const submitFinish = useCallback(() => {
    if (!isValidTime(time)) {
      setError("Time should be between 1 - 120 mins");
      return;
    }

    if (
      !dark ||
      !light ||
      !statTeam ||
      (gameType === "stats" && !offenseTeam)
    ) {
      setError("Please choose all options");
      return;
    }

    const selectedTeam = teams?.find((team) => team.name === statTeam);
    const opponent = statTeam === dark ? light : dark;
    const opponentTeam = teams?.find((team) => team.name === opponent);
    const initPlayerStats = [];
    if (gameType === "stats") {
      for (const player of selectedTeam?.players || []) {
        initPlayerStats.push({
          name: player,
          GM: selectedTeam?.gm || "",
          VS: opponentTeam?.gm || "",
          Touch: 0,
          Assist: 0,
          Point: 0,
          "T-Away": 0,
          Drop: 0,
          "D-Play": 0,
          GSO: 0,
          "GSO-Mark": 0,
        });
      }
    }
    const initSubStats = [];
    if (gameType === "subs") {
      for (const player of selectedTeam?.players || []) {
        initSubStats.push({
          name: player,
          timeOnField: 0,
          lastTimeIn: `${time.padStart(2, "0")}:00`,
          shiftLengths: [],
        });
      }
    }

    finishSetup({
      darkTeam: dark,
      gameLength: parseInt(time),
      gameTime: `${time.padStart(2, "0")}:00`,
      lightTeam: light,
      isOffense: gameType === "stats" ? statTeam === offenseTeam : "subs",
      statTeam,
      playerStats: initPlayerStats,
      subStats: initSubStats,
      showSubSetup: false,
      showStatSetup: false,
      gameType,
    });
  }, [time, dark, light, statTeam, offenseTeam, gameType, finishSetup]);

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.checked ? setTestGame(true) : setTestGame(false);
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
        gameType === "stats" ? "Stats" : "Subs"
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
      {gameType === "stats" && (
        <>
          <label htmlFor="offence-team">Team on Offence</label>
          <select
            name="offence-team"
            value={offenseTeam}
            onChange={(e) => setOffenseTeam(e.target.value)}
          >
            <option></option>
            <option>{`${dark}`}</option>
            <option>{`${light}`}</option>
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
