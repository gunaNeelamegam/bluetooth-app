import { View, Text } from 'react-native'
import React,{useEffect} from 'react'

import RNAndroidLocationEnabler from "react-native-android-location-enabler";

const useLocationEnabler = () => {
    const locationEnabler = async () => {
        try {
            let res = await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000,
            });
            console.log("bluetooth: ", res);
        } catch (err) {
            if (err.message == "denied") {
                Alert.alert(
                    "App can't add/connect with device.",
                    "Location service needs to be enabled to access Bluetooth interface.",
                    [
                        {
                            text: "Enable Location",
                            onPress: () => locationEnabler(),
                        },
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel",
                        },
                        {
                            text: "View report",
                            onPress: () => {
                                send("REPORT");
                            },
                        },
                    ]
                );
            } else console.log("error: ", err);
        }
    };

    useEffect(() => {
        (async () => {
            await locationEnabler()
        })()
    }, [])

    return

}

export default useLocationEnabler