import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Input,
  Select,
  HStack,
  VStack,
  Badge,
  Card,
  CardBody,
  Image,
  Stack,
  Divider,
  ButtonGroup,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getCourses, setFilters, setPage } from '../store/slices/courseSlice';
import { RootState } from '../store/store';

const Courses: React.FC = () => {
  const dispatch = useDispatch();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { courses, filters, pagination, isLoading } = useSelector(
    (state: RootState) => state.courses
  );

  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch, filters, pagination.page]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ [e.target.name]: e.target.value }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
      {/* Header */}
      <VStack spacing={8} align="stretch" mb={8}>
        <Box>
          <Heading size="lg" mb={2}>
            Courses
          </Heading>
          <Text color="gray.500">
            Learn stock market trading with our comprehensive courses
          </Text>
        </Box>

        {/* Filters */}
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
              align={{ base: 'stretch', md: 'center' }}
            >
              <HStack flex="2">
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  onClick={handleSearch}
                  isLoading={isLoading}
                />
              </HStack>
              <Select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
              <Select name="sort" value={filters.sort} onChange={handleFilterChange}>
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-rating">Highest Rated</option>
                <option value="-enrollmentCount">Most Popular</option>
              </Select>
            </Stack>
          </CardBody>
        </Card>
      </VStack>

      {/* Course Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
        mb={8}
      >
        {courses.map((course) => (
          <Card
            key={course._id}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            <Image
              src={course.coverImage || 'https://via.placeholder.com/400x200'}
              alt={course.title}
              height="200px"
              objectFit="cover"
            />
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <HStack mb={2}>
                    <Badge colorScheme={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <Badge colorScheme="purple">{course.modules.length} Modules</Badge>
                  </HStack>
                  <Heading size="md" mb={2}>
                    {course.title}
                  </Heading>
                  <Text color="gray.500" noOfLines={2}>
                    {course.description}
                  </Text>
                </Box>

                <Divider />

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">
                      Instructor
                    </Text>
                    <Text fontWeight="medium">{course.instructor.name}</Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" color="gray.500">
                      Rating
                    </Text>
                    <Text fontWeight="medium">{course.rating.toFixed(1)}/5.0</Text>
                  </VStack>
                </HStack>

                <Button
                  as={RouterLink}
                  to={`/courses/${course._id}`}
                  colorScheme="blue"
                  width="full"
                >
                  View Course
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Pagination */}
      <Flex align="center" justify="center" mb={8}>
        <ButtonGroup variant="outline" spacing={2}>
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            isDisabled={pagination.page === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            isDisabled={pagination.page * pagination.limit >= pagination.total}
          >
            Next
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

export default Courses;
