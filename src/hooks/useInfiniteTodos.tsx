import { useInfiniteQuery } from '@tanstack/react-query';

import api from '@/services/api';

type ScheduleType = 'today' | 'upcoming' | 'completed';
type Priority = undefined | 'LOW' | 'MEDIUM' | 'HIGH';
type IsCompleted = undefined | true | false;
type DateList = { startDate: string; endDate: string; formattedDate: string };
type Sort = undefined | 'id' | 'title' | 'completed' | 'date' | 'priority';
type Order = 'asc' | 'desc';

function useInfiniteTodos({
  scheduleType,
  completed,
  priority,
  dates,
  sort,
  order,
}: {
  scheduleType: ScheduleType;
  completed: IsCompleted;
  priority: Priority;
  dates: DateList;
  sort: Sort;
  order: Order;
}) {
  return useInfiniteQuery({
    queryKey: [
      'todos',
      { scheduleType, completed, priority, dates, sort, order },
    ],
    queryFn: ({ pageParam = 1 }) =>
      api.getTodos({
        completed: scheduleType === 'completed' ? true : completed,
        priority: priority,
        dateGte: dates.startDate,
        dateLte: dates.endDate,
        page: pageParam,
        sort: sort,
        order: order,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    gcTime: 0,
  });
}

export default useInfiniteTodos;
