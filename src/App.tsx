import CreateWallet from "./components/CreateWallet";
import Dashboard from "./components/Dashboard";
import { useWallet } from "./context/WalletContext";

function App() {
  const { createMode } = useWallet();
  return (
    <div className="App">
      <h1 className="white text-center">Basic Wallet</h1>
      {createMode ? <CreateWallet /> : <Dashboard />}
    </div>
  );
}

export default App;
