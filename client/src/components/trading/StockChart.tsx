import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, useColorModeValue } from '@chakra-ui/react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  data: {
    [key: string]: {
      price: number;
      change: number;
      volume: number;
    };
  };
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const lineColor = useColorModeValue('rgb(75, 192, 192)', 'rgb(132, 99, 255)');

  useEffect(() => {
    // Convert realtime data to chart format
    const timestamps = Object.keys(data).map((symbol) =>
      new Date().toLocaleTimeString()
    );
    const prices = Object.values(data).map((stock) => stock.price);

    setChartData({
      labels: timestamps,
      datasets: [
        {
          label: 'Stock Price',
          data: prices,
          fill: false,
          borderColor: lineColor,
          tension: 0.1,
        },
      ],
    });
  }, [data, lineColor]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-time Stock Prices',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    animation: {
      duration: 0, // Disable animation for real-time updates
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Box height="400px">
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default StockChart;
