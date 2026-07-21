import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/user.store';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { Users, Search, ChevronLeft, ChevronRight, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatDate } from '../../utils/formatters';

export default function UsersAdminPage() {
  const { users, isLoading, error, fetchUsers, toggleUserStatus } = useUserStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;
  
  const offset = (page - 1) * limit;

  useEffect(() => {
    fetchUsers(limit, offset, search);
  }, [page, fetchUsers, offset, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(limit, 0, search);
  };

  const hasNextPage = users.length === limit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los roles, estado y accesos de los clientes y personal.
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuario, email..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/50 cursor-pointer">
                      <TableCell>
                        <div className="font-semibold flex items-center gap-2">
                          {user.isStaff ? <Shield className="size-4 text-primary" /> : <UserIcon className="size-4 text-muted-foreground" />}
                          {user.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          user.isStaff ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted border border-border text-foreground'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.dateJoined)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.isActive ? 'outline' : 'destructive'}
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          className="text-xs h-7"
                        >
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!isLoading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="size-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
