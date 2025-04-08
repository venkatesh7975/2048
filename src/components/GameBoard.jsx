import { useState, useEffect, useCallback } from "react";
import { Card } from "react-bootstrap";
import { Howl } from "howler";
import "./GameBoard.css";

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

// Sound effects
const moveSound = new Howl({
  src: ["https://cdn.pixabay.com/audio/2022/03/15/audio_5b4cbac098.mp3"],
  volume: 0.3,
});

const winSound = new Howl({
  src: ["https://cdn.pixabay.com/audio/2022/11/24/audio_9f31f4cc3b.mp3"],
  volume: 0.5,
});

const loseSound = new Howl({
  src: ["https://cdn.pixabay.com/audio/2022/03/03/audio_e6f88985e3.mp3"],
  volume: 0.5,
});

const backgroundMusic = new Howl({
  src: ["https://cdn.pixabay.com/audio/2022/03/15/audio_f3c1fc13d2.mp3"],
  loop: true,
  volume: 0.2,
});

const GameBoard = ({ setScore }) => {
  const [grid, setGrid] = useState(getInitialGrid);
  const [gameOver, setGameOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    backgroundMusic.play();
    return () => backgroundMusic.stop();
  }, []);

  useEffect(() => {
    if (lastScore > 0) {
      setScore((prevScore) => {
        const totalScore = prevScore + lastScore;
        return isNaN(totalScore) ? prevScore : totalScore;
      });
    }
  }, [lastScore, setScore]);

  const moveLeft = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = moveGrid(currentGrid, (grid) => {
        const rows = [];
        let score = 0;

        for (let i = 0; i < GRID_SIZE; i++) {
          const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE);
          const filtered = row.filter((cell) => cell !== null);

          for (let j = 0; j < filtered.length - 1; j++) {
            if (filtered[j] === filtered[j + 1]) {
              filtered[j] *= 2;
              score += filtered[j];
              filtered[j + 1] = null;
            }
          }

          const newRow = filtered
            .filter(Boolean)
            .concat(
              Array(GRID_SIZE - filtered.filter(Boolean).length).fill(null)
            );
          rows.push(...newRow);
        }

        setLastScore(score);
        return rows;
      });
      checkGameOver(newGrid);
      return newGrid;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = moveGrid(currentGrid, (grid) => {
        const rows = [];
        let score = 0;

        for (let i = 0; i < GRID_SIZE; i++) {
          const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE).reverse();
          const filtered = row.filter((cell) => cell !== null);

          for (let j = 0; j < filtered.length - 1; j++) {
            if (filtered[j] === filtered[j + 1]) {
              filtered[j] *= 2;
              score += filtered[j];
              filtered[j + 1] = null;
            }
          }

          const newRow = filtered
            .filter(Boolean)
            .concat(
              Array(GRID_SIZE - filtered.filter(Boolean).length).fill(null)
            )
            .reverse();
          rows.push(...newRow);
        }

        setLastScore(score);
        return rows;
      });
      checkGameOver(newGrid);
      return newGrid;
    });
  }, []);

  const moveUp = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = moveGrid(currentGrid, (grid) => {
        const cols = [];
        let score = 0;

        for (let i = 0; i < GRID_SIZE; i++) {
          const col = [];
          for (let j = 0; j < GRID_SIZE; j++) col.push(grid[j * GRID_SIZE + i]);

          const filtered = col.filter(Boolean);

          for (let j = 0; j < filtered.length - 1; j++) {
            if (filtered[j] === filtered[j + 1]) {
              filtered[j] *= 2;
              score += filtered[j];
              filtered[j + 1] = null;
            }
          }

          const newCol = filtered
            .filter(Boolean)
            .concat(
              Array(GRID_SIZE - filtered.filter(Boolean).length).fill(null)
            );
          cols.push(newCol);
        }

        setLastScore(score);
        return cols[0].map((_, i) => cols.map((col) => col[i])).flat();
      });
      checkGameOver(newGrid);
      return newGrid;
    });
  }, []);

  const moveDown = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = moveGrid(currentGrid, (grid) => {
        const cols = [];
        let score = 0;

        for (let i = 0; i < GRID_SIZE; i++) {
          const col = [];
          for (let j = GRID_SIZE - 1; j >= 0; j--)
            col.push(grid[j * GRID_SIZE + i]);

          const filtered = col.filter(Boolean);

          for (let j = 0; j < filtered.length - 1; j++) {
            if (filtered[j] === filtered[j + 1]) {
              filtered[j] *= 2;
              score += filtered[j];
              filtered[j + 1] = null;
            }
          }

          const newCol = filtered
            .filter(Boolean)
            .concat(
              Array(GRID_SIZE - filtered.filter(Boolean).length).fill(null)
            )
            .reverse();
          cols.push(newCol);
        }

        setLastScore(score);
        return cols[0].map((_, i) => cols.map((col) => col[i])).flat();
      });
      checkGameOver(newGrid);
      return newGrid;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowUp":
          moveUp();
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        default:
          return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, moveUp, moveDown, moveLeft, moveRight]);

  function getInitialGrid() {
    const cells = Array(CELL_COUNT).fill(null);
    return addNewCell(addNewCell(cells));
  }

  function addNewCell(cells) {
    const empty = cells.map((v, i) => ({ v, i })).filter(({ v }) => v === null);
    if (empty.length === 0) return cells;
    const { i } = empty[Math.floor(Math.random() * empty.length)];
    const updated = [...cells];
    updated[i] = Math.random() < 0.9 ? 2 : 4;
    return updated;
  }

  function moveGrid(grid, fn) {
    const newGrid = fn(grid);
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      moveSound.play();
      if (!gameWon && newGrid.includes(2048)) {
        setGameWon(true);
        winSound.play();
      }
      return addNewCell(newGrid);
    }
    return grid;
  }

  function checkGameOver(grid) {
    if (grid.includes(null)) return;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const curr = grid[i * GRID_SIZE + j];
        if (j < GRID_SIZE - 1 && curr === grid[i * GRID_SIZE + j + 1]) return;
        if (i < GRID_SIZE - 1 && curr === grid[(i + 1) * GRID_SIZE + j]) return;
      }
    }
    setGameOver(true);
    loseSound.play();
  }

  const getCellColor = (value) => {
    const colors = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#cdc1b4";
  };

  const getTextColor = (value) => (value <= 4 ? "#776e65" : "#f9f6f2");

  return (
    <Card className="bg-light border-0 shadow">
      <Card.Body className="p-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(60px, 1fr))`,
            gap: "15px",
            background: "#bbada0",
            padding: "15px",
            borderRadius: "6px",
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {grid.map((cell, index) => (
            <div
              key={index}
              style={{
                aspectRatio: "1",
                background: getCellColor(cell),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "3px",
                fontSize: cell > 100 ? "1.5rem" : "2rem",
                fontWeight: "bold",
                color: getTextColor(cell),
                transition: "all 0.15s ease-in-out",
                wordBreak: "break-word",
              }}
            >
              {cell || ""}
            </div>
          ))}
        </div>
        {gameOver && (
          <div className="text-center mt-4">
            <h3 className="text-danger">Game Over!</h3>
          </div>
        )}
        {gameWon && (
          <div className="text-center mt-4">
            <h3 className="text-success">You Win!</h3>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default GameBoard;
