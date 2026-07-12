import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignupPage from './pages/signup';
import { Toaster } from 'sonner';
import LoginPage from './pages/login';
import CodeEditor from './pages/codeEditor';

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router>
          <Routes>
            <Route path='/signup' element={ <SignupPage /> } />
            <Route path='/login' element={ <LoginPage /> } />
            <Route path='/code/:link' element={ <CodeEditor /> } />
            <Route path="*" element={""} />
          </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
