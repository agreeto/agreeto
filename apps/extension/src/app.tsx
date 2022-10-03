import { AuthButton } from "~features/auth"

export const App = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      padding: 16
    }}>
    <h1>
      Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
    </h1>
    <AuthButton />
  </div>
)

export default App
