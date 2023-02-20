import React from "react";

export default function GameInfo(props) {
  return (
    <div className="game-info">
      <div className="score-card dark">
        <span id="team-name">{props.darkTeam}</span>
        {props.score && <span className="score dark">{props.score.dark}</span>}
      </div>
      <div className="game-clock">
        <span>{`${props.gameTime}`}</span>
        <div className="timer-controls">
          <i
            className="material-icons timer-control"
            onClick={() => {
              props.startTimer();
              props.setPaused(false);
              console.log("start timer");
            }}
          >
            play_arrow
          </i>
          {!props.paused && (
            <i
              className="material-icons timer-control"
              onClick={() => {
                props.pauseTimer();
                props.setPaused(true);
                console.log("pause timer");
              }}
            >
              pause
            </i>
          )}
          {props.score && props.paused && (
            <i
              className="material-icons timer-control"
              onClick={() => {
                props.resetTimer();
                props.pauseTimer();
                props.setPaused(false);
                console.log("reset timer");
              }}
            >
              replay
            </i>
          )}
        </div>
      </div>
      <div className="score-card light">
        <span id="team-name">{props.lightTeam}</span>
        {props.score && (
          <span className="score light">{props.score.light}</span>
        )}
      </div>
    </div>
  );
}
