import { useState } from "react";
import { CSVLink } from "react-csv";
import "../styles/GameList.css";
import { StatTable } from "./StatTable";
import { SubStatTable } from "./SubStatTable";
import { toast } from "react-toastify";
import {
  getStatsCsvData,
  getSubsCsvData,
  generateFileName,
} from "../utils/getCsvData";
import { Game, useFetchGames, useUpdateGame } from "../react-query/games";

const NoteList = ({ notes }: { notes: Game["notes"] }) => {
  return (
    <div className="card-notes">
      <p className="card-note-title" key="note-title">
        Notes
      </p>
      {notes
        ? notes.map((note, index) => (
            <p className="card-note" key={index}>
              {note}
            </p>
          ))
        : null}
    </div>
  );
};

const GameCard = ({ game }: { game: Game }) => {
  if (!game) return null;
  const [showStats, setShowStats] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");

  const { mutateAsync: updateGame } = useUpdateGame();

  const { gameHistoryCsv } = getStatsCsvData(game);
  const { subHistoryCsv } = getSubsCsvData(game);

  const toggleShowStats = () => setShowStats(!showStats);

  function deleteWithConfirmation() {
    if (window.confirm("Are you sure you want to delete this game?")) {
      toast.promise(updateGame({ id: game._id, data: { deleted: true } }), {
        pending: "Deleting game...",
        success: "Game deleted",
        error: "Error deleting game",
      });
    }
  }

  return (
    <div className="card game-list-card">
      <div className="game-list-info">
        <span>{game.date.toDate().toDateString()}</span>
        <span>{`Stat Taker: ${game.statTaker}`}</span>
      </div>
      <div className="game-list-info">
        <span>{`${game.playerStats ? "Stats" : "Subs"} For: ${
          game.statTeam
        }`}</span>
        {game.testGame && <span className="test-game">Test Game</span>}
      </div>
      <div className="game-score">
        <div className="score-card score-card-games dark">
          <span id="team-name">{game.darkTeam}</span>
          {game.score && <span className="score dark">{game.score.dark}</span>}
        </div>
        <div className="score-card score-card-games light">
          <span id="team-name">{game.lightTeam}</span>
          {game.score && (
            <span className="score light">{game.score.light}</span>
          )}
        </div>
      </div>
      <div className="game-list-btns">
        <CSVLink
          className="btn game-list-btn"
          data={gameHistoryCsv || subHistoryCsv || []}
          filename={
            gameHistoryCsv
              ? generateFileName(game, "Stats")
              : generateFileName(game, "Subs")
          }
          target="_blank"
        >
          {gameHistoryCsv ? `Game CSV` : "Subs CSV"}
          <i className="material-icons md-18">get_app</i>
        </CSVLink>
        {!showStats && (
          <button className="btn game-list-btn" onClick={toggleShowStats}>
            Show Stats<i className="material-icons md-18">arrow_drop_down</i>
          </button>
        )}
        {showStats && (
          <button className="btn game-list-btn" onClick={toggleShowStats}>
            Hide Stats<i className="material-icons md-18">arrow_drop_up</i>
          </button>
        )}
      </div>
      {showStats && game.playerStats && (
        <>
          <StatTable stats={game.playerStats} />
          {game.notes && <NoteList notes={game.notes} />}
          <div className="game-card-btns">
            <button
              className="btn btn-del game-list-btn"
              onClick={deleteWithConfirmation}
            >
              Delete Game
            </button>
            {!showNoteInput && (
              <button
                className="btn game-list-btn"
                onClick={() => {
                  setShowNoteInput(true);
                }}
              >
                Add Note
              </button>
            )}
          </div>
          {showNoteInput && (
            <div>
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="game-card-btns">
                <button
                  className="btn game-list-btn"
                  onClick={() => setShowNoteInput(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn game-list-btn"
                  onClick={() => {
                    const newNotes = [...(game.notes || [])];
                    newNotes.push(note);
                    updateGame({ id: game._id, data: { notes: newNotes } });
                    setShowNoteInput(false);
                    setNote("");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {showStats && game.subStats && (
        <>
          <SubStatTable stats={game.subStats} />
          {game.notes && <NoteList notes={game.notes} />}
          <div className="game-card-btns">
            <button
              className="btn btn-del game-list-btn"
              onClick={deleteWithConfirmation}
            >
              Delete Game
            </button>
            {!showNoteInput && (
              <button
                className="btn game-list-btn"
                onClick={() => {
                  setShowNoteInput(true);
                }}
              >
                Add Note
              </button>
            )}
          </div>
          {showNoteInput && (
            <div>
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="game-card-btns">
                <button
                  className="btn game-list-btn"
                  onClick={() => setShowNoteInput(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn game-list-btn"
                  onClick={() => {
                    const newNotes = [...(game.notes || [])];
                    newNotes.push(note);
                    updateGame({ id: game._id, data: { notes: newNotes } });
                    setShowNoteInput(false);
                    setNote("");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const GameList = () => {
  const { data, isLoading } = useFetchGames();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data?.pages?.length) {
    return <div>No games</div>;
  }

  const gamesToShow = data.pages.map((page) =>
    page.filter((game) => !game.deleted)
  );

  return (
    <div className="team-list">
      {gamesToShow.map((page) =>
        page.map((game) =>
          game.deleted ? null : <GameCard key={game._id} game={game} />
        )
      )}
    </div>
  );
};

export default function Games() {
  const { fetchNextPage, hasNextPage } = useFetchGames();

  return (
    <div className="App">
      <h1 className="page-header">
        <div>Recorded Games</div>
      </h1>
      <GameList />
      {hasNextPage && (
        <button
          className="btn game-list-btn"
          onClick={() => fetchNextPage()}
          style={{ marginBottom: "1rem" }}
        >
          Load More <i className="material-icons md-18">get_app</i>
        </button>
      )}
    </div>
  );
}
