import React from "react";

export default function OffenseButtons(props) {
  let mustTouch = false;
  let noThrowaway = true;
  let noTouch = false;
  let noDrop = false;

  if (!props.prevEntry.action || props.prevEntry.turnover) mustTouch = true;
  if (
    !props.prevEntry.turnover &&
    props.prevEntry.player === props.player.name
  ) {
    noTouch = true;
    noThrowaway = false;
    noDrop = true;
  }

  return (
    <div className="stat-btns">
      <button
        className={`btn stat-btn ${noTouch ? "btn-inactive" : ""}`}
        name="Touch"
        onClick={(e) => props.handleStatClick(e, props.player.name, false)}
      >
        Touch
        <div className="score-badge">{props.player.Touch}</div>
        {props.player.Assist !== 0 && (
          <div className="score-badge assist">{`${props.player.Assist}-A`}</div>
        )}
      </button>
      <button
        className={`btn stat-btn ${mustTouch ? "btn-inactive" : ""}`}
        name="Point"
        onClick={(e) => props.handleStatClick(e, props.player.name)}
      >
        Point
        <div className="score-badge">{props.player.Point}</div>
      </button>
      {noDrop && (
        <button
          className={`btn stat-btn t-away-btn ${
            mustTouch || noThrowaway ? "btn-inactive" : ""
          }`}
          name="T-Away"
          onClick={(e) => props.handleStatClick(e, props.player.name)}
        >
          T-Away
          <div className="score-badge">{props.player["T-Away"]}</div>
        </button>
      )}
      {noThrowaway && (
        <button
          className={`btn stat-btn ${
            mustTouch || noDrop ? "btn-inactive" : ""
          }`}
          name="Drop"
          onClick={(e) => props.handleStatClick(e, props.player.name)}
        >
          Drop
          <div className="score-badge">{props.player.Drop}</div>
        </button>
      )}
    </div>
  );
}
