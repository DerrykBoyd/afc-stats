import ReactDOM from "react-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools
      initialIsOpen={false}
      position="top-left"
      panelPosition="top"
    />
    <App />
  </QueryClientProvider>,
  document.getElementById("root")
);
