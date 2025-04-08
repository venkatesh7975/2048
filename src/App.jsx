import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import GameBoard from "./components/GameBoard";
import ScoreBoard from "./components/ScoreBoard";
import "./App.css";

function App() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("bestScore")) || 0
  );

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", score);
    }
  }, [score, bestScore]);

  const handleNewGame = () => {
    setScore(0);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="text-center mb-4">
            <h1 className="display-1 fw-bold text-primary">2048</h1>
            <p className="lead">Join the numbers and get to the 2048 tile!</p>
          </div>
          <ScoreBoard score={score} bestScore={bestScore} />
          <div className="text-center mb-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNewGame}
              className="rounded-pill px-4"
            >
              New Game
            </Button>
          </div>
          <GameBoard setScore={setScore} />
          <div className="mt-4">
            <p className="text-muted text-center">
              <small>
                Use arrow keys to move the tiles. When two tiles with the same
                number touch, they merge into one!
              </small>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
