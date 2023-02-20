export const timeToMinSec = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds - mins * 60);
  return `${mins.toString()}:${secs.toString().padStart(2, 0)}`;
};

export const timeToSecs = (minSecs: string) => {
  if (!minSecs) return 0;
  const times = minSecs.split(":");
  return parseInt(times[0]) * 60 + parseInt(times[1]);
};

export const timeOnPoint = (lastTimeIn: string, gameTime: string) => {
  const timeOnSecs = timeToSecs(lastTimeIn) - timeToSecs(gameTime);
  return timeToMinSec(timeOnSecs);
};

export const secsToIsoString = (seconds: number) => {
  const date = new Date(Math.round(seconds * 1000));

  return date.toISOString().substr(11, 12);
};
