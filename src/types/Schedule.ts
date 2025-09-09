type Priority = undefined | 'HIGH' | 'MEDIUM' | 'LOW';

type TodoBase = {
  title: string;
  completed: boolean;
  date: string;
  priority: Priority;
};

/* Post Todos */
type PostTodosRequest = TodoBase;
type PostTodosResponse = TodoBase & { id: string };

/* Card */
type ScheduleCard = PostTodosResponse;

/* Get Todos */
type Sort = 'id' | 'title' | 'completed' | 'date' | 'priority';
type Order = 'asc' | 'desc';

type GetTodosRequest = {
  completed?: boolean;
  priority?: Priority;
  dateGte?: string;
  dateLte?: string;
  page?: number;
  limit?: number;
  sort?: Sort;
  order?: Order;
};

type GetTodosResponse = {
  todos: PostTodosResponse[];
  totalTodos: number;
  hasNextPage: boolean;
  nextPage: number | null;
};

/* Delete Todos */
type DeleteTodosResponse = PostTodosResponse;

/* Put Todos */
type PutTodosRequest = TodoBase;
type PutTodosResponse = PostTodosResponse;

/* Get Todos Scroll */
type getTodosScrollRequest = {
  completed?: boolean;
  nextCursor?: number;
  limit?: number;
  sort?: Extract<Sort, 'title' | 'date'>;
  order?: Order;
};

type getTodosScrollResponse = {
  todos: PostTodosResponse[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

export type {
  Priority,
  PostTodosRequest,
  PostTodosResponse,
  ScheduleCard,
  GetTodosRequest,
  GetTodosResponse,
  DeleteTodosResponse,
  PutTodosRequest,
  PutTodosResponse,
  getTodosScrollRequest,
  getTodosScrollResponse,
};
