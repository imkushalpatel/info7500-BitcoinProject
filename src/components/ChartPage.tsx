"use client";
import React, { useState, useEffect } from 'react';
import { request } from 'graphql-request';
import { Bar } from 'react-chartjs-2';
import { Container, Row, Col } from 'react-bootstrap';
import 'chart.js/auto';

const requestHeaders = {
  'X-API-KEY': process.env.NEXT_PUBLIC_BITQUERY_API_KEY,
};

const ChartPage: React.FC = () => {
  const [chartsData, setChartsData] = useState<any>({
    transactionsData: { datasets: [] },
    feeSpentData: { datasets: [] },
    avgFeeData: { datasets: [] },
    activeMinersData: { datasets: [] },
    minedValueData: { datasets: [] },
  });

  useEffect(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const from = oneWeekAgo.toISOString();
    const till = new Date().toISOString();
    fetchData(from, till);
  }, []);

  const fetchData = async (from: string, till: string) => {
    const query = `
      query($network: BitcoinNetwork!, $dateFormat: String!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
        bitcoin(network: $network) {
          transactions(options: { asc: "date.date" }, date: { since: $from, till: $till }) {
            date: date {
              date(format: $dateFormat)
            }
            count: countBigInt
            feeValue
            avgFee: feeValue(calculate: average)
          }
          outputs(
            options: {asc: "date.date"}
            date: {since: $from, till: $till}
            txIndex: {is: 0}
            outputDirection: {is: mining}
            outputScriptType: {notIn: ["nulldata", "nonstandard"]}
          ) {
            date: date {
              date(format: $dateFormat)
            }
            count: countBigInt(uniq: addresses)
            value
          }
        }
      }
    `;

    const variables = {
      "network": "bitcoin",
      "from": from,
      "till": till,
      "dateFormat": "%Y-%m-%d"
    };

    try {
      const response = await request('https://graphql.bitquery.io/', query, variables, requestHeaders);
      console.log('Response:', response);

      const { bitcoin: { transactions, outputs } } = response;

      const transactionsByDate = transactions.map((transaction: any) => ({
        x: transaction.date.date,
        y: transaction.count
      }));

      const feeSpentByDate = transactions.map((transaction: any) => ({
        x: transaction.date.date,
        y: transaction.feeValue
      }));

      const avgFeePerTransactionByDate = transactions.map((transaction: any) => ({
        x: transaction.date.date,
        y: transaction.avgFee
      }));

      const activeMinersByDate = outputs.map((output: any) => ({
        x: output.date.date,
        y: output.count
      }));

      const minedValueByDate = outputs.map((output: any) => ({
        x: output.date.date,
        y: output.value
      }));

      setChartsData({
        transactionsData: {
          labels: transactionsByDate.map((data: any) => data.x),
          datasets: [{
            label: 'Transactions By Date',
            data: transactionsByDate
          }]
        },
        feeSpentData: {
          labels: feeSpentByDate.map((data: any) => data.x),
          datasets: [{
            label: 'Fee Spent By Date',
            data: feeSpentByDate
          }]
        },
        avgFeeData: {
          labels: avgFeePerTransactionByDate.map((data: any) => data.x),
          datasets: [{
            label: 'Average Fee per Transaction By Date',
            data: avgFeePerTransactionByDate
          }]
        },
        activeMinersData: {
          labels: activeMinersByDate.map((data: any) => data.x),
          datasets: [{
            label: 'Active Miners By Time',
            data: activeMinersByDate
          }]
        },
        minedValueData: {
          labels: minedValueByDate.map((data: any) => data.x),
          datasets: [{
            label: 'Mined Value By Time',
            data: minedValueByDate
          }]
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1>Transactions By Date</h1>
          <Bar data={chartsData.transactionsData} />
        </Col>
        <Col>
          <h1>Fee Spent By Date</h1>
          <Bar data={chartsData.feeSpentData} />
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>Average Fee per Transaction By Date</h1>
          <Bar data={chartsData.avgFeeData} />
        </Col>
        <Col>
          <h1>Active Miners By Time</h1>
          <Bar data={chartsData.activeMinersData} />
        </Col>
      </Row>
      <Row>
        <Col>
          <h1>Mined Value By Time</h1>
          <Bar data={chartsData.minedValueData} />
        </Col>
      </Row>
    </Container>
  );
};

export default ChartPage;
