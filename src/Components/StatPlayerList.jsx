import React from "react";
import OffenseButtons from "./OffenseButtons";
import DefenceButtons from "./DefenceButtons";

export default function StatPlayerList(props) {
  const playerStats = props.playerStats;

  const list = playerStats.map((player) => (
    <div key={player.name} className="player-input">
      <div
        className={`player-name ${
          props.darkTeam === props.statTeam ? "dark" : ""
        }`}
      >
        <span className="player-text">{player.name}</span>
      </div>
      {props.offense && (
        <OffenseButtons
          player={player}
          handleStatClick={props.handleStatClick}
          prevEntry={props.prevEntry}
        />
      )}
      {!props.offense && (
        <DefenceButtons
          player={player}
          handleStatClick={props.handleStatClick}
        />
      )}
    </div>
  ));

  return <div className="player-list">{list}</div>;
}
