import { View, Text, SafeAreaView, PermissionsAndroid, ImageBackground, Image, TouchableOpacity, FlatList, ScrollView, } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import useLocationEnabler from '../hooks/useLocationEnabler';
import Model from '../components/Model';
import PillSync from '../utils/PillSync';

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [state, setState] = useState("");
  useLocationEnabler()


  useEffect(() => {
    (async () => {
      await PillSync.init()
    })()

    return () => {
      PillSync.removeAllListeners()
    }
  }, [])

  const moveNext = async () => {
    PillSync._registeredDevices.size >= 2
      ? navigation.navigate("Command") :
      alert(`${PillSync._registeredDevices.size} devices are  connected `)
  }
  return (
    <SafeAreaView className="flex-1  bg-white">
      <View>
        <ImageBackground
          source={require("../../assets/back.jpg")}
          className="h-full w-full  "
          blurRadius={5}
          resizeMode="cover"
        >

          <View className="justify-center items-center flex-1 " >
            <Text className="text-blue-700 text-3xl font-semibold " >Setup Your </Text>
            <Text className="text-blue-700 text-3xl font-semibold ">Skates</Text>
          </View>
          <View className="flex-1 flex-row -mt-10  justify-around ">
            <TouchableOpacity className=" bg-white rounded-full h-20 w-20" onPress={() => {
              setState("Left")
              setModalVisible(data => !data)
            }}>
              <Image source={require("../../assets/knee-pads.png")}
                className="h-20 w-20 rounded-full"
              />
              <Text className="font-semibold mt-5">PAIR NOW</Text>
            </TouchableOpacity>
            {modalVisible && (
              <Model modalVisible={modalVisible} state={state} setModalVisible={setModalVisible} />
            )}
            <TouchableOpacity className=" bg-white rounded-full h-20 w-20" onPress={() => {
              setState("Right")
              setModalVisible(data => !data)
            }}>
              <Image source={require("../../assets/knee-pads.png")}
                className="h-20 w-20 rounded-full"
              />
              <Text className="font-semibold mt-5">PAIR NOW</Text>
            </TouchableOpacity>
          </View>
          <View className=" flex-1 ml-10 w-80 mt-5 ">
            <TouchableOpacity className="bg-blue-700 p-2 rounded-xl items-center  " onPress={moveNext} >
              <Text className="font-semibold text-2xl  text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

      </View>

    </SafeAreaView>
  )
}

export default HomeScreen


