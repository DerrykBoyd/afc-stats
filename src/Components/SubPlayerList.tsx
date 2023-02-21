import "../styles/Subs.css";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { timeToMinSec, timeOnPoint } from "../utils/timeUtils";
import arrayMove from "array-move";
import { NUMBER_OF_PLAYERS, useGameStore } from "../store/store";

const DragHandle = SortableHandle(() => (
  <i className={`material-icons handle`}>drag_handle</i>
));

const SortableList = SortableContainer<SubPlayerListProps>(
  ({ handleIn, handleOut }: SubPlayerListProps) => {
    const subStats = useGameStore((state) => state.subStats);
    return (
      <div className="player-list sub-list">
        {subStats.map((player, index) => (
          <SortableItem
            player={player}
            ind={index}
            index={index}
            key={index}
            disabled={index < NUMBER_OF_PLAYERS ? true : false}
            handleIn={handleIn}
            handleOut={handleOut}
          />
        ))}
      </div>
    );
  }
);

interface SortableItemProps extends SubPlayerListProps {
  player: any;
  ind: number;
}

const SortableItem = SortableElement<SortableItemProps>(
  ({ player, ind, handleIn, handleOut }: SortableItemProps) => {
    const darkTeam = useGameStore((state) => state.darkTeam);
    const statTeam = useGameStore((state) => state.statTeam);
    const gameTime = useGameStore((state) => state.gameTime);
    const subPlayerSelected = useGameStore((state) => state.subPlayerSelected);

    return (
      <div
        className={`player-input sub-player`}
        style={ind === NUMBER_OF_PLAYERS - 1 ? { marginBottom: "3rem" } : {}}
      >
        <div
          className={`player-name sub-name ${
            darkTeam === statTeam ? "dark" : ""
          }`}
        >
          <span className="player-text">{player?.name}</span>
          {ind < NUMBER_OF_PLAYERS ? (
            <span>{`Point: ${
              player.lastTimeIn
                ? timeOnPoint(player.lastTimeIn, gameTime)
                : "0:00"
            }`}</span>
          ) : (
            <span>{`Total: ${timeToMinSec(player.timeOnField)}`}</span>
          )}
        </div>
        {ind < NUMBER_OF_PLAYERS && (
          <button
            className={`btn sub-btn ${
              subPlayerSelected === player.name ? "btn-sec" : ""
            }`}
            onClick={() => handleOut(player?.name)}
          >
            Sub Out
          </button>
        )}
        {ind >= NUMBER_OF_PLAYERS && (
          <>
            <DragHandle />
            <button
              className={`btn sub-btn ${
                subPlayerSelected === player?.name ? "btn-sec" : ""
              }`}
              onClick={() => handleIn(player?.name)}
            >
              Sub In
            </button>
          </>
        )}
      </div>
    );
  }
);

interface SubPlayerListProps {
  handleIn: (name: string) => void;
  handleOut: (name: string) => void;
}

export default function SubPlayerList({
  handleIn,
  handleOut,
}: SubPlayerListProps) {
  const subStats = useGameStore((store) => store.subStats);
  const setSubStats = useGameStore((store) => store.setSubStats);

  const onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (newIndex < NUMBER_OF_PLAYERS) return;
    const updatedStats = arrayMove(subStats, oldIndex, newIndex);
    setSubStats(updatedStats);
  };

  return (
    <SortableList
      handleIn={handleIn}
      handleOut={handleOut}
      onSortEnd={onSortEnd}
      useDragHandle
    />
  );
}
