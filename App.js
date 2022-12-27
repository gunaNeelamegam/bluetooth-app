import React, { useEffect } from 'react'
import { NavigationContainer } from "@react-navigation/native"
import RootApp from './RootApp'
import { PermissionsAndroid } from "react-native"
import usePermission from "./src/hooks/usePermission"
//STACKS


const App = () => {


  usePermission()
  


  return (
    <NavigationContainer>
      <RootApp />
    </NavigationContainer>
  )

}

export default App