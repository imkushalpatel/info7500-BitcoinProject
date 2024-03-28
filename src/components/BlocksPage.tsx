"use client";
import React, { useState, useEffect } from "react";
import { request } from "graphql-request";
import Table from "react-bootstrap/Table";

const requestHeaders = {
  "X-API-KEY": process.env.NEXT_PUBLIC_BITQUERY_API_KEY,
};

const BlocksPage: React.FC = () => {
  const [blocksData, setBlocksData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchBlocksData(selectedDate);
  }, [selectedDate]);

  const fetchBlocksData = async (date: string) => {
    const query = `
      query($network: BitcoinNetwork!, $date: ISO8601DateTime!, $limit: Int!, $offset: Int!) {
        bitcoin(network: $network) {
          blocks(
            options: { asc: ["height"], limit: $limit, offset: $offset }
            date: { is: $date }
          ) {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
            medianTime {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
            blockHash
            blockSizeBigInt
            blockStrippedSize
            blockVersion
            blockWeight
            chainwork
            difficulty
            transactionCount
            height
          }
        }
      }
    `;
    const variables = {
      network: "bitcoin",
      date: date,
      limit: 10,
      offset: 0,
    };

    try {
      const response = await request(
        "https://graphql.bitquery.io/",
        query,
        variables,
        requestHeaders
      );
      if (response && response.bitcoin && response.bitcoin.blocks) {
        setBlocksData(response.bitcoin.blocks);
      }
    } catch (error) {
      console.error("Error fetching block data:", error);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedDate(value);
  };

  return (
    <div>
      <h1>Blocks Details Per Day</h1>
      <input type="date" value={selectedDate} onChange={handleDateChange} />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Height</th>
            <th>Timestamp</th>
            {/* <th>Median Time</th> */}
            <th>Block Hash</th>
            <th>Block Size (Bytes)</th>
            <th>Stripped Size (Bytes)</th>
            <th>Block Version</th>
            <th>Block Weight</th>
            {/* <th>Chainwork</th> */}
            <th>Difficulty</th>
            <th>Transaction Count</th>
          </tr>
        </thead>
        <tbody>
          {blocksData.map((block: any, index: number) => (
            <tr key={index}>
              <td>{block.height}</td>
              <td>{block.timestamp.time}</td>
              {/* <td>{block.medianTime.time}</td> */}
              <td>{block.blockHash}</td>
              <td>{block.blockSizeBigInt}</td>
              <td>{block.blockStrippedSize}</td>
              <td>{block.blockVersion}</td>
              <td>{block.blockWeight}</td>
              {/* <td>{block.chainwork}</td> */}
              <td>{block.difficulty}</td>
              <td>{block.transactionCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BlocksPage;
