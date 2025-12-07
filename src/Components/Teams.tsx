import { ChangeEvent, useMemo, useRef, useState } from "react";
import Team from "./Team";
import "../styles/Teams.css";
import {
  Team as TeamType,
  useFetchTeams,
  useSaveTeam,
  useUpdateTeam,
} from "../react-query/teams";
import { toast } from "react-toastify";
import Papa from "papaparse";

const DEFAULT_TEAM_PLAYERS = Array.from(
  { length: 10 },
  (_, index) => `Player${index + 1}`
);

const TeamList = ({
  teams,
  isLoading,
}: {
  teams?: TeamType[];
  isLoading: boolean;
}) => {
  if (isLoading) return <div>Loading...</div>;
  if (!teams || teams.length === 0) return <div>No teams found</div>;

  return (
    <div className="team-list">
      {teams.map((team) => {
        const team_hash = `${team._id}_${team.name}_${
          team.gm
        }_${team.players.join(",")}`;
        return <Team team={team} key={team_hash} />;
      })}
    </div>
  );
};

export default function Teams() {
  const [teamName, setTeamName] = useState("");
  const [teamGM, setTeamGM] = useState("");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: addTeam } = useSaveTeam();
  const { mutateAsync: updateTeam } = useUpdateTeam();
  const { data: teams, isLoading: isTeamsLoading } = useFetchTeams();

  const existingTeamMap = useMemo(() => {
    const map = new Map<string, TeamType>();
    (teams ?? []).forEach((team) => {
      const key = team.name.trim().toLowerCase();
      if (key) {
        map.set(key, team);
      }
    });
    return map;
  }, [teams]);

  const existingTeamNames = useMemo(
    () => new Set(Array.from(existingTeamMap.keys())),
    [existingTeamMap]
  );

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
    const trimmedName = teamName.trim();
    const trimmedGM = teamGM.trim();

    if (!trimmedName || !trimmedGM) {
      toast.error("Team name and GM are required.");
      return;
    }

    if (existingTeamNames.has(trimmedName.toLowerCase())) {
      toast.error("A team with that name already exists.");
      return;
    }

    try {
      await toast.promise(
        addTeam({
          _id: new Date().toISOString(),
          docType: "team",
          name: trimmedName,
          gm: trimmedGM,
          players: DEFAULT_TEAM_PLAYERS,
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

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const extractPlayers = (row: Record<string, string>) => {
    if (row.players) {
      return row.players
        .split(/[;,|]/)
        .map((player) => player.trim())
        .filter(Boolean);
    } else {
      throw new Error("No players field in row");
    }
  };

  const handleCsvImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processCsvResults(results).catch((err) => {
          console.error(err);
          toast.error("Unexpected error importing teams.");
          setIsImporting(false);
          resetFileInput();
        });
      },
      error: (error) => {
        toast.error(`Unable to read CSV: ${error.message}`);
        setIsImporting(false);
        resetFileInput();
      },
    });
  };

  const processCsvResults = async (
    results: Papa.ParseResult<Record<string, string>>
  ) => {
    try {
      if (results.errors.length) {
        toast.error(`CSV parsing failed: ${results.errors[0].message}`);
        return;
      }

      const rawRows = results.data.filter(Boolean);
      const rowIssues: string[] = [];
      const duplicateNewNameRows: string[] = [];
      const teamsToCreate: Array<{
        name: string;
        gm: string;
        players: string[];
      }> = [];
      const teamsToUpdate: Array<{
        id: string;
        name: string;
        gm: string;
        players: string[];
      }> = [];
      const seenNewNames = new Set<string>();

      rawRows.forEach((row, index) => {
        const name = row["name"];
        const gm = row["gm"];
        const rowNumber = index + 2; // account for header row

        if (!name || !gm) {
          rowIssues.push(`Row ${rowNumber}: missing "name" or "gm".`);
          return;
        }

        const nameKey = name.trim().toLowerCase();
        const existingTeam = existingTeamMap.get(nameKey);
        const players = extractPlayers(row);

        if (existingTeam) {
          const playersForUpdate =
            players.length > 0 ? players : existingTeam.players ?? [];
          teamsToUpdate.push({
            id: existingTeam._id,
            name: existingTeam.name,
            gm,
            players: playersForUpdate,
          });
          return;
        }

        if (nameKey && seenNewNames.has(nameKey)) {
          duplicateNewNameRows.push(
            `Row ${rowNumber}: duplicate team name "${name}" in CSV.`
          );
          return;
        }

        const playersForCreate =
          players.length > 0 ? players : DEFAULT_TEAM_PLAYERS;

        teamsToCreate.push({
          name,
          gm,
          players: playersForCreate,
        });

        if (nameKey) {
          seenNewNames.add(nameKey);
        }
      });

      if (!teamsToCreate.length && !teamsToUpdate.length) {
        toast.error("No valid rows found in CSV.");
        return;
      }

      if (rowIssues.length) {
        toast.warn(
          `Skipped ${rowIssues.length} row(s). Ensure headers include name, gm, and optional players.`
        );
      }

      if (duplicateNewNameRows.length) {
        toast.warn(
          `Skipped ${duplicateNewNameRows.length} duplicate row(s) for new teams.`
        );
      }

      const toastId = toast.loading(
        `Processing ${teamsToCreate.length + teamsToUpdate.length} team(s)...`
      );

      await Promise.allSettled([
        ...teamsToCreate.map((team) =>
          addTeam({
            _id: generateId(),
            docType: "team",
            name: team.name,
            gm: team.gm,
            players: team.players,
          })
        ),
        ...teamsToUpdate.map((team) =>
          updateTeam({
            id: team.id,
            team: {
              gm: team.gm,
              players: team.players,
            },
          })
        ),
      ]).then((results) => {
        if (results.every((r) => r.status === "fulfilled")) {
          toast.update(toastId, {
            render: `Successfully processed ${
              teamsToCreate.length + teamsToUpdate.length
            } team(s).`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          return results;
        } else if (results.every((r) => r.status === "rejected")) {
          toast.update(toastId, {
            render: "All team imports/updates failed.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          const failedCount = results.filter(
            (r) => r.status === "rejected"
          ).length;
          toast.update(toastId, {
            render: `Import completed with ${failedCount} failure(s).`,
            type: "warning",
            isLoading: false,
            autoClose: 5000,
          });
        }
        return results;
      });

      setShowAddTeam(false);
    } finally {
      setIsImporting(false);
      resetFileInput();
    }
  };

  return (
    <div className="App">
      <h1 className="page-header">Teams</h1>
      <TeamList teams={teams} isLoading={isTeamsLoading} />
      <div className="team-actions">
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
        <button
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting || isTeamsLoading}
        >
          {isImporting ? "Importing..." : "Import Teams CSV"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleCsvImport}
          hidden
        />
      </div>
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
