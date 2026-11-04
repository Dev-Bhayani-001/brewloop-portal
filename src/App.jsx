import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from './layouts/AdminLayout'
import BusinessLayout from './layouts/BusinessLayout'
import { RequireAuth, RequireCapability, RequireRole } from './layouts/RouteGuards'
import AdminBusinessDetailPage from './pages/admin/AdminBusinessDetailPage'
import AdminBusinessesPage from './pages/admin/AdminBusinessesPage'
import AdminMembersPage from './pages/admin/AdminMembersPage'
import AdminPlansPage from './pages/admin/AdminPlansPage'
import AnalyticsPage from './pages/app/AnalyticsPage'
import BillsPage from './pages/app/BillsPage'
import BusinessSettingsPage from './pages/app/BusinessSettingsPage'
import CounterPage from './pages/app/CounterPage'
import CustomerDetailPage from './pages/app/CustomerDetailPage'
import CustomersPage from './pages/app/CustomersPage'
import MenuPage from './pages/app/MenuPage'
import NewBillPage from './pages/app/NewBillPage'
import OfferEditorPage from './pages/app/OfferEditorPage'
import OffersPage from './pages/app/OffersPage'
import LoginPage from './pages/auth/LoginPage'
import SetPasswordPage from './pages/auth/SetPasswordPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import TermsPage from './pages/legal/TermsPage'

import UserLayout from './layouts/UserLayout'
import UserLoyaltyPage from './pages/portal/UserLoyaltyPage'
import UserBillsPage from './pages/portal/UserBillsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route element={<RequireAuth />}>
          {/* Platform admin portal */}
          <Route path="/admin" element={<RequireRole roles={['platform_admin']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminBusinessesPage />} />
              <Route path="businesses/:businessId" element={<AdminBusinessDetailPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
            </Route>
          </Route>

          {/* Customer / User portal */}
          <Route path="/portal" element={<RequireRole roles={['customer']} />}>
            <Route element={<UserLayout />}>
              <Route index element={<Navigate to="/portal/loyalty" replace />} />
              <Route path="loyalty" element={<UserLoyaltyPage />} />
              <Route path="bills" element={<UserBillsPage />} />
            </Route>
          </Route>

          {/* Business app — managers & staff */}
          <Route element={<RequireRole roles={['manager', 'staff']} />}>
            <Route element={<BusinessLayout />}>
              <Route index element={<CounterPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:customerId" element={<CustomerDetailPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="bills/new" element={<NewBillPage />} />

              <Route element={<RequireCapability capability="menu" />}>
                <Route path="menu" element={<MenuPage />} />
              </Route>
              <Route element={<RequireCapability capability="offers" />}>
                <Route path="offers" element={<OffersPage />} />
                <Route path="offers/new" element={<OfferEditorPage />} />
                <Route path="offers/:offerId" element={<OfferEditorPage />} />
              </Route>
              <Route element={<RequireCapability capability="analytics" />}>
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
              <Route element={<RequireCapability capability="settings" />}>
                <Route path="settings" element={<BusinessSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
