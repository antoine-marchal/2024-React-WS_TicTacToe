import "./App.css";
import React, { useState, useEffect } from "react";

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const App = () => {
  const [ws, setWs] = useState(null);
  const [gameState, setGameState] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState(null);
  const [turn, setTurn] = useState(null);
  const [message, setMessage] = useState("Connecting to server...");
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(
      "ws://" + window.location.hostname + ":" + window.location.port
    );

    socket.onopen = () => {
      setMessage("Connected to server. Waiting for an opponent...");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "start") {
        setPlayer(data.player);
        setTurn(data.turn);
        setMessage(`Game started. You are player ${data.player}`);
        document
          .querySelectorAll(".board")
          .forEach((e) => (e.style.display = ""));
      } else if (data.type === "opponent_left") {
        setMessage("Your opponent left the game.");
      } else if (data.type === "move") {
        setGameState(data.board);
        setTurn(data.turn);
        const winner_c = checkWinner(data.board);
        if (winner_c) {
          setWinner(winner_c);
          setMessage(winner_c === player ? "You won!" : "You lost!");
        } else if (!data.board.includes(null)) {
          setWinner("Draw");
          setMessage("It's a draw!");
        }
      }
    };

    socket.onclose = () => {
      setMessage("Connection closed. Please refresh to try again.");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [player]);

  const handleClick = (index) => {
    if (gameState[index] || turn !== player || !ws || winner) return;

    const newGameState = [...gameState];
    newGameState[index] = player;

    const winner_c = checkWinner(newGameState);

    setGameState(newGameState);
    setTurn(player === "X" ? "O" : "X");

    ws.send(
      JSON.stringify({
        type: "move",
        board: newGameState,
        turn: player === "X" ? "O" : "X",
      })
    );

    if (winner_c) {
      setWinner(winner_c);
      setMessage(winner_c === player ? "You won!" : "You lost!");
    } else if (!newGameState.includes(null)) {
      setWinner("Draw");
      setMessage("It's a draw!");
    }
  };

  const checkWinner = (board) => {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  return (
    <div>
      <h1>TicTacToe multiplayer Game !</h1>
      <h2>{message}</h2>
      {turn && !winner && (
        <h3>{turn === player ? `It's your turn` : `It's ${turn}'s turn`}</h3>
      )}
      <div className="board" style={{ display: "none" }}>
        {gameState.map((value, index) => (
          <div key={index} className="cell" onClick={() => handleClick(index)}>
            {value}
          </div>
        ))}
      </div>
      <p className="footer">
        a tiny project designed by{" "}
        <a href="mailto:antoine.marchal@pm.me">Antoine Marchal</a>.
      </p>
    </div>
  );
};

export default App;
