import React, { ChangeEvent, useState } from "react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import arrayMove from "array-move";
import {
  Team as TypeTeam,
  useDeleteTeam,
  useSaveTeam,
} from "../react-query/teams";
import { toast } from "react-toastify";

const DragHandle = SortableHandle(() => (
  <i className={`material-icons handle`}>drag_handle</i>
));

interface ListProps {
  players: string[];
  setPlayers: (players: string[]) => void;
}

const SortableList = SortableContainer<ListProps>(
  ({ players, setPlayers }: ListProps) => {
    return (
      <div className="player-list">
        {players.map((player, index) => (
          <SortableItem
            key={`Item-${index}`}
            index={index}
            sortIndex={index}
            player={player}
            players={players}
            setPlayers={setPlayers}
          />
        ))}
      </div>
    );
  }
);

const SortableItem = SortableElement<PlayerProps>(
  ({ player, players, sortIndex, setPlayers }: PlayerProps) => (
    <Player
      player={player}
      players={players}
      index={sortIndex}
      sortIndex={sortIndex}
      setPlayers={setPlayers}
    />
  )
);

interface PlayerProps {
  player: string;
  players: string[];
  setPlayers: (players: string[]) => void;
  index: number;
  sortIndex: number;
}

const Player = ({ player, players, sortIndex, setPlayers }: PlayerProps) => {
  const handlePlayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPlayers = [...players];
    newPlayers[sortIndex] = e.target.value;
    setPlayers(newPlayers);
  };

  return (
    <div className="player-list-item">
      <DragHandle />
      <i
        className="material-icons player-del"
        onClick={() => {
          if (window.confirm(`Delete Player (${player})?`)) {
            setPlayers(players.filter((el, i) => i !== sortIndex));
          }
        }}
      >
        delete
      </i>
      <input
        className="player-card"
        value={player}
        onChange={handlePlayerChange}
      />
    </div>
  );
};

interface TeamProps {
  team: TypeTeam;
}

export default function Team({ team }: TeamProps) {
  const [showPlayers, setShowPlayers] = useState(false);
  const [players, setPlayers] = useState(team.players);

  const toggleShowPlayers = () => {
    setShowPlayers(!showPlayers);
  };

  const { mutateAsync: saveTeamFn } = useSaveTeam();
  const { mutateAsync: deleteTeam } = useDeleteTeam();

  const saveTeam = () => {
    const newTeam = { ...team, players };
    toast.promise(saveTeamFn(newTeam), {
      pending: "Saving Team...",
      success: "Team Saved!",
      error: "Error Saving Team",
    });
  };

  const addPlayer = () => {
    // add player to teams state
    setPlayers([...players, "New Player"]);
  };

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    setPlayers(arrayMove(players, oldIndex, newIndex));
  };

  function shouldCancelStart(e: any) {
    // Cancel sorting if the event target is an anchor tag (`a`)
    if (
      e.target?.innerText?.toLowerCase() === "delete" ||
      e.target?.tagName?.toLowerCase() === "input"
    ) {
      return true; // Return true to cancel sorting
    }
    return false;
  }

  const sortPlayersAZ = () => {
    setPlayers([...players.sort()]);
  };

  return (
    <div className="card team-card">
      <div className="team-name">
        <span>{`${team.name}`}</span>
      </div>
      <div className="card-info">
        <span className="gm-name">{`GM: ${team.gm}`}</span>
        <div className="card-link">
          {showPlayers && (
            <button className="btn player-sort-btn" onClick={sortPlayersAZ}>
              <span>Sort A-Z</span>
              <i className="material-icons md-18">sort</i>
            </button>
          )}
          <div onClick={toggleShowPlayers}>
            {!showPlayers && (
              <div className="card-link">
                <span>Show Players</span>
                <i className="material-icons md-18">arrow_drop_down</i>
              </div>
            )}
            {showPlayers && (
              <div className="card-link">
                <span>Hide Players</span>
                <i className="material-icons md-18">arrow_drop_up</i>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPlayers && (
        <div className="card-players">
          <SortableList
            players={players}
            setPlayers={setPlayers}
            onSortEnd={onSortEnd}
            shouldCancelStart={shouldCancelStart}
            useDragHandle
          />
          <button
            className="btn team-btn btn-del"
            onClick={() => {
              if (window.confirm(`Delete Team (${team.name})?`)) {
                toast.promise(deleteTeam(team._id), {
                  pending: "Deleting Team...",
                  success: "Team Deleted!",
                  error: "Error Deleting Team",
                });
              }
            }}
          >
            Delete Team
          </button>
          <button className="btn team-btn" onClick={addPlayer}>
            Add Player
          </button>
          <button className="btn team-btn" onClick={saveTeam}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
