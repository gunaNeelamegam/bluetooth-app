import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, Alert, Keyboard, Modal, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PillSync from "../utils/PillSync";
import Ionicons from "react-native-vector-icons/Ionicons";





const Model = ({ modalVisible, setModalVisible, state }) => {

  const [devSet, setDevSet] = useState()
  const [isConnected, setIsConnected] = useState(false)
  const [message, setMessage] = useState()

  useEffect(() => {
    (async () => {
      let data = await AsyncStorage.getItem("devset")
      setDevSet(data)
      console.log("async devset : ", data)
    })()
  }, [])



  const onConnect = async () => {
    try {
      if (devSet) {
        await AsyncStorage.setItem("devset", devSet)
        let data = await AsyncStorage.getItem("devset")
        console.log(data);
      }
      const regex = /\S\d/g
      setMessage("")
      console.log(regex.test(devSet), devSet?.length, devSet);
      if (devSet && devSet?.length === 5 && regex.test(devSet)) {
        setIsConnected(true)
        Keyboard.dismiss()
        await PillSync.getNearbyDevices({
          devSet,
          state
        })
        setTimeout(() => {
          setIsConnected(text => !text)
          if (PillSync._connected)
            setModalVisible(isConnected)
          else
            setMessage("Device  not found")
        }, 5000)
        return
      } else {
        Alert.alert("All Fieild's are Required ", "Dev set must  be maximum 5 digit's")
      }
    } catch (error) {

    }

  }



  const disconnectAllDevices = () => {
    try {

      PillSync.disconnectAllDevices()
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View className="justify-center  flex-row items-center space-x-3 ">
            <Text className="text-justify font-semibold text-lg text-black rounded-md p-2 border-blue-400 border-2 " > {state} Skate</Text>
            <TouchableOpacity className="h-10 w-10 " onPress={disconnectAllDevices} >
              <Ionicons size={30} name="refresh-outline" color={"black"} />
            </TouchableOpacity>
          </View>
          <View className="flex-1  flex-grow items-center space-x-2 ">

            <TextInput
              defaultValue={devSet}
              placeholder="Dev Set"
              placeholderTextColor={"grey"}
              onChangeText={(text) => setDevSet(text)}
              blurOnSubmit={true}
              caretHidden={true}
              className="font-semibold text-lg border-2 mt-10 rounded-lg p-3"
              allowFontScaling={true}
              value={devSet}
              keyboardType={"number-pad"}
            />
            {isConnected && (
              <ActivityIndicator
                className="mt-5"
                size={30} color={"#247eba"} />
            )}
          </View>
          <View className="flex-1 mt-2  text-black font-semibold">
            <Text className="text-yellow-300 font-semibold">{message}</Text>
          </View>
          <View className="flex-1 flex-row justify-evenly space-x-10 absolute bottom-4">
            <TouchableOpacity
              onPress={() => {
                onConnect()
              }
              }
            >
              <Text className="text-justify font-semibold text-lg bg-blue-400 text-white rounded-md p-2" >connect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text className="text-justify font-semibold text-lg bg-blue-400   text-white rounded-md p-2" >close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    height: 300,
    width: 350,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default Model