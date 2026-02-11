import apiClient from './client';

export interface Role {
  _id: string;
  title: string;
  description: string;
  requiredSkills: {
    skill: string;
    minimumLevel: number;
    importance: 'essential' | 'preferred' | 'nice-to-have';
  }[];
  industry: string;
  seniorityLevel: string;
}

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/roles');
    return response.data;
  },

  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  async setTargetRole(roleId: string): Promise<void> {
    await apiClient.post('/users/me/target-role', { roleId });
  },

  async getUserTargetRole(): Promise<Role | null> {
    try {
      const response = await apiClient.get<Role>('/users/me/target-role');
      return response.data;
    } catch {
      return null;
    }
  },
};
