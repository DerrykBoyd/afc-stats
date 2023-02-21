import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const NUMBER_OF_PLAYERS = 4;

interface GameStore {
  darkTeam: string;
  gameFinished: boolean;
  gameHistory: any[];
  gameLength: number;
  gameStarted: boolean;
  gameTime: string;
  gameTimeSeconds: number;
  gameType: "stats" | "subs" | "";
  isOffense: boolean | "subs";
  lightTeam: string;
  paused: boolean;
  playerStats: any[];
  score: {
    dark: number;
    light: number;
  };
  showStatSetup: boolean;
  showSubSetup: boolean;
  statTeam: string;
  subHistory: any[];
  subInSelected: boolean;
  subOutSelected: boolean;
  subPlayerSelected: string;
  subStats: any[];
  testGame: boolean;
  setDarkTeam: (team: string) => void;
  setGameFinished: (finished: boolean) => void;
  setGameHistory: (history: any[]) => void;
  setGameLength: (length: number) => void;
  setGameStarted: (started: boolean) => void;
  setGameTime: (time: string) => void;
  setGameTimeSeconds: (time: number) => void;
  setIsOffense: (isOffense: boolean | "subs") => void;
  setLightTeam: (team: string) => void;
  setPlayerStats: (stats: any[]) => void;
  setPaused: (paused: boolean) => void;
  setScore: (score: { dark: number; light: number }) => void;
  setShowStatSetup: (show: boolean) => void;
  setShowSubSetup: (show: boolean) => void;
  setStatTeam: (team: string) => void;
  setSubHistory: (history: any[]) => void;
  setSubInSelected: (selected: boolean) => void;
  setSubOutSelected: (selected: boolean) => void;
  setSubPlayerSelected: (player: string) => void;
  setSubStats: (stats: any[]) => void;
  setTestGame: (test: boolean) => void;
  toggleOffense: () => void;
  resetGameStore: () => void;
  finishSetup: (data: SetupData) => void;
  addSubEntries: (data: any[]) => void;
  setGameType: (type: "stats" | "subs" | "") => void;
}

type SetupData = Pick<
  GameStore,
  | "darkTeam"
  | "lightTeam"
  | "gameLength"
  | "gameTime"
  | "gameType"
  | "statTeam"
  | "subStats"
  | "isOffense"
  | "showSubSetup"
  | "showStatSetup"
  | "playerStats"
>;

const initialState = {
  darkTeam: "",
  gameFinished: false,
  gameHistory: [],
  gameLength: 25,
  gameStarted: false,
  gameTime: "00:00",
  gameTimeSeconds: 0,
  gameType: "" as const,
  isOffense: false,
  lightTeam: "",
  paused: false,
  playerStats: [],
  score: {
    dark: 0,
    light: 0,
  },
  showStatSetup: true,
  showSubSetup: true,
  statTeam: "",
  subStats: [],
  subInSelected: false,
  subOutSelected: false,
  subPlayerSelected: "",
  subHistory: [],
  testGame: false,
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setGameTime: (time: string) => set({ gameTime: time }),
        setGameTimeSeconds: (time: number) => set({ gameTimeSeconds: time }),
        setDarkTeam: (team: string) => set({ darkTeam: team }),
        setLightTeam: (team: string) => set({ lightTeam: team }),
        setGameFinished: (finished: boolean) => set({ gameFinished: finished }),
        setGameHistory: (history: any[]) => set({ gameHistory: history }),
        setGameLength: (length: number) => set({ gameLength: length }),
        setGameStarted: (started: boolean) => set({ gameStarted: started }),
        setIsOffense: (isOffense: boolean | "subs") =>
          set({ isOffense: isOffense }),
        toggleOffense: () => set((state) => ({ isOffense: !state.isOffense })),
        setPlayerStats: (stats: any[]) => set({ playerStats: stats }),
        setScore: (score: { dark: number; light: number }) =>
          set({ score: score }),
        setStatTeam: (team: string) => set({ statTeam: team }),
        setTestGame: (test: boolean) => set({ testGame: test }),
        setPaused: (paused: boolean) => set({ paused: paused }),
        setShowStatSetup: (show: boolean) => set({ showStatSetup: show }),
        setShowSubSetup: (show: boolean) => set({ showSubSetup: show }),
        setSubStats: (stats: any[]) => set({ subStats: stats }),
        setSubInSelected: (selected: boolean) =>
          set({ subInSelected: selected }),
        setSubOutSelected: (selected: boolean) =>
          set({ subOutSelected: selected }),
        setSubPlayerSelected: (player: string) =>
          set({ subPlayerSelected: player }),
        setSubHistory: (history: any[]) => set({ subHistory: history }),
        resetGameStore: () => set(initialState),
        finishSetup: (data: SetupData) => set(data),
        setGameType: (type: "stats" | "subs" | "") => set({ gameType: type }),
        addSubEntries: (data: any[]) =>
          set((state) => ({
            subHistory: [...state.subHistory, ...data],
          })),
      }),
      { name: "game-store" }
    )
  )
);
