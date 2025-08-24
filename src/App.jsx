import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Components/Login'
import Navbar from './Components/Navbar'
import Manager from './Components/Manager'
import Footer from './Components/Footer'
import TandC from './Components/TandC';
import Campus from './Components/Campus';
import Profile from './Components/Profile';
import BusService from './Components/BusService';
import Admin from './Components/Admin';
import BookPage from './Components/BookPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AddRoomTypeForm from "./components/AddRoomTypeForm";
import Chatbot from './Components/chatbot';
import ForgotPassword from './Components/ForgotPassword';

// const GOOGLE_MAPS_API_KEY = "AIzaSyB6Z9F2vwV9ioiANgiu6MpF5EFLkWhNZbQ";

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarFooter = ["/login", "/admin", "/forgot-password", "/admin/addroomtype"].includes(location.pathname); // Check if we are on the login page

    return (
        <>
            {/* <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}> */}
            {!hideNavbarFooter && <Navbar />}

            <Routes>
                <Route path="/" element={<Manager />} />
                <Route path="/home" element={<Manager />} />
                <Route path="/campus-guide" element={<Campus />} />
                <Route path="/bus-service" element={<BusService/>} />

                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/addroomtype" element={<AddRoomTypeForm/>} />
                <Route
                    path="/bookpage/:id"
                    element={
                        <ProtectedRoute>
                            <BookPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="tnc" element={<TandC/>} />
                <Route path="faq-ai" element={<Chatbot/>} />
            </Routes>

            {!hideNavbarFooter && <Footer />}
            {!hideNavbarFooter && <Chatbot />}
            {/* </LoadScript> */}
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                    <AppLayout />
            </AuthProvider>
        </Router>
    );
};

export default App;