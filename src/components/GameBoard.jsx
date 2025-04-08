import { useState, useEffect, useCallback } from "react";
import { Card, Button } from "react-bootstrap";
import "./GameBoard.css";

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

const GameBoard = ({ setScore }) => {
  const [grid, setGrid] = useState(() => getInitialGrid());
  const [gameOver, setGameOver] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    if (lastScore > 0) {
      setScore((prevScore) => prevScore + lastScore);
    }
  }, [lastScore, setScore]);

  const moveGrid = (grid, moveFn) => {
    const newGrid = moveFn(grid);
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      return addNewCell(newGrid);
    }
    return grid;
  };

  const mergeLine = (line) => {
    const filtered = line.filter((cell) => cell !== null);
    let score = 0;
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        score += filtered[i];
        filtered[i + 1] = null;
      }
    }
    return {
      newLine: filtered.filter((cell) => cell !== null),
      score,
    };
  };

  const moveLeft = useCallback(() => {
    setGrid((grid) => {
      let score = 0;
      const newGrid = [];

      for (let i = 0; i < GRID_SIZE; i++) {
        const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE);
        const { newLine, score: rowScore } = mergeLine(row);
        score += rowScore;
        const filled = newLine.concat(
          Array(GRID_SIZE - newLine.length).fill(null)
        );
        newGrid.push(...filled);
      }

      setLastScore(score);
      const finalGrid = moveGrid(grid, () => newGrid);
      checkGameOver(finalGrid);
      return finalGrid;
    });
  }, []);

  const moveRight = useCallback(() => {
    setGrid((grid) => {
      let score = 0;
      const newGrid = [];

      for (let i = 0; i < GRID_SIZE; i++) {
        const row = grid.slice(i * GRID_SIZE, (i + 1) * GRID_SIZE).reverse();
        const { newLine, score: rowScore } = mergeLine(row);
        score += rowScore;
        const filled = newLine
          .concat(Array(GRID_SIZE - newLine.length).fill(null))
          .reverse();
        newGrid.push(...filled);
      }

      setLastScore(score);
      const finalGrid = moveGrid(grid, () => newGrid);
      checkGameOver(finalGrid);
      return finalGrid;
    });
  }, []);

  const moveUp = useCallback(() => {
    setGrid((grid) => {
      let score = 0;
      const cols = Array(GRID_SIZE)
        .fill()
        .map(() => []);

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          cols[i].push(grid[j * GRID_SIZE + i]);
        }
      }

      const newCols = cols.map((col) => {
        const { newLine, score: colScore } = mergeLine(col);
        score += colScore;
        return newLine.concat(Array(GRID_SIZE - newLine.length).fill(null));
      });

      const newGrid = [].concat(
        ...Array(GRID_SIZE)
          .fill()
          .map((_, rowIndex) => newCols.map((col) => col[rowIndex]))
      );
      setLastScore(score);
      const finalGrid = moveGrid(grid, () => newGrid);
      checkGameOver(finalGrid);
      return finalGrid;
    });
  }, []);

  const moveDown = useCallback(() => {
    setGrid((grid) => {
      let score = 0;
      const cols = Array(GRID_SIZE)
        .fill()
        .map(() => []);

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = GRID_SIZE - 1; j >= 0; j--) {
          cols[i].push(grid[j * GRID_SIZE + i]);
        }
      }

      const newCols = cols.map((col) => {
        const { newLine, score: colScore } = mergeLine(col);
        score += colScore;
        return newLine
          .concat(Array(GRID_SIZE - newLine.length).fill(null))
          .reverse();
      });

      const newGrid = [].concat(
        ...Array(GRID_SIZE)
          .fill()
          .map((_, rowIndex) => newCols.map((col) => col[rowIndex]))
      );
      setLastScore(score);
      const finalGrid = moveGrid(grid, () => newGrid);
      checkGameOver(finalGrid);
      return finalGrid;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameOver) {
        switch (e.key) {
          case "ArrowUp":
            return moveUp();
          case "ArrowDown":
            return moveDown();
          case "ArrowLeft":
            return moveLeft();
          case "ArrowRight":
            return moveRight();
          default:
            return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, moveLeft, moveRight, moveUp, moveDown]);

  const resetGame = () => {
    setGrid(getInitialGrid());
    setGameOver(false);
    setLastScore(0);
    setScore(0);
  };

  const checkGameOver = (grid) => {
    if (grid.includes(null)) return;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;
        const val = grid[idx];
        if (
          (j < GRID_SIZE - 1 && val === grid[idx + 1]) ||
          (i < GRID_SIZE - 1 && val === grid[idx + GRID_SIZE])
        )
          return;
      }
    }
    setGameOver(true);
  };

  function getInitialGrid() {
    const cells = Array(CELL_COUNT).fill(null);
    return addNewCell(addNewCell(cells));
  }

  function addNewCell(cells) {
    const empty = cells
      .map((cell, i) => ({ cell, i }))
      .filter(({ cell }) => cell === null);
    if (!empty.length) return cells;
    const { i } = empty[Math.floor(Math.random() * empty.length)];
    const newCells = [...cells];
    newCells[i] = Math.random() < 0.9 ? 2 : 4;
    return newCells;
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

  const getCellTextColor = (value) => (value <= 4 ? "#776e65" : "#f9f6f2");

  return (
    <Card className="bg-light border-0 shadow">
      <Card.Body className="p-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: "15px",
            background: "#bbada0",
            padding: "15px",
            borderRadius: "6px",
          }}
        >
          {grid.map((cell, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: getCellColor(cell),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "3px",
                fontSize: cell >= 1024 ? "1.25rem" : "2rem",
                fontWeight: "bold",
                color: getCellTextColor(cell),
                transition: "all 0.2s ease",
              }}
            >
              {cell || ""}
            </div>
          ))}
        </div>
        {gameOver && (
          <div className="text-center mt-4">
            <h3 className="text-danger">Game Over!</h3>
            <Button className="mt-2" onClick={resetGame}>
              Restart
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default GameBoard;
