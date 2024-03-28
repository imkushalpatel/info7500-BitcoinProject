import BitcoinChartsPage from "@/components/ChartPage";
import BlockList from "@/components/BlockList";
import BlocksPage from "@/components/BlocksPage";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Home() {
  return (
    <>
      <Container>
        <Row>
          <BlockList />
        </Row>

        <Row>
          <BitcoinChartsPage />
        </Row>
        <Row>
          <BlocksPage />
        </Row>
      </Container>
    </>
  );
}
