import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from 'services/users/usersService';

export const USERS_QUERY_KEY = ['users'];

export const useUsers = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: usersService.getUsers,
  });
};

export const useUserById = (id: string | null) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => usersService.getUserById(id as string),
    enabled: Boolean(id),
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
