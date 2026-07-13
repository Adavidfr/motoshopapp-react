// src/presentation/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlaceholderPage from '../pages/PlaceholderPage'

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth — Módulo 3 */}
                <Route path="/login" element={<PlaceholderPage title="Login — Módulo 3" />} />
                <Route path="/register" element={<PlaceholderPage title="Register — Módulo 3" />} />

                {/* Catálogo (público) — Módulo 4 / 5 */}
                <Route path="/" element={<PlaceholderPage title="Catálogo — Módulo 4" />} />
                <Route path="/catalog" element={<PlaceholderPage title="Catálogo — Módulo 4" />} />
                <Route path="/products/:id" element={<PlaceholderPage title="Detalle de producto — Módulo 5" />} />

                {/* Requieren autenticación — Módulos 6, 7, 8 */}
                <Route path="/cart" element={<PlaceholderPage title="Carrito — Módulo 6" />} />
                <Route path="/orders" element={<PlaceholderPage title="Órdenes — Módulo 7" />} />
                <Route path="/orders/:id" element={<PlaceholderPage title="Detalle de orden — Módulo 7" />} />
                <Route path="/profile" element={<PlaceholderPage title="Perfil — Módulo 8" />} />

                {/* Admin — Módulos 9 a 13 */}
                <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard — Módulo 9" />} />
                <Route path="/admin/categories" element={<PlaceholderPage title="Admin Categorías — Módulo 10" />} />
                <Route path="/admin/products" element={<PlaceholderPage title="Admin Productos — Módulo 11" />} />
                <Route path="/admin/orders" element={<PlaceholderPage title="Admin Órdenes — Módulo 12" />} />
                <Route path="/admin/users" element={<PlaceholderPage title="Admin Usuarios — Módulo 13" />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}