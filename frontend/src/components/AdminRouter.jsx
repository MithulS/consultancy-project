import React, { Suspense, lazy } from 'react';
import NotFound from './NotFound';
import LoadingOverlay from './LoadingOverlay';
import AdminLayout from './AdminLayout';

// Admin Lazy Components
const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminForgotPassword = lazy(() => import('./AdminForgotPassword'));
const AdminResetPassword = lazy(() => import('./AdminResetPassword'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const AdminOrderTracking = lazy(() => import('./AdminOrderTracking'));
const SalesAnalytics = lazy(() => import('./SalesAnalytics'));

export default function AdminRouter({ currentPage }) {
    const renderAdminContent = () => {
        const wrapWithLayout = (Component) => (
            <AdminLayout currentPage={currentPage}>
                <Component />
            </AdminLayout>
        );

        switch (currentPage) {
            case 'admin':
            case 'secret-admin-login':
                return <AdminLogin />;
            case 'admin-forgot-password':
                return <AdminForgotPassword />;
            case 'admin-reset-password':
                return <AdminResetPassword />;
            case 'admin-dashboard':
                return wrapWithLayout(AdminDashboard);
            case 'admin-settings':
                return wrapWithLayout(AdminSettings);
            case 'admin-order-tracking':
                return wrapWithLayout(AdminOrderTracking);
            case 'sales-analytics':
                return wrapWithLayout(SalesAnalytics);
            default:
                return <NotFound />;
        }
    };

    return (
        <Suspense fallback={<LoadingOverlay show={true} message="Loading Admin Panel..." />}>
            {renderAdminContent()}
        </Suspense>
    );
}
