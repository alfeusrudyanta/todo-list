import {
  PostTodosRequest,
  PostTodosResponse,
  GetTodosRequest,
  GetTodosResponse,
  DeleteTodosResponse,
  PutTodosRequest,
  PutTodosResponse,
  getTodosScrollRequest,
  getTodosScrollResponse,
} from '@/types/Schedule';

import AxiosInstance from './axios';

const api = {
  postTodos: async (data: PostTodosRequest): Promise<PostTodosResponse> => {
    const res = await AxiosInstance.post('/todos', data);
    return res.data;
  },

  getTodos: async (data: GetTodosRequest): Promise<GetTodosResponse> => {
    const res = await AxiosInstance.get('/todos', {
      params: data,
    });
    return res.data;
  },

  deleteTodos: async (id: string): Promise<DeleteTodosResponse> => {
    const res = await AxiosInstance.delete(`/todos/${id}`);
    return res.data;
  },

  putTodos: async (
    id: string,
    data: PutTodosRequest
  ): Promise<PutTodosResponse> => {
    const res = await AxiosInstance.put(`/todos/${id}`, data);
    return res.data;
  },

  getTodosScroll: async (
    data?: getTodosScrollRequest
  ): Promise<getTodosScrollResponse> => {
    const res = await AxiosInstance.get('/todos/scroll', { params: data });
    return res.data;
  },
};

export default api;
