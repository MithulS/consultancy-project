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
        let content;
        switch (currentPage) {
            case 'home':
                content = <CommercialHomePage key={authKey} />;
                break;
            case 'register':
                content = <RegisterModern />;
                break;
            case 'verify-otp':
                content = <VerifyOTPEnhanced />;
                break;
            case 'forgot-password':
                content = <ForgotPassword />;
                break;
            case 'reset-password':
                content = <ResetPassword />;
                break;
            case 'dashboard':
                content = <Dashboard />;
                break;
            case 'login':
                content = <LoginModern />;
                break;
            case 'contact':
                content = <ContactPage key={authKey} />;
                break;
            case 'products':
            case 'about':
            case 'catalog':
                content = <CommercialHomePage key={authKey} />;
                break;

            // Lazy loaded user routes
            case 'cart':
                content = <Cart />;
                break;
            case 'checkout':
                content = <Checkout />;
                break;
            case 'guest-checkout':
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                content = (
                    <GuestCheckout
                        cart={guestCart}
                        onComplete={() => {
                            localStorage.removeItem('guestCart');
                            window.location.hash = '#home';
                        }}
                        onCancel={() => window.location.hash = '#home'}
                    />
                );
                break;
            case 'my-orders':
            case 'orders':
                content = <MyOrders />;
                break;
            case 'profile':
                content = <Profile />;
                break;
            case 'wishlist':
                content = <Wishlist onNavigate={(page) => window.location.hash = `#${page}`} />;
                break;
            case 'track-order':
            case 'tracking':
                content = <PublicTracking />;
                break;
            default:
                content = <NotFound />;
                break;
        }

        return (
            <Suspense fallback={<LoadingOverlay show={true} message="Loading Page..." />}>
                <div
                    key={currentPage}
                    style={{ animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                    {content}
                </div>
            </Suspense>
        );
    };

    return renderUserContent();
}
