import { secsToIsoString, timeToSecs } from "./timeUtils";
import Papa from "papaparse";
import { Game } from "../react-query/games";

/** Takes a stats game object and converts times to HH:MM:SS.mmm
 * @param {object} game - The game object
 * @returns {gameHistoryCsv: object, playerStatsCsv: object} - The game object with times converted to HH:MM:SS.mmm
 */
export function getStatsCsvData(game: Game) {
  if (!game.gameHistory?.[0]) return {};

  const teams = Object.keys(game.gameHistory[0]).filter((key) =>
    key.includes("_score")
  );

  const statTeam = game.gameHistory[0].statTeam;
  const otherTeam =
    teams && teams.find((team) => !team.includes(statTeam))?.split("_")[0];

  const gameHistoryCsv = game.gameHistory.map((entry) => {
    return {
      date: entry.date,
      time: entry.time,
      gameTime: secsToIsoString(timeToSecs(entry.gameTime)),
      statTeam: entry.statTeam,
      otherTeam,
      statTeamScore: entry[`${statTeam}_score`],
      otherTeamScore: entry[`${otherTeam}_score`],
      action: entry.action,
      player: entry.player,
      lastPlayer: entry.lastPlayer,
      secLastPlayer: entry.secLastPlayer,
      turnover: entry.turnover,
    };
  });

  return { gameHistoryCsv, playerStatsCsv: game.playerStats };
}

/** Takes a subs game object and converts times to HH:MM:SS.mmm
 * @param {object} game - The game object
 * @returns {subHistoryCsv: object, subStatsCsv: object} - The game object with times converted to HH:MM:SS.mmm
 */
export function getSubsCsvData(game: Game) {
  if (!game.subHistory) return {};
  const subHistoryCsv = game.subHistory.map((entry) => {
    return {
      ...entry,
      gameTime: secsToIsoString(timeToSecs(entry.gameTime)),
      timeOnField: secsToIsoString(entry.timeOnField),
    };
  });
  const subStatsCsv = game.subStats?.map((entry) => {
    return {
      ...entry,
      averageTimeOn: secsToIsoString(entry.averageTimeOnSecs || 0),
      timeOnField: secsToIsoString(entry.timeOnField || 0),
    };
  });
  return { subHistoryCsv, subStatsCsv };
}

export function getCsvString(data: Game) {
  const { gameHistoryCsv } = getStatsCsvData(data);
  const { subHistoryCsv } = getSubsCsvData(data);
  const csvString = Papa.unparse(gameHistoryCsv || subHistoryCsv || []);
  return csvString;
}

export function downloadGameCsv(data: Game) {
  const csvString = getCsvString(data);
  const csvData = new Blob([csvString], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvData);
  const tempLink = document.createElement("a");
  tempLink.href = csvUrl;
  tempLink.setAttribute(
    "download",
    generateFileName(
      data,
      getStatsCsvData(data).gameHistoryCsv ? "stats" : "subs"
    )
  );
  tempLink.click();
}

export const generateFileName = (gameData: Game, str: string) => {
  const gameDate = gameData.date.toDate();
  return `${gameDate.getFullYear()}-${
    gameDate.getMonth() + 1
  }-${gameDate.getDate()}-${gameData.darkTeam}-vs-${
    gameData.lightTeam
  }-${str}-${gameData.statTeam}.csv`;
};
