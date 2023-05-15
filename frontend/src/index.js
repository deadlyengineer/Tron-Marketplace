import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";

import reportWebVitals from "./reportWebVitals";
import { PageContainer } from "./containers";
import App from "./App";
import { ContextProvider } from "./context";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WalletProvider>
      <ContextProvider>
        <Router>
          <PageContainer>
            <App />
          </PageContainer>
        </Router>
      </ContextProvider>
    </WalletProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
