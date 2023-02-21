import { useCallback } from "react";
import { useGameStore } from "../store/store";

interface Options {
  playerIn: string;
  playerOut: string;
  timeOnField?: number;
}

export function useAddSubEntries() {
  const darkTeam = useGameStore((state) => state.darkTeam);
  const lightTeam = useGameStore((state) => state.lightTeam);
  const statTeam = useGameStore((state) => state.statTeam);
  const subHistory = useGameStore((state) => state.subHistory);
  const subStats = useGameStore((state) => state.subStats);
  const gameTime = useGameStore((state) => state.gameTime);
  const setSubHistory = useGameStore((state) => state.setSubHistory);

  const addSubEntries = useCallback(
    ({ playerIn, playerOut, timeOnField }: Options) => {
      const date = new Date();
      const inEntry = {
        date: date.toDateString(),
        time: date.toTimeString(),
        gameTime: gameTime,
        darkTeam: darkTeam,
        lightTeam: lightTeam,
        statTeam: statTeam,
        player: playerIn,
        action: "In",
        timeOnField,
      };
      const outEntry = {
        date: date.toDateString(),
        time: date.toTimeString(),
        gameTime: gameTime,
        darkTeam: darkTeam,
        lightTeam: lightTeam,
        statTeam: statTeam,
        player: playerOut,
        action: "Out",
        timeOnField,
      };
      setSubHistory([...subHistory, outEntry, inEntry]);
    },
    [darkTeam, lightTeam, statTeam, subHistory, setSubHistory]
  );

  const initSubEntries = useCallback(() => {
    const date = new Date();
    const newHistory = [];
    for (let i = 0; i < 4; i++) {
      newHistory.push({
        date: date.toDateString(),
        time: date.toTimeString(),
        gameTime: "00:00",
        darkTeam: darkTeam,
        lightTeam: lightTeam,
        statTeam: statTeam,
        player: subStats[i].name,
        action: "In",
        timeOnField: "",
      });
    }
    setSubHistory(newHistory);
  }, [darkTeam, lightTeam, statTeam, subStats, setSubHistory]);

  return { addSubEntries, initSubEntries };
}
