import { TagadaProvider } from "@tagadapay/plugin-sdk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TagadaProvider localConfig="default" environment="production">
        <App />
      </TagadaProvider>
    </BrowserRouter>
  </StrictMode>
);
