import React from 'react'

const isAuthenticated = true


//STACKS

import AppStack from "./src/navigation/AppStack"
const RootApp = () => {
    return isAuthenticated ? (
        <AppStack />
      ) : (
        <AuthStack />
      )
}

export default RootApp