import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from './contexts/AuthContext';
import {SocketProvider} from './contexts/SocketContext';
import Chat from './pages/Chat';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

const queryClient = new QueryClient();

function App() {
    return (
        <div className="min-h-screen bg-[#1A1D21]">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <SocketProvider>
                        <Router>
                            <Routes>
                                <Route path="/" element={<Chat/>}/>
                                <Route path="/signin" element={<SignIn/>}/>
                                <Route path="/signup" element={<SignUp/>}/>
                                <Route path="*" element={<Navigate to="/" replace/>}/>
                            </Routes>
                        </Router>
                    </SocketProvider>
                </AuthProvider>
            </QueryClientProvider>
        </div>
    );
}

export default App;
