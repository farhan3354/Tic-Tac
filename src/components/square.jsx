// import {useState} from "react";
import React from "react";

function Square({ value, onSquareClick }) {
//    const [count, setcount] = useState(0);
//     function handle(){
//         setcount(count+1);
//     }

  return (
    <>
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
      {/* <button onClick={handle}>{count}</button> */}
    </>
  );
}
export default Square;
