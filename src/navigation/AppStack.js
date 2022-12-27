import { createNativeStackNavigator } from "@react-navigation/native-stack"

//Screen's

import HomeScreen from "../screens/HomeScreen"
import Demo from "../screens/Demo"
import CommandScreen from "../screens/CommandScreen"
const Stack = createNativeStackNavigator()

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: "Smsk",
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Command" component={CommandScreen} />

    </Stack.Navigator>
  )
}

export default AppStack