interface Props {
  handleStatClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string,
    isAssist?: boolean
  ) => void;
  player: any;
  prevEntry: any;
}

export function OffenseButtons({ handleStatClick, player, prevEntry }: Props) {
  let mustTouch = false;
  let noThrowaway = true;
  let noTouch = false;
  let noDrop = false;

  if (!prevEntry.action || prevEntry.turnover) mustTouch = true;
  if (!prevEntry.turnover && prevEntry.player === player.name) {
    noTouch = true;
    noThrowaway = false;
    noDrop = true;
  }

  return (
    <div className="stat-btns">
      <button
        className={`btn stat-btn ${noTouch ? "btn-inactive" : ""}`}
        name="Touch"
        onClick={(e) => handleStatClick(e, player.name, false)}
      >
        Touch
        <div className="score-badge">{player.Touch}</div>
        {player.Assist !== 0 && (
          <div className="score-badge assist">{`${player.Assist}-A`}</div>
        )}
      </button>
      <button
        className={`btn stat-btn ${mustTouch ? "btn-inactive" : ""}`}
        name="Point"
        onClick={(e) => handleStatClick(e, player.name)}
      >
        Point
        <div className="score-badge">{player.Point}</div>
      </button>
      {noDrop && (
        <button
          className={`btn stat-btn t-away-btn ${
            mustTouch || noThrowaway ? "btn-inactive" : ""
          }`}
          name="T-Away"
          onClick={(e) => handleStatClick(e, player.name)}
        >
          T-Away
          <div className="score-badge">{player["T-Away"]}</div>
        </button>
      )}
      {noThrowaway && (
        <button
          className={`btn stat-btn ${
            mustTouch || noDrop ? "btn-inactive" : ""
          }`}
          name="Drop"
          onClick={(e) => handleStatClick(e, player.name)}
        >
          Drop
          <div className="score-badge">{player.Drop}</div>
        </button>
      )}
    </div>
  );
}
