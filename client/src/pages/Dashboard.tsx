import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { getAchievements } from '../store/slices/gamificationSlice';
import { getCourses } from '../store/slices/courseSlice';
import { getPortfolio } from '../store/slices/tradingSlice';
import { RootState } from '../store/store';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { achievements } = useSelector((state: RootState) => state.gamification);
  const { enrolledCourses } = useSelector((state: RootState) => state.courses);
  const { portfolio, balance } = useSelector((state: RootState) => state.trading);

  useEffect(() => {
    dispatch(getAchievements());
    dispatch(getCourses());
    dispatch(getPortfolio());
  }, [dispatch]);

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={6}
        mb={8}
      >
        {/* Progress Stats */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
          <CardHeader>
            <Heading size="md">Learning Progress</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between">
                  <Text>Level {achievements?.level}</Text>
                  <Text>{achievements?.points} XP</Text>
                </HStack>
                <Progress
                  value={(achievements?.points % 1000) / 10}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
              <HStack spacing={2}>
                {achievements?.badges.slice(0, 3).map((badge) => (
                  <Badge key={badge.name} colorScheme="blue" variant="subtle">
                    {badge.name}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Trading Stats */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
          <CardHeader>
            <Heading size="md">Trading Overview</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel>Portfolio Value</StatLabel>
                <StatNumber>
                  ${portfolio.reduce((acc, item) => acc + item.quantity * item.averageBuyPrice, 0).toFixed(2)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  23.36%
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Available Balance</StatLabel>
                <StatNumber>${balance.toFixed(2)}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Daily Streak */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
          <CardHeader>
            <Heading size="md">Daily Streak</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Stat>
                <StatLabel>Current Streak</StatLabel>
                <StatNumber>{achievements?.dailyStreak.count} days</StatNumber>
                <StatHelpText>Keep learning daily!</StatHelpText>
              </Stat>
              <Progress
                value={achievements?.dailyStreak.count % 7}
                max={7}
                colorScheme="green"
                size="sm"
                borderRadius="full"
              />
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Course Progress */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg" mb={8}>
        <CardHeader>
          <Heading size="md">Course Progress</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {enrolledCourses.map((course) => (
              <Box
                key={course._id}
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
              >
                <VStack align="stretch" spacing={2}>
                  <Heading size="sm">{course.title}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    {course.difficulty}
                  </Text>
                  <Progress
                    value={70}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="sm">70% Complete</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
        <CardHeader>
          <Heading size="md">Recent Activity</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {achievements?.completedCourses.slice(-3).map((activity) => (
              <HStack
                key={activity.course._id}
                justify="space-between"
                p={3}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{activity.course.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Completed course
                  </Text>
                </VStack>
                <Badge colorScheme="green">
                  Grade: {activity.grade}%
                </Badge>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
