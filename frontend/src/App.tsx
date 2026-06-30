import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <Route></Route>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
