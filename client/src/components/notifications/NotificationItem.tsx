import React from 'react';
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';
import {
  FaBell,
  FaTrophy,
  FaChartLine,
  FaGraduationCap,
  FaFire,
} from 'react-icons/fa';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const unreadBgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const getIcon = () => {
    switch (notification.type) {
      case 'price_alert':
        return FaChartLine;
      case 'achievement':
        return FaTrophy;
      case 'course_progress':
        return FaGraduationCap;
      case 'daily_streak':
        return FaFire;
      default:
        return FaBell;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'price_alert':
        return 'blue.500';
      case 'achievement':
        return 'yellow.500';
      case 'course_progress':
        return 'green.500';
      case 'daily_streak':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  return (
    <Box
      p={4}
      bg={notification.read ? bgColor : unreadBgColor}
      _hover={{ bg: hoverBgColor }}
      borderRadius="md"
      transition="all 0.2s"
      position="relative"
    >
      <HStack spacing={4} align="start">
        <Icon
          as={getIcon()}
          boxSize={5}
          color={getIconColor()}
          mt={1}
        />
        <VStack align="start" spacing={1} flex={1}>
          <Text fontWeight="medium" color={textColor}>
            {notification.title}
          </Text>
          <Text fontSize="sm" color={mutedColor}>
            {notification.body}
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </Text>
        </VStack>
        {!notification.read && (
          <IconButton
            aria-label="Mark as read"
            icon={<CheckIcon />}
            size="sm"
            variant="ghost"
            onClick={() => onMarkAsRead(notification._id)}
          />
        )}
      </HStack>
    </Box>
  );
};

export default NotificationItem;
