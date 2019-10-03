import React from 'react';
import Cell from '../cell/cell';

function Column (props){
  return (
  <div className="column" onClick={() => props.onColumnPress(props.columnId) }>
    <Cell value={props.data[0]}/>
    <Cell value={props.data[1]}/>
    <Cell value={props.data[2]}/>
    <Cell value={props.data[3]}/>
    <Cell value={props.data[4]}/>
    <Cell value={props.data[5]}/>
  </div>
)
}

export default Column;