import { ReactLocation, Router } from "@tanstack/react-location"
import { useState } from "react"

import { getRoutes, reactLocationOptions } from "~features/router"
import { trpc } from "~trpc"

const App = () => {
  // Configure router
  const [location] = useState(() => new ReactLocation(reactLocationOptions))

  // Provide trpc context to router
  const utils = trpc.useContext()
  return <Router location={location} routes={getRoutes({ utils })} />
}

export default App
