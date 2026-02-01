import { createRoot } from "react-dom/client";
import { InfoTooltip } from '@/components/ui/info-tooltip';

<div>
  <span>Some field</span>
  <InfoTooltip content="This explains what the field means" />
</div>
import App from "./App.tsx";
import "./index.css";

// Set dark theme by default
document.documentElement.classList.add('light');

createRoot(document.getElementById("root")!).render(<App />);
