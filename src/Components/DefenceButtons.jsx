import React from "react";

export default function DefenceButtons(props) {
  return (
    <div className="stat-btns">
      <button
        className="btn stat-btn"
        name="D-Play"
        onClick={(e) => props.handleStatClick(e, props.player.name)}
      >
        D-Play
        <div className="score-badge">{props.player["D-Play"]}</div>
      </button>
      <button
        className="btn stat-btn"
        name="GSO"
        onClick={(e) => props.handleStatClick(e, props.player.name)}
      >
        GSO
        <div className="score-badge">{props.player.GSO}</div>
      </button>
    </div>
  );
}
