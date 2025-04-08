import { Row, Col, Card } from "react-bootstrap";

const ScoreBoard = ({ score, bestScore }) => {
  return (
    <Row className="mb-4">
      <Col xs={6}>
        <Card className="text-center bg-light border-0 shadow-sm">
          <Card.Body>
            <Card.Title className="text-muted mb-0">SCORE</Card.Title>
            <Card.Text className="display-6 fw-bold text-primary mb-0">
              {score}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={6}>
        <Card className="text-center bg-light border-0 shadow-sm">
          <Card.Body>
            <Card.Title className="text-muted mb-0">BEST</Card.Title>
            <Card.Text className="display-6 fw-bold text-success mb-0">
              {bestScore}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ScoreBoard;
