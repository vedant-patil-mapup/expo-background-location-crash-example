import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0
      });
    }
  }
};

const PermissionsButton = () => {
  const [isServiceActive, setIsServiceActive] = useState(false);

  const registerLocationService = async () => {
    try {
      console.log('Requesting foreground permissions');
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === Location.PermissionStatus.GRANTED) {
        console.log('Requesting background permissions');
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === Location.PermissionStatus.GRANTED) {
          console.log('Registering location service');
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
            activityType: Location.ActivityType.AutomotiveNavigation,
            timeInterval: 5000,
            distanceInterval: 0,
          });
          setIsServiceActive(true);
          console.log('Registered location service');
        }
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const unregisterLocationService = async () => {
    try {
      console.log('Terminating service');
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsServiceActive(false);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const isActive = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      setIsServiceActive(isActive);
    })();
  }, []);
  
  return (
  <View style={styles.container}>
    <Button onPress={registerLocationService} title="Enable background location" />
    <View style={{height: 20}} />
    {isServiceActive && <Button onPress={unregisterLocationService} title="Disable background location" />}
  </View>
)};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.log("Error:", error)
    return;
  }
  if (data) {
    const { locations } = data;
    console.log("Location length", locations.length)
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PermissionsButton;
