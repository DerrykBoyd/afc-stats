import { OffenseButtons } from "./OffenseButtons";
import { DefenseButtons } from "./DefenceButtons";
import { useGameStore } from "../store/store";

interface Props {
  handleStatClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string
  ) => void;
  prevEntry: any;
}

export default function StatPlayerList({ handleStatClick, prevEntry }: Props) {
  const playerStats = useGameStore((store) => store.playerStats);
  const isOffense = useGameStore((store) => store.isOffense);
  const darkTeam = useGameStore((store) => store.darkTeam);
  const statTeam = useGameStore((store) => store.statTeam);

  const list = playerStats.map((player) => (
    <div key={player.name} className="player-input">
      <div className={`player-name ${darkTeam === statTeam ? "dark" : ""}`}>
        <span className="player-text">{player.name}</span>
      </div>
      {isOffense && (
        <OffenseButtons
          player={player}
          handleStatClick={handleStatClick}
          prevEntry={prevEntry}
        />
      )}
      {!isOffense && (
        <DefenseButtons player={player} handleStatClick={handleStatClick} />
      )}
    </div>
  ));

  return <div className="player-list">{list}</div>;
}
