export const timeToMinSec = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds - mins * 60);
  return `${mins.toString()}:${secs.toString().padStart(2, 0)}`;
};

export const timeToSecs = (minSecs) => {
  if (!minSecs) return 0;
  let times = minSecs.split(':');
  return parseInt(times[0]) * 60 + parseInt(times[1]);
};

export const timeOnPoint = (lastTimeIn, gameTime) => {
  let timeOnSecs = timeToSecs(lastTimeIn) - timeToSecs(gameTime);
  return timeToMinSec(timeOnSecs);
};

export const secsToIsoString = (seconds) => {
  let date = new Date(parseInt(seconds * 1000));
  return date.toISOString().substr(11, 12);
}
