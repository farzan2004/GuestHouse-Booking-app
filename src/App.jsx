import React, { Suspense, lazy } from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
const Login = lazy(() => import('./Components/Login'));
import Navbar from './Components/Navbar'
const Manager = lazy(() => import('./Components/Manager'));
import Footer from './Components/Footer'
import TandC from './Components/TandC';
const Campus = lazy(() => import('./Components/Campus'));
const Profile = lazy(() => import('./Components/Profile'));
import BusService from './Components/BusService';
const BookPage = lazy(() => import('./Components/BookPage'));
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
const Chatbot = lazy(() => import('./Components/chatbot'));
const ForgotPassword = lazy(() => import('./Components/ForgotPassword'));
import ManagerSkeleton from './Skeletons/managerSkeleton';
import CampusSkeleton from "./Skeletons/campusmapSkeleton";
import ProfileSkeleton from "./Skeletons/profileSkeleton";
import BookPageSkeleton from './Skeletons/bookpageSkeleton';
const Admin = lazy(() => import('./Components/Admin'));
const AddRoomTypeForm = lazy(() => import('./Components/AddRoomTypeForm'));


// const GOOGLE_MAPS_API_KEY = "AIzaSyB6Z9F2vwV9ioiANgiu6MpF5EFLkWhNZbQ";

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarFooter = ["/login", "/admin", "/forgot-password", "/admin/addroomtype"].includes(location.pathname); // Check if we are on the login page

    return (
        <>
            {/* <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}> */}
            {!hideNavbarFooter && <Navbar />}
            <Routes>
                <Route path="/" element={
                    <Suspense fallback={<ManagerSkeleton />}>
                        <Manager />
                    </Suspense>
                } />
                <Route path="/home" element={
                    <Suspense fallback={<ManagerSkeleton />}>
                        <Manager />
                    </Suspense>
                } />
                <Route path="/campus-guide" element={
                    <Suspense fallback={<CampusSkeleton />}>
                        <Campus />
                    </Suspense>
                } />
                <Route path="/bus-service" element={<BusService />} />

                <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}>
                    <Login />
                </Suspense>} />
                <Route path="/forgot-password" element={<Suspense fallback={<div>Loading...</div>}>
                    <ForgotPassword />
                </Suspense>} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<ProfileSkeleton />}>
                                <Profile />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/addroomtype" element={<AddRoomTypeForm />} />
                <Route
                    path="/bookpage/:id"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<BookPageSkeleton />}>
                                <BookPage />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route path="tnc" element={<TandC />} />
                <Route path="faq-ai" element={<Chatbot />} />
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