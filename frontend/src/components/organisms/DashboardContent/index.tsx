import { FC, useCallback, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CellContext } from '@tanstack/react-table';
import { Card } from 'components/atoms/Card';
import { DashboardHeader } from 'components/organisms/DashboardHeader';
import { DashboardSidebar, DashboardMenuKey } from 'components/organisms/DashboardSidebar';
import { DashboardFooter } from 'components/organisms/DashboardFooter';
import { DataTable } from 'components/organisms/DataTable';
import { Button } from 'components/atoms/Button';
import { Input } from 'components/atoms/Input';
import { Dialog, DialogClose, DialogContent, DialogTitle } from 'components/atoms/Dialog';
import { X } from 'lucide-react';
import { useApproveUser, useDeleteUser, useUserById, useUsers } from 'hooks/useUsers';
import type { UserListItem } from 'types/dashboard';

interface DashboardContentProps {
  onLogout: () => void;
}

export const DashboardContent: FC<DashboardContentProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<DashboardMenuKey>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<UserListItem | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const { data: selectedUser, isLoading: isLoadingUser } = useUserById(selectedUserId);
  const { mutateAsync: approveUser, isPending: isApproving } = useApproveUser();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useDeleteUser();

  const pageTitle = activeMenu === 'users' ? 'Users List' : activeMenu[0].toUpperCase() + activeMenu.slice(1);
  const pageBreadcrumb = `Dashboard / ${pageTitle}`;

  const filteredUsers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );
  }, [users, searchQuery]);

  const handleApprove = useCallback(async (id: string) => {
    await approveUser(id);
  }, [approveUser]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteUser(id);

    if (selectedUserId === id) {
      setSelectedUserId(null);
      setIsDetailModalOpen(false);
    }
  }, [deleteUser, selectedUserId]);

  const openDeleteConfirmation = useCallback((user: UserListItem) => {
    if (user.role === 'super_admin') {
      return;
    }

    setDeleteErrorMessage(null);
    setDeleteCandidate(user);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteCandidate) {
      return;
    }

    try {
      await handleDelete(deleteCandidate.id);
      setDeleteCandidate(null);
      setDeleteErrorMessage(null);
    } catch (error) {
      setDeleteErrorMessage((error as Error)?.message || 'Gagal menghapus user');
    }
  }, [deleteCandidate, handleDelete]);

  const handleView = useCallback((id: string) => {
    setSelectedUserId(id);
    setIsDetailModalOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: ({ getValue }) => <div className="line-clamp-1">{getValue() as string}</div>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Telepon',
      },
      {
        accessorKey: 'approved',
        header: 'Status',
        cell: ({ getValue }: CellContext<UserListItem, unknown>) => {
          const approved = getValue() as boolean;

          return (
            <span className={approved ? 'text-green-600 font-medium' : 'text-gray-500 italic'}>
              {approved ? 'Approved' : 'Belum Approved'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="w-full text-right">Aksi</div>,
        cell: ({ row }: CellContext<UserListItem, unknown>) => {
          const user = row.original;

          return (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                className={
                  user.approved
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }
                disabled={isApproving || user.approved}
                onClick={() => handleApprove(user.id)}
              >
                Approve
              </Button>
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleView(user.id)}
              >
                View
              </Button>
              <Button
                type="button"
                className={
                  user.role === 'super_admin'
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }
                disabled={isDeleting || user.role === 'super_admin'}
                onClick={() => openDeleteConfirmation(user)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleView, isApproving, isDeleting, openDeleteConfirmation]
  );

  const renderMainContent = () => {
    if (activeMenu !== 'users') {
      return (
        <Card className="h-full rounded-2xl p-6">
          <p className="text-sm text-gray-600">Konten untuk menu {pageTitle}.</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <DataTable
          title="Daftar Users"
          data={filteredUsers}
          columns={columns}
          loading={isLoading}
          headerAction={(
            <Input
              placeholder="Cari nama atau email..."
              className="w-64"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          )}
        />

        <Dialog
          open={isDetailModalOpen}
          onOpenChange={(open) => {
            setIsDetailModalOpen(open);

            if (!open) {
              setSelectedUserId(null);
            }
          }}
        >
          <DialogContent>
            <DialogClose
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </DialogClose>
            <DialogTitle className="text-lg font-semibold text-gray-800">Detail User</DialogTitle>
            {isLoadingUser ? (
              <p className="mt-3 text-sm text-gray-600">Memuat detail user...</p>
            ) : (
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p>Nama: {selectedUser?.name ?? '-'}</p>
                <p>Gender: {selectedUser?.gender ?? '-'}</p>
                <p>Alamat: {selectedUser?.address ?? '-'}</p>
                <p>Email: {selectedUser?.email ?? '-'}</p>
                <p>No HP: {selectedUser?.phoneNumber ?? '-'}</p>
                <p>Status Approved: {selectedUser?.approved ? 'True' : 'False'}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(deleteCandidate)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteCandidate(null);
              setDeleteErrorMessage(null);
            }
          }}
        >
          <DialogContent>
            <DialogTitle className="text-lg font-semibold text-gray-800">Konfirmasi Hapus User</DialogTitle>
            <p className="mt-3 text-sm text-gray-700">
              Apakah kamu yakin ingin menghapus user <span className="font-semibold">{deleteCandidate?.name ?? '-'}</span>?
            </p>

            {deleteErrorMessage ? (
              <p className="mt-3 text-sm text-red-600">{deleteErrorMessage}</p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isDeleting}>
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex w-full max-w-7xl gap-6">
        <DashboardSidebar activeMenu={activeMenu} onSelectMenu={setActiveMenu} onLogout={onLogout} />

        <div className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col gap-6">
          <DashboardHeader title={pageTitle} breadcrumb={pageBreadcrumb} />

          <main className="flex-1">
            {renderMainContent()}
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
};
