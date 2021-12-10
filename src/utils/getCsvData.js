import { secsToIsoString, timeToSecs } from './timeUtils';

/** Takes a stats game object and converts times to HH:MM:SS.mmm
 * @param {object} game - The game object
 * @returns {gameHistoryCsv: object, playerStatsCsv: object} - The game object with times converted to HH:MM:SS.mmm
 */
export function getStatsCsvData(game) {
  if (!game.gameHistory) return {};

  const teams = Object.keys(game.gameHistory[0]).filter((key) => key.includes('_score'));
  const statTeam = game.gameHistory[0].statTeam;
  const otherTeam = teams.find((team) => !team.includes(statTeam)).split('_')[0];

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
