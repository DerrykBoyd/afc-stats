import { secsToIsoString, timeToSecs } from './timeUtils';

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
