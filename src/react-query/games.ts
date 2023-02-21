import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../App";

export interface StatEntry {
  Assist: number;
  "D-Play": number;
  Drop: number;
  GM: string;
  GSO: number;
  "GSO-Mark": number;
  Point: number;
  "T-Away": number;
  Touch: number;
  VS: string;
  name: string;
}

export interface SubStatEntry {
  averageTimeOnMMSS: string;
  averageTimeOnSecs: number;
  lastTimeIn: string;
  name: string;
  shiftLengths: number[];
  shifts: number;
  timeMMSS: string;
  timeOnField: number;
}

export interface Game {
  _id: string;
  deleted?: boolean;
  darkTeam: string;
  date: Timestamp;
  docType: string;
  gameHistory?: any[];
  gameLength: number;
  lightTeam: string;
  playerStats?: StatEntry[];
  subStats?: SubStatEntry[];
  subHistory?: any[];
  score?: {
    dark: number;
    light: number;
  };
  statTaker: string;
  statTeam: string;
  testGame: boolean;
  notes?: string[];
}

async function updateGame({ id, data }: { id: string; data: Partial<Game> }) {
  const gameRef = doc(db, "games", id);
  await updateDoc(gameRef, data);
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGame,
    onSuccess: () => {
      queryClient.invalidateQueries(["games"]);
    },
  });
}

async function saveGame(game: Game) {
  const gameRef = doc(db, "games", game._id);
  await setDoc(gameRef, game, { merge: true });
}

export function useSaveGame() {
  return useMutation({
    mutationFn: saveGame,
  });
}

async function fetchGames(lastDate: Timestamp | undefined): Promise<Game[]> {
  const gamesRef = collection(db, "games");
  let q;
  if (lastDate) {
    q = query(
      gamesRef,
      orderBy("date", "desc"),
      limit(20),
      startAfter(lastDate)
    );
  } else {
    q = query(gamesRef, orderBy("date", "desc"), limit(20));
  }
  const querySnapshot = await getDocs(q);
  const games: Game[] = [];
  querySnapshot.forEach((doc) => {
    const game = doc.data() as Game;
    games.push(game);
  });
  return games;
}

export function useFetchGames() {
  return useInfiniteQuery({
    queryKey: ["games"],
    queryFn: ({ pageParam }) => fetchGames(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.length === 20 && lastPage[lastPage.length - 1].date,
  });
}
