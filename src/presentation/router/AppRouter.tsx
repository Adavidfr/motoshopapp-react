import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '../store/auth.store';

import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';

// Páginas públicas y privadas
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CatalogPage from '../pages/catalog/CatalogPage';
import MotosPage from '../pages/catalog/MotosPage';
import ProductDetailPage from '../pages/catalog/ProductDetailPage';
import CartPage from '../pages/cart/CartPage';
import ProfilePage from '../pages/profile/ProfilePage';
import OrdersPage from '../pages/orders/OrdersPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';

// Dashboard admin
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// Páginas administrativas — catálogo
import BrandsAdminPage from '../pages/admin/BrandsAdminPage';
import CategoriesAdminPage from '../pages/admin/CategoriesAdminPage';
import MotosAdminPage from '../pages/admin/MotosAdminPage';

// Páginas administrativas — ventas
import VentasAdminPage from '../pages/admin/VentasAdminPage';
import FacturasAdminPage from '../pages/admin/FacturasAdminPage';
import PagosAdminPage from '../pages/admin/PagosAdminPage';
import DocumentosVentaAdminPage from '../pages/admin/DocumentosVentaAdminPage';
import FinanciamientosAdminPage from '../pages/admin/FinanciamientosAdminPage';
import DevolucionesAdminPage from '../pages/admin/DevolucionesAdminPage';

// Páginas administrativas — servicio técnico
import ServiciosAdminPage from '../pages/admin/ServiciosAdminPage';
import MantenimientosAdminPage from '../pages/admin/MantenimientosAdminPage';
import RepuestosMantenimientoAdminPage from '../pages/admin/RepuestosMantenimientoAdminPage';
import GarantiasAdminPage from '../pages/admin/GarantiasAdminPage';
import SegurosAdminPage from '../pages/admin/SegurosAdminPage';

// Páginas administrativas — compras
import ProveedoresAdminPage from '../pages/admin/ProveedoresAdminPage';
import ComprasAdminPage from '../pages/admin/ComprasAdminPage';

// Páginas administrativas — reportes / sistema
import HistorialVentasAdminPage from '../pages/admin/HistorialVentasAdminPage';
import NotificacionesAdminPage from '../pages/admin/NotificacionesAdminPage';
import OrdersAdminPage from '../pages/admin/OrdersAdminPage';
import UsersAdminPage from '../pages/admin/UsersAdminPage';

// Repuestos e inventario
import RepuestosPage from '../pages/repuestos/RepuestosPage';
import InventoryPage from '../pages/inventario/InventoryPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────
interface RouteGuardProps {
  element: React.ReactElement;
}

function PrivateRoute({ element }: RouteGuardProps) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function AdminRoute({ element }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isStaff) return <Navigate to="/" replace />;
  return element;
}

// ─── Admin page wrapper (applies AdminLayout) ─────────────────────────────────
function AdminPage({ element }: RouteGuardProps) {
  return (
    <AdminRoute
      element={
        <AdminLayout>
          {element}
        </AdminLayout>
      }
    />
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (with main Layout) ── */}
        <Route
          path="/"
          element={
            <Layout>
              <CatalogPage />
            </Layout>
          }
        />
        <Route
          path="/catalog"
          element={
            <Layout>
              <MotosPage />
            </Layout>
          }
        />
        <Route
          path="/products/:id"
          element={
            <Layout>
              <ProductDetailPage />
            </Layout>
          }
        />
        <Route
          path="/repuestos"
          element={
            <Layout>
              <RepuestosPage />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />

        {/* ── Private client routes ── */}
        <Route
          path="/cart"
          element={
            <Layout>
              <PrivateRoute element={<CartPage />} />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <PrivateRoute element={<OrdersPage />} />
            </Layout>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Layout>
              <PrivateRoute element={<OrderDetailPage />} />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <PrivateRoute element={<ProfilePage />} />
            </Layout>
          }
        />

        {/* ── Admin routes (with AdminLayout, no main navbar) ── */}
        <Route path="/admin" element={<AdminPage element={<AdminDashboardPage />} />} />

        {/* Catálogo */}
        <Route path="/admin/motos" element={<AdminPage element={<MotosAdminPage />} />} />
        <Route path="/admin/brands" element={<AdminPage element={<BrandsAdminPage />} />} />
        <Route path="/admin/categories" element={<AdminPage element={<CategoriesAdminPage />} />} />
        <Route path="/admin/inventory" element={<AdminPage element={<InventoryPage />} />} />

        {/* Ventas */}
        <Route path="/admin/ventas" element={<AdminPage element={<VentasAdminPage />} />} />
        <Route path="/admin/facturas" element={<AdminPage element={<FacturasAdminPage />} />} />
        <Route path="/admin/pagos" element={<AdminPage element={<PagosAdminPage />} />} />
        <Route path="/admin/documentos-venta" element={<AdminPage element={<DocumentosVentaAdminPage />} />} />
        <Route path="/admin/financiamientos" element={<AdminPage element={<FinanciamientosAdminPage />} />} />
        <Route path="/admin/devoluciones" element={<AdminPage element={<DevolucionesAdminPage />} />} />

        {/* Servicio técnico */}
        <Route path="/admin/servicios" element={<AdminPage element={<ServiciosAdminPage />} />} />
        <Route path="/admin/mantenimientos" element={<AdminPage element={<MantenimientosAdminPage />} />} />
        <Route path="/admin/repuestos-mantenimiento" element={<AdminPage element={<RepuestosMantenimientoAdminPage />} />} />
        <Route path="/admin/garantias" element={<AdminPage element={<GarantiasAdminPage />} />} />
        <Route path="/admin/seguros" element={<AdminPage element={<SegurosAdminPage />} />} />

        {/* Compras */}
        <Route path="/admin/proveedores" element={<AdminPage element={<ProveedoresAdminPage />} />} />
        <Route path="/admin/compras" element={<AdminPage element={<ComprasAdminPage />} />} />

        {/* Reportes / sistema */}
        <Route path="/admin/historial-ventas" element={<AdminPage element={<HistorialVentasAdminPage />} />} />
        <Route path="/admin/notificaciones" element={<AdminPage element={<NotificacionesAdminPage />} />} />
        <Route path="/admin/orders" element={<AdminPage element={<OrdersAdminPage />} />} />
        <Route path="/admin/users" element={<AdminPage element={<UsersAdminPage />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
