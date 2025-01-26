import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Icon,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon } from '@chakra-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '../../store/slices/notificationSlice';
import NotificationItem from './NotificationItem';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const bgColor = useColorModeValue('white', 'gray.800');

  const { notifications, unreadCount, loading } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isOpen]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const filterNotifications = (read: boolean) => {
    return notifications.filter((notification) => notification.read === read);
  };

  return (
    <>
      <Box position="relative">
        <IconButton
          aria-label="Notifications"
          icon={<BellIcon />}
          variant="ghost"
          onClick={() => setIsOpen(true)}
        />
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
            minW="5"
            textAlign="center"
          >
            {unreadCount}
          </Badge>
        )}
      </Box>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack justify="space-between" align="center">
              <Text>Notifications</Text>
              <Button
                size="sm"
                leftIcon={<Icon as={CheckIcon} />}
                onClick={handleMarkAllAsRead}
                isDisabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <Tabs
              isFitted
              variant="enclosed"
              index={activeTab}
              onChange={(index) => setActiveTab(index)}
            >
              <TabList>
                <Tab>
                  Unread
                  {unreadCount > 0 && (
                    <Badge ml={2} colorScheme="red" borderRadius="full">
                      {unreadCount}
                    </Badge>
                  )}
                </Tab>
                <Tab>All</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={2} align="stretch">
                    {filterNotifications(false).map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                    {filterNotifications(false).length === 0 && (
                      <Box textAlign="center" py={8} color="gray.500">
                        No unread notifications
                      </Box>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={2} align="stretch">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                    {notifications.length === 0 && (
                      <Box textAlign="center" py={8} color="gray.500">
                        No notifications
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationCenter;
