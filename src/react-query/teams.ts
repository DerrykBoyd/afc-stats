import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../App";

export interface Team {
  _id: string;
  deleted?: boolean;
  docType: string;
  gm: string;
  name: string;
  players: string[];
}

async function fetchTeams(): Promise<Team[]> {
  const teamsRef = collection(db, "teams");
  const q = query(teamsRef);
  const querySnapshot = await getDocs(q);
  const teams: Team[] = [];
  querySnapshot.forEach((doc) => {
    const team = doc.data() as Team;
    if (team.deleted) return;
    teams.push(team);
  });
  return teams;
}

export function useFetchTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchTeams(),
  });
}

async function saveTeam(team: Team) {
  const teamRef = doc(db, "teams", team._id);
  await setDoc(teamRef, team, { merge: true });
}

export function useSaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
    },
  });
}

async function updateTeam({ id, team }: { id: string; team: Partial<Team> }) {
  const teamRef = doc(db, "teams", id);
  await updateDoc(teamRef, team);
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
    },
  });
}

async function deleteTeam(id: string) {
  const teamRef = doc(db, "teams", id);
  await updateDoc(teamRef, { deleted: true });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
    },
  });
}
