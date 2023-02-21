import { Timestamp } from "firebase/firestore";
import { useCallback } from "react";
import { Game } from "../react-query/games";
import { useGameStore } from "../store/store";

export function useGetGameDetails() {
  const darkTeam = useGameStore((state) => state.darkTeam);
  const lightTeam = useGameStore((state) => state.lightTeam);
  const statTeam = useGameStore((state) => state.statTeam);
  const gameLength = useGameStore((state) => state.gameLength);
  const testGame = useGameStore((state) => state.testGame);
  const playerStats = useGameStore((state) => state.playerStats);
  const score = useGameStore((state) => state.score);
  const gameHistory = useGameStore((state) => state.gameHistory);
  const subStats = useGameStore((state) => state.subStats);
  const subHistory = useGameStore((state) => state.subHistory);

  const getGameDetails = useCallback(
    (gameDate: Date, gameType: "stats" | "subs", statTaker?: string) => {
      const gameDetails: Game = {
        _id: gameDate.toISOString(),
        date: Timestamp.fromDate(gameDate),
        docType: gameType,
        darkTeam: darkTeam,
        lightTeam: lightTeam,
        statTeam: statTeam,
        gameLength: gameLength,
        testGame: testGame,
        statTaker: statTaker || "",
      };
      if (gameType === "stats") {
        gameDetails.playerStats = playerStats;
        gameDetails.score = score;
        gameDetails.gameHistory = gameHistory;
      }
      if (gameType === "subs") {
        gameDetails.subStats = subStats;
        gameDetails.subHistory = subHistory;
      }
      return gameDetails;
    },
    [
      darkTeam,
      lightTeam,
      statTeam,
      gameLength,
      testGame,
      playerStats,
      score,
      gameHistory,
      subStats,
      subHistory,
    ]
  );

  return getGameDetails;
}
