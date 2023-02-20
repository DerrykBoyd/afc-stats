import React, { ChangeEvent, useState } from "react";
import Team from "./Team";
import "../styles/Teams.css";
import { useSaveTeam, useFetchTeams } from "../react-query/teams";
import { toast } from "react-toastify";

const TeamList = () => {
  const { data: teams, isLoading } = useFetchTeams();

  if (isLoading) return <div>Loading...</div>;
  if (!teams) return <div>No teams found</div>;

  return (
    <div className="team-list">
      {teams.map((team, ind) => (
        <Team team={team} ind={ind} key={team.name} />
      ))}
    </div>
  );
};

export default function Teams() {
  const [teamName, setTeamName] = useState("");
  const [teamGM, setTeamGM] = useState("");
  const [showAddTeam, setShowAddTeam] = useState(false);

  const { mutateAsync: addTeam } = useSaveTeam();

  const teamPlayers = [
    "Player1",
    "Player2",
    "Player3",
    "Player4",
    "Player5",
    "Player6",
    "Player7",
    "Player8",
    "Player9",
    "Player10",
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "team-name":
        setTeamName(e.target.value);
        break;
      case "team-gm":
        setTeamGM(e.target.value);
        break;
      default:
        console.log("State not updated!");
    }
  };

  const createTeam = async () => {
    try {
      await toast.promise(
        addTeam({
          _id: new Date().toISOString(),
          docType: "team",
          name: teamName,
          gm: teamGM,
          players: teamPlayers,
        }),
        {
          pending: "Creating team...",
          success: "Team created!",
          error: "Error creating team",
        }
      );
      // clear form
      setTeamName("");
      setTeamGM("");
      setShowAddTeam(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1 className="page-header">Teams</h1>
      <TeamList />
      {!showAddTeam && (
        <button
          className="btn"
          onClick={() => {
            setShowAddTeam(true);
          }}
        >
          Add Team
        </button>
      )}
      {showAddTeam && (
        <div className="add-team-form">
          <label htmlFor="team-name">Team Name: </label>
          <input
            name="team-name"
            onChange={handleInputChange}
            value={teamName}
          />
          <label htmlFor="team-gm">Team GM: </label>
          <input name="team-gm" onChange={handleInputChange} value={teamGM} />
          <button type="button" className="btn" onClick={createTeam}>
            Create Team
          </button>
          <button className="btn nmt" onClick={() => setShowAddTeam(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
