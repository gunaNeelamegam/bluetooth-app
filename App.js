import React, { useEffect } from 'react'
import { NavigationContainer } from "@react-navigation/native"
import RootApp from './RootApp'
import { PermissionsAndroid } from "react-native"
import usePermission from "./src/hooks/usePermission"
//STACKS


const App = () => {


  // usePermission()
  const requestPermission = async () => {
    /* FIXME : Runtime Permission is automatically genarated without any explicit Permission Request  */
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);



  return (
    <NavigationContainer>
      <RootApp />
    </NavigationContainer>
  )

}

export default App