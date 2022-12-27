import { stringToBytes,bytesToString } from "convert-string";
import {
    NativeModules,
    NativeEventEmitter,
    Platform,
    ToastAndroid,
  } from "react-native";
  import BleManager from "react-native-ble-manager";
  
  const SERVICE_UUID = '0000aabb-0000-1000-8000-075c20ced1ce';
  const WRITE_CHAR_UUID = '00001aa1-0000-1000-8000-00805f9b34fb';;
  const READ_CHAR_UUID = '00001bb1-0000-1000-8000-00805f9b34fb';

 


  const BleManagerModule = NativeModules.BleManager;
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

  const PillSync = new (class {
    constructor() {
      this._initialized = false;
      this._connected = false;
      this._isConnecting = false;
      this.dataSet={};
      this.LEFT_SICT=`SICE_L`
      this.RIGHT_SICT=`SICE_R`;
      this.connectedDevices=[];
      this.peripherals={};
      this.registeredDevices=[]
      this.isCreatingBond=true;
      this._registeredDevices = new Map();
      this.peripheralId = false;
      this._subscriptions = [
        BleManagerEmitter.addListener(
          "BleManagerStopScan",
          this._hdlStopScan.bind(this)
        ),
        BleManagerEmitter.addListener(
          "BleManagerDiscoverPeripheral",
          this._hdlDiscover.bind(this)
        ),
        BleManagerEmitter.addListener(
          "BleManagerConnectPeripheral",
          this._hdlConnect.bind(this)
        ),
        BleManagerEmitter.addListener(
          "BleManagerDisconnectPeripheral",
          this._hdlDisconnect.bind(this)
        ),
        BleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', (data)=>{
          console.log("DATA RECIVED : ",data.value)
        }),
        BleManagerEmitter.addListener("BleManagerDidUpdateState", async(args) => {
          console.log("BLE STATE : ",args);
          const {state}=args
          if(state === "off"){
          await  BleManager.enableBluetooth()
          }
        }),
        BleManagerEmitter.addListener(
          "BleManagerDidUpdateValueForCharacteristic",
          ({ value, peripheral, characteristic, service }) => {
            const data = bytesToString(value);
           ToastAndroid.showWithGravity(data,ToastAndroid.LONG,ToastAndroid.CENTER)
          }
        )

      ];
    }

   async getAllConnectedDevices(callBack=null){
    await  BleManager.getConnectedPeripherals([SERVICE_UUID]).then((result) => {
      callBack(result)
      }).catch((err) => {
        console.log(err.message);
      });
    }
  
     retrieveConnected = (results) => {
      BleManager.getConnectedPeripherals([]).then((results) => {
        if (results.length == 0) {
          console.log('No connected peripherals')
        }
        console.log(results);
        for (var i = 0; i < results.length; i++) {
          var peripheral = results[i];
          peripheral.connected = true;
          this.peripherals.set(peripheral.id, peripheral);
          this.connectedDevices = [...Array.from(this.peripherals.values())];
        }
      });
    }

    disconnectAllDevices=()=>{
      try {
        
        this._registeredDevices.forEach((async(peripheral,id)=>{
         await BleManager.disconnect(id)
        }))
        console.log(this._registeredDevices.length
          );
        console.log("Disconnected All Device's");
      } catch (error) {
        console.log(error.message);
      }
    }

     writeInBytes = async (data)=>{
      try {
          this._registeredDevices.forEach(async(peripheral,peripheralId)=>{
            let  dataBytes=stringToBytes(data) 
              console.log("DATA IN BYTES : ",dataBytes);
              this._connectAndRetrieve(peripheralId)
                BleManager.writeWithoutResponse(
                 peripheralId ,
                 SERVICE_UUID,
                 WRITE_CHAR_UUID,
                 dataBytes
               ).then(async() => {
                   console.log("Write: " + data);
                 })
                 .catch((error) => {
                   console.log(error);
                 });
               })
               .catch(error=>{
                 console.log(error.message);
               })
      } catch (error) {
        console.log(error.message);
      }
      
    }

    async init() {
      if (Platform.OS === "android") {
        try {
          await BleManager.enableBluetooth();
        } catch (err) {
          console.log("User refuses to enable bluetooth:", err);
        }
      }
      try {
        await BleManager.start({ showAlert: Platform.OS === "android" ?false :true });
      } catch (err) {
        console.log("Unable to initialize bluetooth:", err);
      }
      this._initialized = true;
    }
  
    async reset() {
      this.peripheralId = false;
      if (!this._initialized) return;
  
      if (this._connected) {
        let connectedList;
        try {
          connectedList = await BleManager.getConnectedPeripherals([]);
        } catch (err) {
          console.log("Getting connected peripherals failed:", err);
        }
        for (let peripheral of connectedList) {
          try {
            await BleManager.disconnect(peripheral.id);
          } catch (err) {
            console.log("Error Disconnecting peripheral", peripheral.id, err);
          }
        }
      }
      this._discoverCallbacks = [null, null];
    }
  
  
    _hdlStopScan() {
      console.log("Scan stoped");
    }
  
    _hdlDisconnect(id) {
      this.peripheralId = false;
      this._connected = false;
      console.log(typeof id);
     delete this._registeredDevices[`${id}`]
     console.log(this._registeredDevices);
      console.log(id, "disconnected");
    }
  
    _hdlDiscover(peripheral) {
      try{
        const {id}=peripheral
        var regex =/\b^(SICE_[LR])*/ig;
        if(regex.test(peripheral?.name)){
          console.log(peripheral?.name);
        if(peripheral?.advertising?.isConnectable &&
           peripheral?.name?.includes(this.RIGHT_SICT) && 
           this.dataSet.state  === "Right"){

          !this._registeredDevices.has(id) ?
          this._registeredDevices.set(id,peripheral) 
          :null

          let found = this.registeredDevices.find((elem) => elem == peripheral.id);
          console.log("pairing Mode : ",found);

          //if the device is already registered 
          if(!found){
            this._connectAndRetrieve(id) ? this.registeredDevices.push(peripheral):null 
          }
          console.log(peripheral);
        }else if(peripheral?.advertising?.isConnectable 
          && peripheral?.name?.includes(this.LEFT_SICT) &&   this.dataSet?.state === "Left"){

          !this._registeredDevices.has(id) ?
          this._registeredDevices.set(id,peripheral) 
          :null

          let found = this.registeredDevices.find((elem) => elem == peripheral.id);

          console.log("pairing Mode : ",found);

          if(!found){
            this._connectAndRetrieve(id) ? this.registeredDevices.push(peripheral):null 
          }
            console.log(peripheral);
          }
      }else{
        console.log("Not matched");
      }
      
      }catch(error){
          console.log(error.message);
      }
    }
  
   
  
    async _hdlConnect(args) {
      this._isConnecting = false;
      this._connected = true;
      this.dataSet.setMessage("Connected Successfully")
      this.dataSet.setIsConnected(false)
      console.log("Connected to peripheral:", args);
    }
  
      getNearbyDevices=async(data)=>{
      this.dataSet=null
      this.dataSet=data
      const {devSet,state}= data
      console.log("DEV SET : ",data);
     if( state === "Right") 
      {
        this.LEFT_SICT=`SICE_L`
        this.RIGHT_SICT=`SICE_R`
        this.RIGHT_SICT=this.RIGHT_SICT+devSet
      }
      else{
        this.LEFT_SICT=`SICE_L`
        this.RIGHT_SICT=`SICE_R`
         this.LEFT_SICT= this.LEFT_SICT+devSet
      }
      if (!this._initialized) return;
      try {
        await BleManager.scan([],5, false);
      } catch (err) {
        console.log("Scanning failed:", err);
      }
    }
  

     _connectAndRetrieve=async(id) =>{
        
      try {
        await BleManager.connect(id);
      } catch (err) {
        console.log("Connect to", id, "failed:", err);
        return false;
      }
  
      try {
       this.setUpBleNotification(id)
      } catch (err) {
        console.log("Retrieving services failed:", err);
        return false;
      }
      return true;
    }
     _disconnectDev=async(id)=> {
      try {
        await BleManager.disconnect(id);
        await BleManager.removeBond(id)
        await BleManager.removePeripheral(id)
      } catch (err) {
        console.log("Disconnecting", id, "failed:", err);
      }
    }
  
  


   setUpBleNotification = (id) => {
    try {
     BleManager.retrieveServices(id).then(async(peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);
              await BleManager.stopScan()
              setTimeout(() => {
                BleManager.startNotification(id, SERVICE_UUID, READ_CHAR_UUID).then(() => {
                  console.log('Started notification on ' + id);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 500)
          });
        } catch (error) {
          console.log(error.message);
        }        
  }


   
   
    async removeAllListeners() {
      console.log("Removing all Listener's");
     BleManagerEmitter.removeAllListeners("BleManagerStopScan")
     BleManagerEmitter.removeAllListeners("BleManagerDiscoverPeripheral")
     BleManagerEmitter.removeAllListeners("BleManagerConnectPeripheral")
     BleManagerEmitter.removeAllListeners("BleManagerDisconnectPeripheral")
     BleManagerEmitter.removeAllListeners("BleManagerConnectPeripheral")
     BleManagerEmitter.removeAllListeners("BleManagerDidUpdateValueForCharacteristic")
     BleManagerEmitter.removeAllListeners("BleManagerDidUpdateState")
    }
  
   
  })();
  
  export default PillSync;
  























// import {
//     NativeModules,
//     NativeEventEmitter,
//     PermissionsAndroid,
//     Platform,
// } from "react-native";
// import BleManager from "react-native-ble-manager";
// const BleManagerModule = NativeModules.BleManager;
// const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// class SmskBle {


//     cconstructor() {
//         console.log("PillSync class instantiated");
//         this._initialized = false;
//         this._connected = false;
//         this._isConnecting = false;
//         this._registeredDevices = [];
//         this._discoverCallbacks = [null, null];
//         this.peripheralId = false;
//         this._subscriptions = [
//             BleManagerEmitter.addListener(
//                 "BleManagerStopScan",
//                 this._hdlStopScan.bind(this)
//             ),
//             BleManagerEmitter.addListener(
//                 "BleManagerDiscoverPeripheral",
//                 (data) => {
//                     console.log(data);
//                 }
//             ),
//             BleManagerEmitter.addListener(
//                 "BleManagerConnectPeripheral",
//                 this._hdlConnect.bind(this)
//             ),
//             BleManagerEmitter.addListener(
//                 "BleManagerDisconnectPeripheral",
//                 this._hdlDisconnect.bind(this)
//             ),
//             BleManagerEmitter.addListener("BleManagerDidUpdateState", (args) => {
//                 console.log("Current Bluetooth Service State : ", args);
//             }),
//             BleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic",
//                 ({ value, peripheral, characteristic, service }) => {
//                     // Convert bytes array to string
//                     const data = bytesToString(value);
//                     console.log(`Received ${data} for characteristic ${characteristic}`);
//                 })
//         ];
//     }

//     async init() {

//         if (Platform.OS === "android") {
//             try {
//                 await BleManager.enableBluetooth();
//             } catch (err) {
//                 console.log("User refuses to enable bluetooth:", err);
//             }
//         }

//         try {
//             await BleManager.start({ showAlert: false });
           
//         } catch (err) {
//             console.log("Unable to initialize bluetooth:", err);
//         }
//         this._initialized = true;
//     }


//     _hdlStopScan() {
//         console.log("Scan stoped");
//     }

//     _hdlDisconnect(id) {
//         this.peripheralId = false;
//         this._connected = false;
//         console.log(id, "disconnected");
//     }

//     _hdlDiscover(peripheral) {
//         console.log(peripheral);
//     }
//     async getNearbyDevices(

//     ) {
//         console.log("enter", this._initialized);
//         if (!this._initialized) return;
//         console.log("enter", this._initialized);


//         try {
//             await BleManager.scan([], 0, false);
//         } catch (err) {
//             console.log("Scanning failed:", err);
//         }
//     }
//     async _connectAndRetrieve(id) {
//         try {
//             await BleManager.createBond(id);
//         } catch (err) {
//             console.log("Create Bond with", id, "failed:", err);
//             return false;
//         }

//         try {
//             await BleManager.connect(id);
//         } catch (err) {
//             console.log("Connect to", id, "failed:", err);
//             return false;
//         }

//         try {
//             await BleManager.retrieveServices(id, []);
//         } catch (err) {
//             console.log("Retrieving services failed:", err);
//             return false;
//         }
//         return true;
//     }


// }

// const SmskBluetooth = new SmskBle()

// export default SmskBluetooth