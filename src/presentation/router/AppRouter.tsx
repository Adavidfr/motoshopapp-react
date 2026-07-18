// src/presentation/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/Layout';
import PlaceholderPage from '../pages/PlaceholderPage';

// Páginas reales de la Fase 1
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CatalogPage from '../pages/catalog/CatalogPage';
import ProductDetailPage from '../pages/catalog/ProductDetailPage';
import CartPage from '../pages/cart/CartPage';
import ProfilePage from '../pages/profile/ProfilePage';
import OrdersPage from '../pages/orders/OrdersPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';

// Páginas administrativas
import BrandsAdminPage from '../pages/admin/BrandsAdminPage';
import CategoriesAdminPage from '../pages/admin/CategoriesAdminPage';
import MotosAdminPage from '../pages/admin/MotosAdminPage';
import ProveedoresAdminPage from '../pages/admin/ProveedoresAdminPage';
import ServiciosAdminPage from '../pages/admin/ServiciosAdminPage';
import MantenimientosAdminPage from '../pages/admin/MantenimientosAdminPage';
import RepuestosMantenimientoAdminPage from '../pages/admin/RepuestosMantenimientoAdminPage';
import ComprasAdminPage from '../pages/admin/ComprasAdminPage';
import VentasAdminPage from '../pages/admin/VentasAdminPage';
import FinanciamientosAdminPage from '../pages/admin/FinanciamientosAdminPage';

// Repuestos e inventario
import RepuestosPage from '../pages/repuestos/RepuestosPage';
import InventoryPage from '../pages/inventario/InventoryPage';

// Componente para proteger rutas privadas
interface PrivateRouteProps {
  element: React.ReactElement;
}

function PrivateRoute({ element }: PrivateRouteProps) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function AdminRoute({ element }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.isStaff ? element : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas Públicas de Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Catálogo Público */}
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Repuestos Público */}
          <Route path="/repuestos" element={<RepuestosPage />} />

          {/* Rutas Privadas del Cliente (Requieren Autenticación) */}
          <Route path="/cart" element={<PrivateRoute element={<CartPage />} />} />
          <Route path="/orders" element={<PrivateRoute element={<OrdersPage />} />} />
          <Route path="/orders/:id" element={<PrivateRoute element={<OrderDetailPage />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />

          {/* Rutas administrativas */}
          <Route path="/admin" element={<AdminRoute element={<MotosAdminPage />} />} />
          <Route path="/admin/brands" element={<AdminRoute element={<BrandsAdminPage />} />} />
          <Route path="/admin/categories" element={<AdminRoute element={<CategoriesAdminPage />} />} />
          <Route path="/admin/motos" element={<AdminRoute element={<MotosAdminPage />} />} />
          <Route path="/admin/inventory" element={<AdminRoute element={<InventoryPage />} />} />
          <Route path="/admin/proveedores" element={<AdminRoute element={<ProveedoresAdminPage />} />} />
          <Route path="/admin/servicios" element={<AdminRoute element={<ServiciosAdminPage />} />} />
          <Route path="/admin/compras" element={<AdminRoute element={<ComprasAdminPage />} />} />
          <Route path="/admin/mantenimientos" element={<AdminRoute element={<MantenimientosAdminPage />} />} />
          <Route path="/admin/repuestos-mantenimiento" element={<AdminRoute element={<RepuestosMantenimientoAdminPage />} />} />
          <Route path="/admin/ventas" element={<AdminRoute element={<VentasAdminPage />} />} />
          <Route path="/admin/financiamientos" element={<AdminRoute element={<FinanciamientosAdminPage />} />} />

          {/* Admin — Placeholders para otros módulos */}
          <Route path="/admin/orders" element={<PrivateRoute element={<PlaceholderPage title="Admin Órdenes — Módulo 12" />} />} />
          <Route path="/admin/users" element={<PrivateRoute element={<PlaceholderPage title="Admin Usuarios — Módulo 13" />} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
