import { View, Text, Platform, PermissionsAndroid } from 'react-native'
import React, { useEffect } from 'react'
import { PERMISSIONS, RESULTS, request, check } from "react-native-permissions"
const usePermission = () => {



    useEffect(() => {
        (async () => {
            const locationAndroidResponse = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
            const locationAndroidConnectResponse = await check(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT)
            const locationAndroidScanResponse = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN)

            const locationIosResponse = await check(PERMISSIONS.IOS.ACCESS_FINE_LOCATION)
            const locationIosLocationAlwaysResponse = await check(PERMISSIONS.IOS.LOCATION_ALWAYS)
            const locationIoslocationWhneInUseResponse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
            const locationIosBleResponse = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL)

            if ((Platform.OS === "ios" && !locationIosResponse
                && locationIosBleResponse &&
                locationIoslocationWhneInUseResponse &&
                locationIosLocationAlwaysResponse)) {
                const repsonseLocation = await request(PERMISSIONS.IOS.ACCESS_FINE_LOCATION)
                const repsonseLocationAlwaysLocation = await request(PERMISSIONS.IOS.LOCATION_ALWAYS)
                const reponseLocationWhenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                const repsonseBlePeripheral = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL)
                console.log(`
                IOS PERMISSIONS  :
                ${repsonseLocationAlwaysLocation}
                ${repsonseLocation}
                ${reponseLocationWhenInUse}
                ${repsonseBlePeripheral}
                `);
            } else if ((Platform.OS === "android" && Platform.Version >= 31
                && locationAndroidResponse
                && locationAndroidScanResponse
                && locationAndroidConnectResponse)) {
                const locationAndroidResponse = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                const responseAndroidScanResponse = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN)
                const responseAndroidConnectResponse = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT)

                console.log(`
                ANDROID PERMISSIONS  :
                ${locationAndroidResponse}
                ${responseAndroidConnectResponse}
                ${responseAndroidScanResponse}
                `);
            }
        })()
    }, [])


    return
}

export default usePermission
