import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
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

  const [connectedDevices, setConnectedDevices] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)


  const showAllConnectedDevices = async () => {
    try {
      await PillSync.getAllConnectedDevices(setConnectedDevices).then(res => console.log(res)).catch(console.log)
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    showAllConnectedDevices().then(console.log).catch(console.log)
  }, [isRefreshing])

  const sendCommand = async (data) => {
    try {
      console.log(data);
      await PillSync.writeInBytes(data)
    } catch (error) {
      console.log(error.message);
    }
  }


  return (

    <SafeAreaView
      className="flex-1 p-4  bg-white"
    >
      <View className="flex-1 space-x-2 ">
        {commandArray.map(item => (
          <View key={item.id} className="border-l-purple-600 border-4 border-r-0 border-y-0 text-lg  p-4 rounded-lg m-3 font-bold">
            <TouchableOpacity className="space-x-2 justify-around items-center" onPress={() => {
              sendCommand(item?.name)
            }}
            >
              <Text className="text-lg font-bold">{item?.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className=" p-2 space-x-2 ">
          <Text className="text-start text-lg font-bold text-gray-400 mt-10" > Connected SICE : </Text>
        </View>
        <FlatList
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(!isRefreshing)
            setTimeout(() => {
              setIsRefreshing(data => !data)
            }, 1000)
            return (
              <ActivityIndicator />
            )
          }}
          data={connectedDevices}
          keyExtractor={(item, index) => {
            return (item.id)
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center  mt-20 " >
              <Text className="text-xl font-extralight text-black">No Device's yet Connected</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <View key={item?.id} className=" text-lg border-white  border-2  p-4 rounded-2xl m-3 font-bold bg-[#6a2b4d]">
              <TouchableOpacity className="space-x-2 justify-around items-center" style={{
              }} onPress={() => {

              }}>
                <Text className="text-lg text-white ">{item?.name || "No Name"}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

export default CommandScreen