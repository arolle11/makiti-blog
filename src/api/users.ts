import axios from "axios";
import type { User } from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USERS_API = import.meta.env.VITE_USERS_API;
const API_URL = `${API_BASE_URL}${USERS_API}`;

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    let allUsers: User[] = [];
    let total = 0;
    let skip = 0;
    const limit = 30;
    do {
      const response = await axios.get(
        `${API_URL}?limit=${limit}&skip=${skip}`
      );
      allUsers = [...allUsers, ...response.data.users];
      total = response.data.total;
      skip += limit;
    } while (skip < total);

    return allUsers;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const fetchUsers = async (
  limit = 100,
  skip = 0
): Promise<{ users: User[]; total: number }> => {
  try {
    const response = await axios.get(`${API_URL}?limit=${limit}&skip=${skip}`);
    return {
      users: response.data.users,
      total: response.data.total,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchUserById = async (userId: number): Promise<User> => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};
export type { User };
