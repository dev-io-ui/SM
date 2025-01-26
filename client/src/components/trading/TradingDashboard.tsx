import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import { RootState } from '../../store/store';
import {
  executeTrade,
  getPortfolio,
  getTradingHistory,
  updateRealTimeData,
} from '../../store/slices/tradingSlice';
import TradingForm from './TradingForm';
import StockChart from './StockChart';

const TradingDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  const { portfolio, balance, trades, realTimeData, isLoading, error } = useSelector(
    (state: RootState) => state.trading
  );

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('stock_update', (data) => {
      dispatch(updateRealTimeData(data));
    });

    // Fetch initial data
    dispatch(getPortfolio());
    dispatch(getTradingHistory());

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const handleTrade = async (tradeData: any) => {
    try {
      await dispatch(executeTrade(tradeData)).unwrap();
      toast({
        title: 'Trade Executed',
        description: 'Your trade has been successfully executed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Trade Failed',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Left Column - Charts and Portfolio */}
        <VStack spacing={6} align="stretch">
          {/* Stock Chart */}
          <Box bg={bgColor} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Market Overview
            </Text>
            <StockChart data={realTimeData} />
          </Box>

          {/* Portfolio Summary */}
          <Box bg={bgColor} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Portfolio Summary
            </Text>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <Stat>
                <StatLabel>Balance</StatLabel>
                <StatNumber>${balance.toFixed(2)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Portfolio Value</StatLabel>
                <StatNumber>
                  ${portfolio.reduce((acc, item) => acc + item.quantity * (realTimeData[item.symbol]?.price || item.averageBuyPrice), 0).toFixed(2)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total P/L</StatLabel>
                <StatNumber color={portfolio.reduce((acc, item) => acc + (item.quantity * ((realTimeData[item.symbol]?.price || item.averageBuyPrice) - item.averageBuyPrice)), 0) >= 0 ? 'green.500' : 'red.500'}>
                  ${portfolio.reduce((acc, item) => acc + (item.quantity * ((realTimeData[item.symbol]?.price || item.averageBuyPrice) - item.averageBuyPrice)), 0).toFixed(2)}
                </StatNumber>
              </Stat>
            </Grid>
          </Box>

          {/* Holdings Table */}
          <Box bg={bgColor} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Current Holdings
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Symbol</Th>
                  <Th>Quantity</Th>
                  <Th>Avg. Price</Th>
                  <Th>Current Price</Th>
                  <Th>P/L</Th>
                </Tr>
              </Thead>
              <Tbody>
                {portfolio.map((holding) => {
                  const currentPrice = realTimeData[holding.symbol]?.price || holding.averageBuyPrice;
                  const pl = (currentPrice - holding.averageBuyPrice) * holding.quantity;
                  return (
                    <Tr key={holding.symbol}>
                      <Td>{holding.symbol}</Td>
                      <Td>{holding.quantity}</Td>
                      <Td>${holding.averageBuyPrice.toFixed(2)}</Td>
                      <Td>${currentPrice.toFixed(2)}</Td>
                      <Td color={pl >= 0 ? 'green.500' : 'red.500'}>
                        ${pl.toFixed(2)}
                        <StatArrow type={pl >= 0 ? 'increase' : 'decrease'} />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </VStack>

        {/* Right Column - Trading Form and History */}
        <VStack spacing={6} align="stretch">
          {/* Trading Form */}
          <Box bg={bgColor} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Execute Trade
            </Text>
            <TradingForm onSubmit={handleTrade} isLoading={isLoading} />
          </Box>

          {/* Recent Trades */}
          <Box bg={bgColor} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Recent Trades
            </Text>
            <VStack spacing={3} align="stretch">
              {trades.slice(0, 5).map((trade) => (
                <HStack key={trade._id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{trade.symbol}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(trade.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                  <Badge colorScheme={trade.type === 'buy' ? 'green' : 'red'}>
                    {trade.type.toUpperCase()}
                  </Badge>
                  <VStack align="end" spacing={0}>
                    <Text>${trade.price.toFixed(2)}</Text>
                    <Text fontSize="sm">{trade.quantity} shares</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default TradingDashboard;
