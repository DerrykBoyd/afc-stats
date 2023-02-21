import { useGameStore } from "../store/store";

interface Props {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

export default function GameInfo({
  startTimer,
  pauseTimer,
  resetTimer,
}: Props) {
  const darkTeam = useGameStore((store) => store.darkTeam);
  const gameTime = useGameStore((store) => store.gameTime);
  const score = useGameStore((store) => store.score);
  const lightTeam = useGameStore((store) => store.lightTeam);
  const paused = useGameStore((store) => store.paused);
  const setPaused = useGameStore((store) => store.setPaused);

  return (
    <div className="game-info">
      <div className="score-card dark">
        <span id="team-name">{darkTeam}</span>
        {score && <span className="score dark">{score.dark}</span>}
      </div>
      <div className="game-clock">
        <span>{`${gameTime}`}</span>
        <div className="timer-controls">
          <i
            className="material-icons timer-control"
            onClick={() => {
              startTimer();
              setPaused(false);
              console.log("start timer");
            }}
          >
            play_arrow
          </i>
          {!paused && (
            <i
              className="material-icons timer-control"
              onClick={() => {
                pauseTimer();
                setPaused(true);
                console.log("pause timer");
              }}
            >
              pause
            </i>
          )}
          {score && paused && (
            <i
              className="material-icons timer-control"
              onClick={() => {
                resetTimer();
                pauseTimer();
                setPaused(false);
                console.log("reset timer");
              }}
            >
              replay
            </i>
          )}
        </div>
      </div>
      <div className="score-card light">
        <span id="team-name">{lightTeam}</span>
        {score && <span className="score light">{score.light}</span>}
      </div>
    </div>
  );
}
