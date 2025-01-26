import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardBody,
  Image,
  Avatar,
  Divider,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { getCourse, enrollCourse, addCourseReview } from '../store/slices/courseSlice';
import { RootState } from '../store/store';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { currentCourse, isLoading } = useSelector((state: RootState) => state.courses);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(getCourse(id));
    }
  }, [dispatch, id]);

  const handleEnroll = async () => {
    try {
      await dispatch(enrollCourse(id!)).unwrap();
      toast({
        title: 'Enrolled Successfully',
        description: 'You have been enrolled in the course.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Enrollment Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!currentCourse || isLoading) {
    return null; // Add a loading spinner here
  }

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Main Content */}
        <VStack spacing={8} align="stretch">
          {/* Course Header */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Image
                src={currentCourse.coverImage || 'https://via.placeholder.com/800x400'}
                alt={currentCourse.title}
                borderRadius="lg"
                mb={6}
              />
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Badge colorScheme="blue">{currentCourse.difficulty}</Badge>
                  <Badge colorScheme="purple">
                    {currentCourse.modules.length} Modules
                  </Badge>
                  <Badge colorScheme="green">
                    {currentCourse.enrollmentCount} Students
                  </Badge>
                </HStack>
                <Heading size="lg">{currentCourse.title}</Heading>
                <Text color="gray.500">{currentCourse.description}</Text>
                <HStack>
                  <Avatar
                    size="sm"
                    name={currentCourse.instructor.name}
                    src={currentCourse.instructor.avatar}
                  />
                  <Text fontWeight="medium">{currentCourse.instructor.name}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Course Content */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>
                Course Content
              </Heading>
              <Accordion allowToggle>
                {currentCourse.modules.map((module, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="medium">{module.title}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {module.duration} minutes
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={4}>
                        <Text>{module.description}</Text>
                        {module.videoUrl && (
                          <Box
                            as="iframe"
                            src={module.videoUrl}
                            width="100%"
                            height="315px"
                            borderRadius="md"
                          />
                        )}
                        {module.quiz && (
                          <Button colorScheme="blue" size="sm">
                            Take Quiz
                          </Button>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>

          {/* Reviews */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>
                Student Reviews
              </Heading>
              <VStack spacing={4} align="stretch">
                {currentCourse.reviews.map((review) => (
                  <Box
                    key={review._id}
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <HStack spacing={4} mb={2}>
                      <Avatar
                        size="sm"
                        name={review.user.name}
                        src={review.user.avatar}
                      />
                      <Box>
                        <Text fontWeight="medium">{review.user.name}</Text>
                        <HStack>
                          {Array(5)
                            .fill('')
                            .map((_, i) => (
                              <StarIcon
                                key={i}
                                color={i < review.rating ? 'yellow.400' : 'gray.300'}
                              />
                            ))}
                        </HStack>
                      </Box>
                    </HStack>
                    <Text>{review.comment}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Sidebar */}
        <VStack spacing={6} align="stretch">
          {/* Course Progress */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Your Progress</Heading>
                <Progress value={30} colorScheme="blue" borderRadius="full" />
                <Text>30% Complete</Text>
                <Button colorScheme="blue" size="lg" onClick={handleEnroll}>
                  Continue Learning
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Course Stats */}
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Course Stats</Heading>
                <HStack justify="space-between">
                  <Text>Rating</Text>
                  <HStack>
                    <StarIcon color="yellow.400" />
                    <Text>{currentCourse.rating.toFixed(1)}/5.0</Text>
                  </HStack>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text>Students</Text>
                  <Text>{currentCourse.enrollmentCount}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text>Last Updated</Text>
                  <Text>
                    {new Date(currentCourse.updatedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
};

export default CourseDetails;
