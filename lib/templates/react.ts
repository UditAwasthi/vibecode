export const reactTemplate = [
  {
    name: "index.html",
    path: "/index.html",
    content: `<div id="root"></div>`,
  },
  {
    name: "main.tsx",
    path: "/src/main.tsx",
    content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
);`,
  },
  {
    name: "App.tsx",
    path: "/src/App.tsx",
    content: `export default function App() {
  return <h1>Hello Vibecode </h1>;
}`,
  },
];