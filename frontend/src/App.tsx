import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignupPage from './pages/signup';

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path='/signup' element={<SignupPage />} />
          <Route path="*" element={""} />
        </Routes>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
