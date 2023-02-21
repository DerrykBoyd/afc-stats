interface Props {
  handleStatClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string
  ) => void;
  player: any;
}

export function DefenseButtons({ handleStatClick, player }: Props) {
  return (
    <div className="stat-btns">
      <button
        className="btn stat-btn"
        name="D-Play"
        onClick={(e) => handleStatClick(e, player.name)}
      >
        D-Play
        <div className="score-badge">{player["D-Play"]}</div>
      </button>
      <button
        className="btn stat-btn"
        name="GSO"
        onClick={(e) => handleStatClick(e, player.name)}
      >
        GSO
        <div className="score-badge">{player.GSO}</div>
      </button>
    </div>
  );
}
