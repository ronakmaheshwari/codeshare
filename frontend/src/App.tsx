import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignupPage from './pages/signup';
import { Toaster } from 'sonner';
import LoginPage from './pages/login';
import CodeEditor from './pages/codeEditor';
import ProtectedRoute from './components/custom/ProtectedRoute';
import { AuthProvider } from './provider/authContext'; 
import Dashboard from './pages/dashboard';

export const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path='/' element={ <Navigate to={"/signup"} replace /> } />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/home' element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path='/code/:link' element={
                <CodeEditor />
            } />
            <Route path="*" element={""} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;