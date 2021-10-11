import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { WalletContextProvider } from "./context/WalletContext";

import "./styles/index.scss";

ReactDOM.render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
