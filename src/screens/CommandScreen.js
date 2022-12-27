import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import PillSync from '../utils/PillSync'

const commandArray = [
  {
    name: "start".toUpperCase(),
    id: 1,
  }, {
    name: "stop".toUpperCase(),
    id: 2,
  }, {
    name: "dump".toUpperCase(),
    id: 3,
  }, {
    name: "dumpstop".toUpperCase(),
    id: 4,
  }
]

const CommandScreen = () => {

  const sendCommand = async (data) => {
    try {
      console.log(data);
      await PillSync.writeInBytes(data)
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    console.log(PillSync._registeredDevices);
  }, [])

  return (

    <SafeAreaView
      className="flex-1 p-4  bg-white"
    >
      <View className="flex-1 space-x-2 ">
        {commandArray.map(item => (
          <View key={item.id} className="border-2 text-lg  p-4 rounded-lg m-3 font-bold">
            <TouchableOpacity className="space-x-2 justify-around items-center" style={{
            }} onPress={() => {
              sendCommand(item.name)
            }}>
              <Text className="text-lg ">{item.name}</Text>
            </TouchableOpacity>
          </View>
        ))}


      </View>
    </SafeAreaView>
  )
}

export default CommandScreen