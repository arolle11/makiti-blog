import axios from "axios";
import type { Post } from "../types/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://dummyjson.com";
const POSTS_API = import.meta.env.VITE_POSTS_API || "/posts";
const API_URL = `${API_BASE_URL}${POSTS_API}`;

export const fetchPosts = async (
  page: number = 1,
  limit: number = 6,
  search: string = ""
): Promise<{ posts: Post[]; total: number }> => {
  try {
    const skip = (page - 1) * limit;
    let url = `${API_URL}?limit=${limit}&skip=${skip}`;

    if (search) {
      url = `${API_URL}/search?q=${encodeURIComponent(
        search
      )}&limit=${limit}&skip=${skip}`;
    }

    const response = await axios.get(url);

    return {
      posts: response.data.posts,
      total: response.data.total,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const fetchPostById = async (id: number): Promise<Post> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw error;
  }
};
export const fetchAllPosts = async (): Promise<{
  posts: Post[];
  total: number;
}> => {
  try {
    const response = await axios.get(`${API_URL}?limit=0`);
    return {
      posts: response.data.posts,
      total: response.data.total,
    };
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
};
