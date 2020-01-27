import React from 'react';
import GameSetup from './GameSetup';
import GameInfo from './GameInfo';
import SubPlayerList from './SubPlayerList';
import { toast } from 'react-toastify';
import { timeToSecs, timeToMinSec } from '../utils/timeUtils';

export default function Subs(props) {

    const completeSub = (playerIn, playerOut) => {
        let newSubStats = [...props.subStats];
        let inInd = newSubStats.findIndex(el => el.name === playerIn);
        let outInd = newSubStats.findIndex(el => el.name === playerOut);
        // update player out subStats
        let lastInSecs = timeToSecs(newSubStats[outInd].lastTimeIn);
        let gameTimeSecs = timeToSecs(props.gameTime);
        let shiftLength = lastInSecs - gameTimeSecs;
        newSubStats[outInd].timeOnField += shiftLength;
        newSubStats[outInd].shiftLengths.push(shiftLength);
        // add entrys to subHistory
        props.addSubHistory(newSubStats[inInd].name, newSubStats[outInd].name, newSubStats[outInd].timeOnField);
        // set the last time in for player in
        newSubStats[inInd].lastTimeIn = props.gameTime;
        // switch players in the subStats arr
        [newSubStats[inInd], newSubStats[outInd]] = [newSubStats[outInd], newSubStats[inInd]];
        props.setSubStats(newSubStats);
        props.setSubInSelected(false);
        props.setSubOutSelected(false);
        props.setSubPlayerSelected('');
        toast.dismiss();
        toast.success(`Subbed in ${playerIn} for ${playerOut}`)
    }

    const finishGameSubs = () => {
        let newSubStats = [...props.subStats];
        // update timeOnField for 4 players on field at game end
        for (let i = 0; i < 4; i++) {
            let lastInSecs = timeToSecs(newSubStats[i].lastTimeIn);
            let gameTimeSecs = timeToSecs(props.gameTime);
            let shiftLength = lastInSecs - gameTimeSecs;
            newSubStats[i].timeOnField += shiftLength;
            newSubStats[i].shiftLengths.push(shiftLength);
        }
        for (let sub of newSubStats) {
            sub.timeMMSS = timeToMinSec(sub.timeOnField);
            sub.shifts = sub.shiftLengths.length;
            sub.averageTimeOnSecs = sub.timeOnField / sub.shifts || 0;
            sub.averageTimeOnMMSS = timeToMinSec(sub.averageTimeOnSecs);
        }
        props.setSubStats(newSubStats);
    }

    const handleOut = (player) => {
        if (props.subOutSelected) {
            props.setSubPlayerSelected(player.name);
            return;
        }
        if (props.subInSelected) {
            completeSub(props.subPlayerSelected, player.name);
            return;
        }
        props.setSubPlayerSelected(player.name);
        props.setSubOutSelected(true);
    }

    const handleIn = (player) => {
        if (props.subInSelected) {
            props.setSubPlayerSelected(player.name)
            return;
        }
        if (props.subOutSelected) {
            completeSub(player.name, props.subPlayerSelected);
            return;
        }
        props.setSubPlayerSelected(player.name);
        props.setSubInSelected(true);
    }

    return (
        <div className='App'>
            {!props.showStatSetup &&
                <p>Currently tracking Stats.</p>}
            {props.showStatSetup && props.showSubSetup &&
                <GameSetup
                    teams={props.teams}
                    finishSetup={props.finishSetup}
                    setTestGame={props.setTestGame}
                    forStats={false}
                />}
            {props.showStatSetup && !props.showSubSetup &&
                <div className='game-stats'>
                    <GameInfo
                        darkTeam={props.darkTeam}
                        lightTeam={props.lightTeam}
                        gameTime={props.gameTime}
                        gameLength={props.gameLength}
                        startTimer={props.startTimer}
                        pauseTimer={props.pauseTimer}
                        resetTimer={props.resetTimer}
                        paused={props.paused}
                        setPaused={props.setPaused}
                        forStats={false}
                    />
                    <div className='game-options'>
                        <button className='btn opt-btn'
                            onClick={() => {
                                if (window.confirm('Cancel Game? Progress will not be saved.')) {
                                    toast.dismiss();
                                    toast.error('Game Deleted', { autoClose: 2000 });
                                    props.resetGame();
                                }
                            }}>Exit Game</button>
                        <button className={`btn ${!props.paused ? 'btn-inactive' : ''} opt-btn`}
                            onClick={() => {
                                if (!props.paused) {
                                    toast.error('Cannot finish game when timer is running. Pause timer to finish game early.', { autoClose: 2500 })
                                    return;
                                }
                                finishGameSubs();
                                toast.dismiss();
                                toast.success('Game Saved', { autoClose: 2000 });
                                props.saveGame('subs');
                            }}>Finish & Save</button>
                    </div>
                    <SubPlayerList
                        subStats={props.subStats}
                        setSubStats={props.setSubStats}
                        darkTeam={props.darkTeam}
                        lightTeam={props.lightTeam}
                        statTeam={props.statTeam}
                        handleIn={handleIn}
                        handleOut={handleOut}
                        subPlayerSelected={props.subPlayerSelected}
                        gameLength={props.gameLength}
                        gameTime={props.gameTime}
                    />
                </div>}
        </div>
    )
}
