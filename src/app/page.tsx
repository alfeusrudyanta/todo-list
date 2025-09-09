'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ListFilter,
  Search,
  CircleX,
  CircleCheck,
  Calendar,
} from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import ScheduleCard from '@/components/ScheduleCard';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import DialogCard from '@/components/ui/DialogCard';
import { SoonerCardError, SoonerCardSuccess } from '@/components/ui/SoonerCard';

import useInfiniteTodos from '@/hooks/useInfiniteTodos';
import useResponsiveToggle from '@/hooks/useResponsiveToggle';
import { getStorageTheme, setDarkMode } from '@/lib/theme';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { PostTodosResponse } from '@/types/Schedule';

type ScheduleType = 'today' | 'upcoming' | 'completed';
type Priority = undefined | 'LOW' | 'MEDIUM' | 'HIGH';
type IsCompleted = undefined | true | false;
type DateList = { startDate: string; endDate: string; formattedDate: string };
type Sort = undefined | 'id' | 'title' | 'completed' | 'date' | 'priority';
type Order = 'asc' | 'desc';

const Home = () => {
  const queryClient = useQueryClient();

  // Memorize
  const currentUTCDate: string = dayjs().startOf('day').toISOString();

  const initialDate = useMemo(() => {
    const startDate = dayjs().startOf('day').toISOString();
    const endDate = dayjs().endOf('day').toISOString();

    return {
      startDate,
      endDate,
      formattedDate: dayjs().format('MMM D, YYYY'),
    };
  }, []);

  // State
  const [search, setSearch] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('today');
  const [completed, setCompleted] = useState<IsCompleted>(undefined);
  const [priority, setPriority] = useState<Priority>(undefined);
  const [sort, setSort] = useState<Sort>(undefined);
  const [order, setOrder] = useState<Order>('asc');
  const [newSchedule, setNewSchedule] = useState<PostTodosResponse>({
    id: 'DUMMY_ID',
    title: '',
    completed: false,
    date: currentUTCDate,
    priority: 'LOW',
  });
  const [isAddNewSchedule, setIsAddNewSchedule] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dates, setDates] = useState<DateList>(() => initialDate);
  const [isCardLoadingId, setIsCardLoadingId] = useState<string>('');

  // TanStack Query for fetching todos
  const {
    data: scheduleData,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteTodos({
    scheduleType,
    completed,
    priority,
    dates,
    sort,
    order,
  });

  const schedule = useMemo(() => {
    return scheduleData?.pages.flatMap((page) => page.todos) || [];
  }, [scheduleData]);

  const totalItem = useMemo(() => {
    return scheduleData?.pages[0].totalTodos || 0;
  }, [scheduleData]);

  // TanStack Query mutations
  const addScheduleMutation = useMutation({
    mutationFn: (data: {
      title: string;
      completed: boolean;
      date: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
    }) => api.postTodos(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      SoonerCardSuccess('Task added');
      setNewSchedule({
        id: 'DUMMY_ID',
        title: '',
        completed: false,
        date: currentUTCDate,
        priority: 'LOW',
      });
      setIsAddNewSchedule(false);
    },
    onError: (error) => {
      console.error('Failed to add new task: ', error);
      SoonerCardError('Failed to create task. Please try again');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => api.deleteTodos(id),
    onMutate: (id: string) => setIsCardLoadingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      SoonerCardSuccess('Task removed');
    },
    onError: (error) => {
      console.error('Failed to delete:', error);
      SoonerCardError('Failed to remove task. Please try again');
    },
    onSettled: () => setIsCardLoadingId(''),
  });

  const addNewSchedule = async () => {
    if (!newSchedule.title.trim()) {
      return setErrorMessage('Title cannot be left blank.');
    }

    setErrorMessage('');
    addScheduleMutation.mutate({
      title: newSchedule.title.trim(),
      completed: false,
      date: newSchedule.date,
      priority: newSchedule.priority ?? 'LOW',
    });
  };

  const handleDelete = async (id: string) => {
    deleteScheduleMutation.mutate(id);
  };

  // UseEffect for scrolling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY) < 50) return;

      lastScrollY = currentScrollY;

      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollPosition = currentScrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;

        if (
          scrollPosition >= pageHeight - 300 &&
          hasNextPage &&
          !isLoading &&
          !isFetching
        ) {
          fetchNextPage();
        }
      }, 300);
    };

    const optimizedScrollHandler = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', optimizedScrollHandler, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [hasNextPage, isLoading, isFetching, fetchNextPage]);

  // Reset page when filters change
  useEffect(() => {
    if (scheduleType !== 'upcoming') {
      setDates(() => initialDate);
    }
    queryClient.invalidateQueries({
      queryKey: [
        'todos',
        {
          scheduleType,
          completed,
          priority,
          dates,
          sort,
          order,
        },
      ],
    });
  }, [
    scheduleType,
    priority,
    completed,
    sort,
    order,
    initialDate,
    dates,
    queryClient,
  ]);

  return (
    <main className='flex flex-col items-center px-4 py-6 md:py-[104px]'>
      <div className='flex w-full max-w-[600px] flex-col gap-4 md:gap-5'>
        <Header />
        <SearchBar
          search={search}
          scheduleType={scheduleType}
          setSearch={setSearch}
          completed={completed}
          setCompleted={setCompleted}
          priority={priority}
          setPriority={setPriority}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
        />
        <ScheduleOption
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
        />
        <ScheduleTitle
          scheduleType={scheduleType}
          totalItem={totalItem}
          formattedDate={dates.formattedDate}
        />

        {scheduleType === 'upcoming' && (
          <UpcomingOption
            dates={dates}
            setDates={setDates}
            currentUTCDate={currentUTCDate}
          />
        )}

        {/* Schedule Content */}
        <section className='mx-4 flex flex-col gap-3 md:mx-0'>
          {schedule
            .filter(
              (prev) =>
                prev.title.toLowerCase().includes(search.toLowerCase()) &&
                (priority ? prev.priority === priority : true)
            )
            .map((item) => (
              <ScheduleCard
                scheduleType={scheduleType}
                key={item.id}
                id={item.id}
                title={item.title}
                completed={item.completed}
                date={item.date}
                priority={item.priority}
                handleDelete={handleDelete}
                isCardLoadingId={isCardLoadingId}
                setIsCardLoadingId={setIsCardLoadingId}
              />
            ))}

          {(isLoading || isFetching) && (
            <div className='flex h-12 w-full items-center justify-center'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500' />
            </div>
          )}

          {schedule.length === 0 && !isLoading && dates && !search && (
            <p className='custom-text-md-semibold text-center'>
              Nothing to do yet!
            </p>
          )}

          {!hasNextPage && schedule.length > 0 && !search && (
            <p className='custom-text-md-semibold text-center'>
              All tasks loaded
            </p>
          )}

          {search !== '' &&
            schedule.filter((prev) => prev.title.includes(search)).length ===
              0 && (
              <p className='custom-text-md-semibold text-center'>
                Try a different keyword.
              </p>
            )}
        </section>

        {/* Add Task */}
        {scheduleType !== 'completed' && (
          <Button
            onClick={() => {
              setIsAddNewSchedule(true);
              setNewSchedule({
                id: 'DUMMY_ID',
                title: '',
                completed: false,
                date: currentUTCDate,
                priority: 'LOW',
              });
            }}
            className='md:mx-auto md:max-w-[300px]'
          >
            + Add Task
          </Button>
        )}

        <DialogCard
          isOpen={isAddNewSchedule}
          setIsOpen={setIsAddNewSchedule}
          dialogTitle='Add Task'
          data={newSchedule}
          setData={setNewSchedule}
          isLoading={addScheduleMutation.isPending}
          currentFunction={addNewSchedule}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  );
};

export default Home;

const Header = () => {
  const { isMobile } = useResponsiveToggle();
  const [onDarkMode, setOnDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStorageTheme();
    if (stored === 'dark') {
      setOnDarkMode(true);
      setDarkMode(true);
    }
  }, []);

  const toggle = () => {
    const nextValue = !onDarkMode;
    setOnDarkMode(nextValue);
    setDarkMode(nextValue);
  };

  return (
    <header className='flex w-full items-center justify-between'>
      {/* Title */}
      <div className='flex flex-col gap-[2px]'>
        <p className='custom-text-xl-bold md:custom-display-sm-bold'>
          What&apos;s on Your Plan Today?
        </p>
        <p className='custom-text-sm-regular md:custom-text-md-regular sub-text'>
          Your productivity starts now.
        </p>
      </div>

      {/* Background Icon Selector */}
      <ThemeToggle
        onDarkMode={onDarkMode}
        toggle={toggle}
        isMobile={isMobile}
      />
    </header>
  );
};

type SearchBarProps = {
  search: string;
  scheduleType: ScheduleType;
  setSearch: Dispatch<SetStateAction<string>>;
  completed: IsCompleted;
  setCompleted: Dispatch<SetStateAction<IsCompleted>>;
  priority: Priority;
  setPriority: Dispatch<SetStateAction<Priority>>;
  sort: Sort;
  setSort: Dispatch<SetStateAction<Sort>>;
  order: Order;
  setOrder: Dispatch<SetStateAction<Order>>;
};

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  scheduleType,
  setSearch,
  completed,
  setCompleted,
  priority,
  setPriority,
  sort,
  setSort,
  order,
  setOrder,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const completedOption: { display: string; value: IsCompleted }[] = [
    { display: '--', value: undefined },
    { display: 'Completed', value: true },
    { display: 'Not Completed', value: false },
  ];

  const priorityOption: { display: string; value: Priority }[] = [
    { display: '--', value: undefined },
    { display: 'Low', value: 'LOW' },
    { display: 'Medium', value: 'MEDIUM' },
    { display: 'High', value: 'HIGH' },
  ];

  const sortOption: { display: string; value: Sort }[] = [
    { display: '--', value: undefined },
    { display: 'Id', value: 'id' },
    { display: 'Title', value: 'title' },
    { display: 'Completed', value: 'completed' },
    { display: 'Date', value: 'date' },
    { display: 'Priority', value: 'priority' },
  ];

  const orderOption: { display: string; value: Order }[] = [
    { display: 'Ascending', value: 'asc' },
    { display: 'Descending', value: 'desc' },
  ];

  return (
    <section className='flex w-full flex-col gap-4 md:gap-5'>
      <div className='flex h-11 w-full gap-2 md:h-12 md:gap-3'>
        <div className='border-bg flex w-full items-center gap-[6px] rounded-[12px] px-4 py-2 md:gap-[10px]'>
          <Search
            height={20}
            width={20}
            className='cursor-pointer md:h-6 md:w-6'
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type='text'
            placeholder='Search'
            className='custom-text-sm-regular w-full outline-0'
          />
          {search.length !== 0 && (
            <CircleX
              onClick={() => setSearch('')}
              height={16}
              width={16}
              className='cursor-pointer text-neutral-400 md:h-5 md:w-5 dark:text-neutral-700'
            />
          )}
        </div>

        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          variant={'basic'}
          className='border-bg group flex w-11 cursor-pointer items-center gap-3 rounded-[16px] p-3 md:w-12 md:px-3 md:py-[10px]'
        >
          <ListFilter
            height={20}
            width={20}
            className={cn(
              'transform-all duration-300 group-hover:scale-105',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {isOpen && (
        <div className='border-bg transform-all animate-in slide-in-from-top-5 fade-in-80 w-full rounded-[16px] px-4 py-2 duration-300'>
          <div className='grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2'>
            {scheduleType !== 'completed' && (
              <div className='p-2'>
                <p className='custom-text-sm-semibold'>Completed</p>
                <select
                  className='custom-text-sm-regular w-full cursor-pointer text-neutral-600 focus:ring-0 focus:outline-0 dark:text-neutral-400'
                  value={completed === undefined ? '' : completed.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setCompleted(undefined);
                    } else {
                      setCompleted(value === 'true');
                    }
                  }}
                >
                  {completedOption.map((filter) => (
                    <option
                      key={'Filter: ' + filter.display}
                      value={
                        filter.value === undefined
                          ? ''
                          : filter.value.toString()
                      }
                      className='dark:bg-black'
                    >
                      {filter.display}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className='p-2'>
              <p className='custom-text-sm-semibold'>Priority</p>
              <select
                className='custom-text-sm-regular w-full cursor-pointer text-neutral-600 focus:ring-0 focus:outline-0 dark:text-neutral-400'
                value={priority === undefined ? '' : priority}
                onChange={(e) => {
                  const value = e.target.value;
                  setPriority(value === '' ? undefined : (value as Priority));
                }}
              >
                {priorityOption.map((filter) => (
                  <option
                    key={'Filter: ' + filter.display}
                    value={filter.value === undefined ? '' : filter.value}
                    className='dark:bg-black'
                  >
                    {filter.display}
                  </option>
                ))}
              </select>
            </div>

            <div className='p-2'>
              <p className='custom-text-sm-semibold'>Sort</p>
              <select
                className='custom-text-sm-regular w-full cursor-pointer text-neutral-600 focus:ring-0 focus:outline-0 dark:text-neutral-400'
                value={sort === undefined ? '' : sort}
                onChange={(e) => {
                  const value = e.target.value;
                  setSort(value === '' ? undefined : (value as Sort));
                }}
              >
                {sortOption.map((filter) => (
                  <option
                    key={'Filter: ' + filter.display}
                    value={filter.value === undefined ? '' : filter.value}
                    className='dark:bg-black'
                  >
                    {filter.display}
                  </option>
                ))}
              </select>
            </div>

            <div className='p-2'>
              <p className='custom-text-sm-semibold'>Order</p>
              <select
                className='custom-text-sm-regular w-full cursor-pointer text-neutral-600 focus:ring-0 focus:outline-0 dark:text-neutral-400'
                value={order}
                onChange={(e) => {
                  const value = e.target.value;
                  setOrder(value as Order);
                }}
              >
                {orderOption.map((filter) => (
                  <option
                    key={'Filter: ' + filter.display}
                    value={filter.value}
                    className='dark:bg-black'
                  >
                    {filter.display}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

type ScheduleOptionProps = {
  scheduleType: ScheduleType;
  setScheduleType: Dispatch<SetStateAction<ScheduleType>>;
};

const ScheduleOption: React.FC<ScheduleOptionProps> = ({
  scheduleType,
  setScheduleType,
}) => {
  const scheduleOption: { display: string; value: ScheduleType }[] = [
    { display: 'Today', value: 'today' },
    { display: 'Upcoming', value: 'upcoming' },
    { display: 'Completed', value: 'completed' },
  ];

  return (
    <section className='container-bg flex h-12 items-center gap-2 rounded-[16px] p-2 md:h-[52px]'>
      {scheduleOption.map((filter) => (
        <button
          key={'Schedule: ' + filter.display}
          onClick={() => setScheduleType(filter.value)}
          className={cn(
            'custom-text-sm-regular w-full cursor-pointer rounded-[8px] px-3 py-1 transition-all duration-300 ease-in-out',
            filter.value === scheduleType
              ? 'bg-primary-100 custom-text-sm-semibold text-white hover:bg-[#093a9d]'
              : 'hover:bg-primary-100/70 hover:dark:bg-primary-100/60 hover:text-white'
          )}
        >
          {filter.display}
        </button>
      ))}
    </section>
  );
};

type ScheduleTitleProps = {
  scheduleType: ScheduleType;
  totalItem: number;
  formattedDate: string;
};

const ScheduleTitle: React.FC<ScheduleTitleProps> = ({
  scheduleType,
  totalItem,
  formattedDate,
}) => {
  const title = scheduleType[0].toUpperCase() + scheduleType.slice(1);

  return (
    <section className='flex items-center justify-between'>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 md:gap-[10px]'>
            {scheduleType === 'completed' && (
              <CircleCheck height={20} width={20} />
            )}
            <p className='custom-display-xs-bold'>{title}</p>
          </div>
          <div className='flex items-center justify-center rounded-[100px] bg-[#DEDCDC] px-3 py-[2px] dark:bg-neutral-900'>
            <p className='custom-text-sm-semibold md:custom-text-sm-semibold'>
              {totalItem} Item{totalItem !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {scheduleType === 'today' && (
          <p className='custom-text-sm-regular sub-text'>
            {formattedDate || 'Loading...'}
          </p>
        )}
      </div>
    </section>
  );
};

type UpcomingOptionProps = {
  dates: DateList;
  setDates: Dispatch<SetStateAction<DateList>>;
  currentUTCDate: string;
};

const UpcomingOption: React.FC<UpcomingOptionProps> = ({
  dates,
  setDates,
  currentUTCDate,
}) => {
  const formattedDateString = (date: string) => {
    return dayjs(date).format('MMM D, YYYY');
  };

  const formatDateForInput = (iso: string) => {
    return dayjs(iso).format('YYYY-MM-DD');
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = dayjs(e.target.value).startOf('day').toISOString();

    setDates((prev) => {
      const newDates = {
        ...prev,
        startDate: selectedDate,
      };

      if (dayjs(selectedDate).isAfter(dayjs(prev.endDate))) {
        newDates.endDate = dayjs(selectedDate).endOf('day').toISOString();
      }

      return newDates;
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = dayjs(e.target.value).endOf('day').toISOString();

    setDates((prev) => {
      const adjustedEndDate = dayjs(selectedDate).isBefore(
        dayjs(prev.startDate)
      )
        ? dayjs(prev.startDate).endOf('day').toISOString()
        : selectedDate;

      return {
        ...prev,
        endDate: adjustedEndDate,
      };
    });
  };

  return (
    <div className='border-bg flex justify-between gap-4 rounded-[16px] px-3 py-2'>
      <div className='flex flex-1 flex-col'>
        <p className='custom-text-sm-regular md:custom-text-xs-regular text-neutral-400'>
          Select start date
        </p>

        <div className='flex items-center gap-2'>
          <p className='custom-text-sm-regular md:custom-text-md-regular text-start'>
            {formattedDateString(dates.startDate)}
          </p>

          <div className='relative flex cursor-pointer items-center justify-center'>
            <Calendar height={16} width={16} />
            <input
              type='date'
              className='absolute inset-0 h-full w-full opacity-0'
              value={formatDateForInput(dates.startDate)}
              min={formatDateForInput(currentUTCDate)}
              onChange={handleStartDateChange}
              onInput={(e) => {
                if (!e.currentTarget.value) {
                  e.currentTarget.value = formatDateForInput(dates.startDate);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col'>
        <p className='custom-text-sm-regular md:custom-text-xs-regular text-neutral-400'>
          Select end date
        </p>

        <div className='flex items-center gap-2'>
          <p className='custom-text-sm-regular md:custom-text-md-regular text-start'>
            {formattedDateString(dates.endDate)}
          </p>

          <div className='relative flex cursor-pointer items-center justify-center'>
            <Calendar height={16} width={16} />
            <input
              type='date'
              className='absolute inset-0 h-full w-full opacity-0'
              value={formatDateForInput(dates.endDate)}
              min={formatDateForInput(dates.startDate)}
              onChange={handleEndDateChange}
              onInput={(e) => {
                if (!e.currentTarget.value) {
                  e.currentTarget.value = formatDateForInput(dates.startDate);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
