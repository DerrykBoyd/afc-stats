import React from 'react'
import '../styles/Subs.css';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { timeToMinSec, timeOnPoint } from '../utils/timeUtils';
import arrayMove from 'array-move';

const DragHandle = SortableHandle(() => (
    <i className={`material-icons handle`}>drag_handle</i>)
)

const SortableList = SortableContainer(({ props }) => {
    return (
        <div className='player-list sub-list'>
            {props.subStats.map((player, index) =>
                <SortableItem
                    player={player}
                    ind={index}
                    index={index}
                    key={index}
                    props={props}
                    disabled={index < 4 ? true : false}
                />
            )}
        </div>
    )
})

const SortableItem = SortableElement(({ player, ind, props }) => {
    return (
        <div className='player-input sub-player'>
            <div
                className={`player-name sub-name ${props.darkTeam === props.statTeam ? 'dark' : ''}`}
            >
                <span className='player-text'>{player.name}</span>
                {ind < 4 ?
                    <span>{`Point: ${player.lastTimeIn ? timeOnPoint(player.lastTimeIn, props.gameTime) : '0:00'}`}</span> :
                    <span>{`Total: ${timeToMinSec(player.timeOnField)}`}</span>}
            </div>
            {ind < 4 &&
                <button
                    className={`btn sub-btn ${props.subPlayerSelected === player.name ? 'btn-sec' : ''}`}
                    onClick={() => props.handleOut(player)}

                >Sub Out</button>}
            {ind >= 4 &&
                <>
                    <DragHandle />
                    <button
                        className={`btn sub-btn ${props.subPlayerSelected === player.name ? 'btn-sec' : ''}`}
                        onClick={() => props.handleIn(player)}>Sub In</button>
                </>
            }
        </div>
    )
})

export default function SubPlayerList(props) {

    const onSortEnd = ({ oldIndex, newIndex }) => {
        let updatedStats = arrayMove(props.subStats, oldIndex, newIndex)
        props.setSubStats(updatedStats);
    }

    return (
        <SortableList
            props={props}
            onSortEnd={onSortEnd}
        />
    )
}
