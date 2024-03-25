"use client";
import React, { useState, useEffect } from "react";
import { request } from "graphql-request";
import { ListGroup, Card, Collapse, Button } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Block {
  height: number;
  blockHash: string;
  blockSize: number;
  transactionCount: number;
  date: { date: string };
  timestamp: { time: string };
}

interface Transaction {
  feeValue: string;
  hash: string;
  index: number;
  feeValueDecimal: number;
  txLocktime: number;
  txSize: number;
  txVersion: number;
  txVsize: number;
  txWeight: number;
  minedValue: string;
  minedValueDecimal: number;
}

const requestHeaders = {
  "X-API-KEY": process.env.NEXT_PUBLIC_BITQUERY_API_KEY,
};

const Dashboard: React.FC = () => {
  const [minedBlocks, setMinedBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [blockTransactions, setBlockTransactions] = useState<Transaction[]>([]);
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  useEffect(() => {
    fetchMinedBlocks();
  }, []);

  const fetchMinedBlocks = async () => {
    const query = `
      {
        bitcoin {
          blocks(options: { desc: "height", limit: 10 }) {
            height
            blockHash
            blockSize
            transactionCount
            date {
              date
            }
            timestamp {
              time
            }
          }
        }
      }
    `;

    try {
      const {
        bitcoin: { blocks },
      } = await request(
        "https://graphql.bitquery.io/",
        query,
        {},
        requestHeaders
      );
      setMinedBlocks(blocks);
    } catch (error) {
      console.error("Error fetching mined blocks:", error);
    }
  };

  const fetchBlockDetails = async (blockHeight: number) => {
    const query = `
      {
        bitcoin {
          blocks(options: { limit: 1}, height: { is: ${blockHeight} } ) {
            height
            blockHash
            blockSize
            transactionCount
            date {
              date
            }
            timestamp {
              time
            }
          }
          transactions(height: { is: ${blockHeight} },options: {asc: "index"}) {
            feeValue
            hash
            index
            feeValueDecimal
            txLocktime
            txSize
            txVersion
            txVsize
            txWeight
            minedValue
            minedValueDecimal
          }
        }
      }
    `;

    try {
      const {
        bitcoin: { blocks, transactions },
      } = await request(
        "https://graphql.bitquery.io/",
        query,
        {},
        requestHeaders
      );
      setSelectedBlock(blocks[0]);
      setBlockTransactions(transactions);
    } catch (error) {
      console.error("Error fetching block details:", error);
    }
  };

  const handleBlockClick = (blockHeight: number) => {
    if (blockHeight === expandedBlock) {
      setExpandedBlock(null);
    } else {
      setExpandedBlock(blockHeight);
      fetchBlockDetails(blockHeight);
    }
  };

  return (
    <div>
      <h1>Mined Blocks (Bitcoin)</h1>
      <ListGroup>
        {minedBlocks.map((block) => (
          <div key={block.blockHash}>
            <ListGroup.Item
              action
              onClick={() => handleBlockClick(block.height)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginBottom: "5px",
                backgroundColor:
                  expandedBlock === block.height ? "#f0f0f0" : "inherit",
              }}
            >
              <span>
                Block Height: {block.height}, Block Hash: {block.blockHash}
              </span>
              {expandedBlock === block.height ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </ListGroup.Item>
            <Collapse in={expandedBlock === block.height}>
              <div>
                {selectedBlock && expandedBlock === block.height && (
                  <Card style={{ marginTop: "10px" }}>
                    <Card.Body>
                      <Card.Title>Block Details</Card.Title>
                      <Card.Text>
                        <p>Block Height: {selectedBlock.height}</p>
                        <p>Block Hash: {selectedBlock.blockHash}</p>
                        <p>Block Size: {selectedBlock.blockSize}</p>
                        <p>
                          Transaction Count: {selectedBlock.transactionCount}
                        </p>
                        <p>Date: {selectedBlock.date.date}</p>
                        <p>Timestamp: {selectedBlock.timestamp.time}</p>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                )}

                {blockTransactions.length > 0 &&
                  expandedBlock === block.height && (
                    <Card style={{ marginTop: "10px" }}>
                      <Card.Body>
                        <Card.Title>Block Transactions</Card.Title>
                        <ListGroup>
                          {blockTransactions.map((transaction) => (
                            <ListGroup.Item key={transaction.index}>
                              <p>Transaction Index: {transaction.index}</p>
                              <p>Transaction Hash: {transaction.hash}</p>
                              <p>Fee Value: {transaction.feeValue}</p>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  )}
              </div>
            </Collapse>
          </div>
        ))}
      </ListGroup>
    </div>
  );
};

export default Dashboard;
