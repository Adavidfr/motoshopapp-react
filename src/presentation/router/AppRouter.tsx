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

// Páginas de Administración
import BrandsAdminPage from '../pages/admin/BrandsAdminPage';
import CategoriesAdminPage from '../pages/admin/CategoriesAdminPage';
import MotosAdminPage from '../pages/admin/MotosAdminPage';
import ProveedoresAdminPage from '../pages/admin/ProveedoresAdminPage';

// Páginas de Repuestos e Inventario
import RepuestosPage from '../pages/repuestos/RepuestosPage';
import InventoryPage from '../pages/inventario/InventoryPage';
import ComprasAdminPage from '../pages/admin/ComprasAdminPage';

interface PrivateRouteProps {
  element: React.ReactElement;
}

function PrivateRoute({ element }: PrivateRouteProps) {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated
    ? element
    : <Navigate to="/login" replace />;
}

function AdminRoute({ element }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isStaff) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route
            path="/products/:id"
            element={<ProductDetailPage />}
          />

          {/* Rutas privadas del cliente */}
          <Route
            path="/cart"
            element={<PrivateRoute element={<CartPage />} />}
          />

          <Route
            path="/orders"
            element={<PrivateRoute element={<OrdersPage />} />}
          />

          <Route
            path="/orders/:id"
            element={
              <PrivateRoute element={<OrderDetailPage />} />
            }
          />

          <Route
            path="/profile"
            element={<PrivateRoute element={<ProfilePage />} />}
          />

          {/* Rutas administrativas */}
          <Route
            path="/admin"
            element={<AdminRoute element={<MotosAdminPage />} />}
          />

          <Route
            path="/admin/brands"
            element={
              <AdminRoute element={<BrandsAdminPage />} />
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminRoute element={<CategoriesAdminPage />} />
            }
          />

          <Route
            path="/admin/motos"
            element={<AdminRoute element={<MotosAdminPage />} />}
          />

          <Route
            path="/admin/inventory"
            element={<AdminRoute element={<InventoryPage />} />}
          />

          <Route
            path="/admin/proveedores"
            element={
              <AdminRoute
                element={<ProveedoresAdminPage />}
              />
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute
                element={
                  <PlaceholderPage title="Admin Órdenes — Módulo 12" />
                }
              />
            }
          />
          <Route
            path="/admin/compras"
            element={
              <AdminRoute
                element={<ComprasAdminPage />}
              />
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute
                element={
                  <PlaceholderPage title="Admin Usuarios — Módulo 13" />
                }
              />
            }
          />

          {/* Repuestos público */}
          <Route
            path="/repuestos"
            element={<RepuestosPage />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}