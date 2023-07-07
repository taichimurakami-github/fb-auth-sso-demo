import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppContainer from "./AppContainer.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
);
