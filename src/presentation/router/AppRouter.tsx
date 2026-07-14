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

// Componente para proteger rutas privadas
interface PrivateRouteProps {
  element: React.ReactElement;
}

function PrivateRoute({ element }: PrivateRouteProps) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
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

          {/* Rutas Privadas del Cliente (Requieren Autenticación) */}
          <Route path="/cart" element={<PrivateRoute element={<CartPage />} />} />
          <Route path="/orders" element={<PrivateRoute element={<OrdersPage />} />} />
          <Route path="/orders/:id" element={<PrivateRoute element={<OrderDetailPage />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />

          {/* Admin — Placeholder por ahora (Módulos 9 a 13) */}
          <Route path="/admin" element={<PrivateRoute element={<PlaceholderPage title="Admin Dashboard — Módulo 9" />} />} />
          <Route path="/admin/categories" element={<PrivateRoute element={<PlaceholderPage title="Admin Categorías — Módulo 10" />} />} />
          <Route path="/admin/products" element={<PrivateRoute element={<PlaceholderPage title="Admin Productos — Módulo 11" />} />} />
          <Route path="/admin/orders" element={<PrivateRoute element={<PlaceholderPage title="Admin Órdenes — Módulo 12" />} />} />
          <Route path="/admin/users" element={<PrivateRoute element={<PlaceholderPage title="Admin Usuarios — Módulo 13" />} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}