import React, { Suspense, lazy } from 'react';
import NotFound from './NotFound';
import LoadingOverlay from './LoadingOverlay';
import CommercialHomePage from './CommercialHomePage';
import RegisterModern from './RegisterModern';
import VerifyOTPEnhanced from './VerifyOTPEnhanced';
import LoginModern from './LoginModern';
import Dashboard from './Dashboard';
import ContactPage from './ContactPage';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

// User Lazy Components
const Cart = lazy(() => import('./Cart'));
const Checkout = lazy(() => import('./Checkout'));
const GuestCheckout = lazy(() => import('./GuestCheckout'));
const MyOrders = lazy(() => import('./MyOrders'));
const Profile = lazy(() => import('./Profile'));
const PublicTracking = lazy(() => import('./PublicTracking'));
const Wishlist = lazy(() => import('./Wishlist'));

export default function UserRouter({ currentPage, authKey }) {
    const renderUserContent = () => {
        switch (currentPage) {
            case 'home':
                return <CommercialHomePage key={authKey} />;
            case 'register':
                return <RegisterModern />;
            case 'verify-otp':
                return <VerifyOTPEnhanced />;
            case 'forgot-password':
                return <ForgotPassword />;
            case 'reset-password':
                return <ResetPassword />;
            case 'dashboard':
                return <Dashboard />;
            case 'login':
                return <LoginModern />;
            case 'contact':
                return <ContactPage key={authKey} />;
            case 'products':
            case 'about':
            case 'catalog':
                return <CommercialHomePage key={authKey} />;

            // Lazy loaded user routes
            case 'cart':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><Cart /></Suspense>;
            case 'checkout':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><Checkout /></Suspense>;
            case 'guest-checkout':
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                return (
                    <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}>
                        <GuestCheckout
                            cart={guestCart}
                            onComplete={() => {
                                localStorage.removeItem('guestCart');
                                window.location.hash = '#home';
                            }}
                            onCancel={() => window.location.hash = '#home'}
                        />
                    </Suspense>
                );
            case 'my-orders':
            case 'orders':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><MyOrders /></Suspense>;
            case 'profile':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><Profile /></Suspense>;
            case 'wishlist':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><Wishlist onNavigate={(page) => window.location.hash = `#${page}`} /></Suspense>;
            case 'track-order':
            case 'tracking':
                return <Suspense fallback={<LoadingOverlay show={true} message="Loading..." />}><PublicTracking /></Suspense>;
            default:
                return <NotFound />;
        }
    };

    return renderUserContent();
}
