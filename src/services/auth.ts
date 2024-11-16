import axios from 'axios';

const API_URL = 'https://mcnpmexico.org/wp-json/jwt-auth/v1/token';

interface LoginResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(API_URL, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validateToken: async (token: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};