import { secsToIsoString, timeToSecs } from './timeUtils';
import Papa from 'papaparse';

/** Takes a stats game object and converts times to HH:MM:SS.mmm
 * @param {object} game - The game object
 * @returns {gameHistoryCsv: object, playerStatsCsv: object} - The game object with times converted to HH:MM:SS.mmm
 */
export function getStatsCsvData(game) {
  if (!game.gameHistory) return {};
  const gameHistoryCsv = game.gameHistory.map((entry) => {
    return { ...entry, gameTime: secsToIsoString(timeToSecs(entry.gameTime)) };
  });
  return { gameHistoryCsv, playerStatsCsv: game.playerStats };
}

/** Takes a subs game object and converts times to HH:MM:SS.mmm
 * @param {object} game - The game object
 * @returns {subHistoryCsv: object, subStatsCsv: object} - The game object with times converted to HH:MM:SS.mmm
 */
export function getSubsCsvData(game) {
  if (!game.subHistory) return {};
  const subHistoryCsv = game.subHistory.map((entry) => {
    return {
      ...entry,
      gameTime: secsToIsoString(timeToSecs(entry.gameTime)),
      timeOnField: secsToIsoString(entry.timeOnField),
    };
  });
  const subStatsCsv = game.subStats.map((entry) => {
    return {
      ...entry,
      averageTimeOn: secsToIsoString(entry.averageTimeOnSecs),
      timeOnField: secsToIsoString(entry.timeOnField),
    };
  });
  return { subHistoryCsv, subStatsCsv };
}

export function getCsvString(data) {
  const { gameHistoryCsv } = getStatsCsvData(data);
  const { subHistoryCsv } = getSubsCsvData(data);
  const csvString = Papa.unparse(gameHistoryCsv || subHistoryCsv);
  return csvString;
}

export function downloadGameCsv(data) {
  const csvString = getCsvString(data);
  const csvData = new Blob([csvString], { type: 'text/csv' });
  const csvUrl = URL.createObjectURL(csvData);
  const tempLink = document.createElement('a');
  tempLink.href = csvUrl;
  tempLink.setAttribute(
    'download',
    generateFileName(data, getStatsCsvData(data).gameHistoryCsv ? 'stats' : 'subs')
  );
  tempLink.click();
}

export const generateFileName = (gameData, str) => {
  const gameDate = gameData.date.toDate();
  return `${gameDate.getFullYear()}-${gameDate.getMonth() + 1}-${gameDate.getDate()}-${
    gameData.darkTeam
  }-vs-${gameData.lightTeam}-${str}-${gameData.statTeam}.csv`;
};
