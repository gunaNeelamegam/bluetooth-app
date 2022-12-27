/**
 * Sample BLE React Native Demo
 *
 * @format
 * @flow strict-local
 */

import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { stringToBytes, bytesToString } from "convert-string";
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

var service = '0000aabb-0000-1000-8000-075c20ced1ce';
var writeCharacteristic = '00001bb1-0000-1000-8000-00805f9b34fb'; //aa -> cmd
var readCharacteristic = '00001aa1-0000-1000-8000-00805f9b34fb'; //bb - response
const Demo = () => {

  async function _getLocationPermission() {
    if (Platform.OS !== "android" && Platform.Version < 23) {
      return true;
    }

    try {
      let isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (isGranted) return;

      isGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location access!",
          message: "Allow MedUKlick to access device's location?",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (isGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        alert("Location permission denied");
        return false;
      } else {
        return true;
      }
    } catch (err) {
      console.log("Error getting location permission:", err);
      return false;
    }
  }



  const requestPermission = async () => {
    try {
      const response = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      if (Platform.OS == "android" && Platform.Version >= 31) {
        if (
          response["android.permission.BLUETOOTH_CONNECT"] ===
          "never_ask_again" ||
          response["android.permission.BLUETOOTH_SCAN"] === "never_ask_again"
        ) {

          return;
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // useEffect(() => {
  //   (async () => {
  //     console.log("request permission");
  //     await requestPermission()
  //   })()
  // })




  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);


  // const sendData = async (data) => {
  //   console.log(data);
  //   list.filter(((peripheral) => {
  //     if (peripheral?.name.includes("SICE")) {
  //       console.log("INDSIDE : ", peripheral.name);
  //       return peripheral
  //     }
  //   })).forEach(async (peri) => {
  //     console.log(peri, "inside filterd");
  //     if (peri?.advertising.isConnectable == false) {
  //       BleManager.retrieveServices(peri.id).then(retire => {
  //       }).catch(err => {
  //         console.log(err.message);
  //       })
  //       const dataArray = stringToBytes(data);
  //       console.log(dataArray);
  //       BleManager.write(peri.id, service, writeCharacteristic, dataArray).then(() => {
  //         console.log("writed successfully");
  //       }).catch(err => {
  //         console.log(err.message);
  //       });
  //     }
  //   })

  // }



  const sendData = async () => {

    console.log("in : ", peripherals);

  }
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        setIsScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));

    }
    console.log('Disconnected from ' + data.peripheral);
  }

  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  }

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    console.log("Inside : ", peripherals);
    setList(Array.from(peripherals.values()));
  }

  const testPeripheral = async (peripheral) => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        await BleManager.createBond(peripheral.id)
        BleManager.connect(peripheral.id).then(() => {
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            setList(Array.from(peripherals.values()));
          }
          console.log('Connected to ' + peripheral.id);


          setTimeout(() => {

            /* Test read current RSSI value */
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);


              BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
                console.log(peripheralInfo);




                BleManager.startNotification(peripheral.id, service, readCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);

                }).catch((error) => {
                  console.log('Notification error', error);
                });

              });

            })

          }, 1000);

        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }

  }

  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    return (() => {
      console.log('unmount');
      bleManagerEmitter.removeAllListeners("BleManagerDiscoverPeripheral")
      bleManagerEmitter.removeAllListeners("BleManagerStopScan")
      bleManagerEmitter.removeAllListeners("BleManagerDisconnectPeripheral")
      bleManagerEmitter.removeAllListeners("BleManagerDidUpdateValueForCharacteristic")

    })
  }, []);

  const renderItem = (item) => {


    console.log("ID : ", item);

    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => testPeripheral(item)}>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 10 }}>{item.name}</Text>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#333333', padding: 2 }}>RSSI: {item.rssi}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20 }}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>

            <View style={{ margin: 10 }}>
              <Button
                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan()}
              />
            </View>

            <View style={{ margin: 10 }}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />

            </View>
            <View style={{ margin: 10 }}>
              <Button title="Start" onPress={() => sendData("start")} />

            </View>
            <View style={{ margin: 10 }}>
              <Button title="Stop" onPress={() => sendData("stop")} />

            </View>
            <View style={{ margin: 10 }}>
              <Button title="Dump" onPress={() => sendData("Dump")} />

            </View>
            <View style={{ margin: 10 }}>
              <Button title="Dump Down" onPress={() => sendData("Dumpdown")} />

            </View>


            {(list.length == 0) &&
              <View style={{ flex: 1, margin: 20 }}>
                <Text style={{ textAlign: 'center' }}>No peripherals</Text>
              </View>
            }

          </View>
        </ScrollView>
        <FlatList
          data={list}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default Demo;