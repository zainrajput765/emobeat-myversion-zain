import { createRoot } from "react-dom/client";
import App from "./app/App"; // Remove .tsx extension
import "./styles/index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
