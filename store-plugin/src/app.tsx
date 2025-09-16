import Router from "@/router";
import { useTheme } from "./hooks/use-theme";
import { Contexts } from "./context";

export default function App() {
  return (
    <Contexts>
      <ThemeWrapper />
    </Contexts>
  )
}

const ThemeWrapper = () => {
  useTheme();
  return (Router)
}