import { useState } from "react";
import Square from "./square";
import './style.css'
export default function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null)); // State for all squares
  const [isXNext, setIsXNext] = useState(true); // Track whose turn it is

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return; // If the square is already filled or there's a winner, do nothing
    }

    const nextSquares = squares.slice(); // Create a copy of the squares array
    nextSquares[i] = isXNext ? "X" : "O"; // Set the value of the clicked square
    setSquares(nextSquares); // Update the state
    setIsXNext(!isXNext); // change the turn
  }

  const winner = calculateWinner(squares);
  const status = winner
    ? `Winner: ${winner}`
    : `Next player: ${isXNext ? "X" : "O"}`;

  return (
    <>
      <h1>Tic-Tac-Toe Game</h1><br></br>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>

    
    </>
  );
}

//  function to calculate the winner

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
