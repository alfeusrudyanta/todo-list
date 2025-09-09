'use client';

import dayjs from 'dayjs'; // Add dayjs import
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { ScheduleCard } from '@/types/Schedule';

import { Button } from './ui/button';
import DialogCard from './ui/DialogCard';
import { SoonerCardError, SoonerCardSuccess } from './ui/SoonerCard';

type ScheduleCardProps = ScheduleCard & {
  scheduleType: 'today' | 'upcoming' | 'completed';
  isBlur?: boolean;
  handleDelete: (id: string) => Promise<void>;
  isCardLoadingId: string;
  setIsCardLoadingId: Dispatch<SetStateAction<string>>;
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  id,
  title,
  completed,
  date,
  priority,
  scheduleType,
  isBlur = false,
  handleDelete,
  isCardLoadingId,
  setIsCardLoadingId,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [scheduleData, setScheduleData] = useState<ScheduleCard>({
    id,
    title,
    completed,
    date,
    priority,
  });
  const [tempScheduleData, setTempScheduleData] = useState<ScheduleCard>({
    id,
    title,
    completed,
    date,
    priority,
  });
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isLoading = isCardLoadingId === id;

  const formattedDateString = useMemo(
    () => dayjs(scheduleData.date).format('MMM D, YYYY'),
    [scheduleData.date]
  );

  const priorityOption = useMemo(() => {
    switch (scheduleData.priority) {
      case 'HIGH':
        return { className: 'bg-accent-green text-white', display: 'High' };
      case 'MEDIUM':
        return { className: 'bg-accent-yellow text-black', display: 'Medium' };
      case 'LOW':
        return { className: 'bg-accent-red text-white', display: 'Low' };
      default:
        return { className: '', display: '' };
    }
  }, [scheduleData.priority]);

  const updateCompletedSchedule = useCallback(async () => {
    setIsCardLoadingId(id);
    try {
      const updateData = await api.putTodos(id, {
        title: scheduleData.title,
        completed: !scheduleData.completed,
        date: scheduleData.date,
        priority: scheduleData.priority,
      });
      setScheduleData(updateData);
    } catch (error) {
      console.error('Failed to update schedule: ', error);
    } finally {
      setIsCardLoadingId('');
    }
  }, [
    id,
    scheduleData.title,
    scheduleData.completed,
    scheduleData.date,
    scheduleData.priority,
    setIsCardLoadingId,
  ]);

  const updateSchedule = useCallback(async () => {
    setIsCardLoadingId(id);

    if (!tempScheduleData.title.trim()) {
      setErrorMessage('Task title is required.');
      setIsCardLoadingId('');
      return;
    }

    if (
      tempScheduleData.title.trim() === scheduleData.title &&
      tempScheduleData.completed === scheduleData.completed &&
      tempScheduleData.date === scheduleData.date &&
      tempScheduleData.priority === scheduleData.priority
    ) {
      setErrorMessage('No changes detected. Please update at least one field.');
      setIsCardLoadingId('');
      return;
    }

    setErrorMessage('');

    try {
      const updateData = await api.putTodos(tempScheduleData.id, {
        title: tempScheduleData.title.trim(),
        completed: tempScheduleData.completed,
        date: tempScheduleData.date,
        priority: tempScheduleData.priority,
      });
      setScheduleData(updateData);
      setIsEditOpen(false);
      setIsMenuOpen(false);
      SoonerCardSuccess('Changes saved');
    } catch (error) {
      SoonerCardError('Failed to update task. Please try again');
      console.error('Failed to update task: ', error);
    } finally {
      setIsCardLoadingId('');
    }
  }, [tempScheduleData, scheduleData, id, setIsCardLoadingId]);

  const openEditDialog = useCallback(() => {
    setIsEditOpen(true);
    setIsMenuOpen(false);
    setTempScheduleData(scheduleData);
  }, [scheduleData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        'container-bg relative flex items-center gap-3 rounded-[16px] p-3 md:gap-4',
        isBlur && 'blur-md'
      )}
    >
      {/* Loading Effect */}
      {isLoading && (
        <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-[16px] bg-gray-600/30 dark:bg-gray-600/90'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-500 dark:border-neutral-900' />
        </div>
      )}

      {/* Checkbox */}
      <input
        type='checkbox'
        className='container-bg h-6 w-6 rounded-[7.2px]'
        checked={scheduleData.completed}
        onChange={updateCompletedSchedule}
        disabled={isLoading}
      />

      {/* Plan & Date*/}
      <div className='flex w-full flex-col gap-1'>
        {/* Plan */}
        <p
          className={cn(
            'custom-text-sm-semibold md:custom-text-md-semibold',
            scheduleData.completed &&
              'text-[#AAAAAA] line-through dark:text-neutral-600'
          )}
        >
          {scheduleData.title}
        </p>

        {/* Date & Priority */}
        <div className='flex items-center gap-[18px] md:gap-[26px]'>
          <p
            className={cn(
              'custom-text-xs-regular md:custom-text-sm-regular text-neutral-500 md:text-neutral-400',
              scheduleData.completed && 'text-[#AAAAAA] dark:text-neutral-600'
            )}
          >
            {formattedDateString}
          </p>
          <div
            className={cn(
              'flex h-6 items-center gap-2 rounded-[8px] p-2',
              priorityOption.className,
              isBlur && 'bg-neutral-400 blur-md dark:bg-neutral-700'
            )}
          >
            <p
              className={cn(
                'custom-text-xs-semibold md:custom-text-sm-semibold',
                isBlur && 'blur-md'
              )}
            >
              {priorityOption.display}
            </p>
          </div>
        </div>
      </div>

      {/* Option */}
      {scheduleType !== 'completed' && isBlur === false && (
        <Ellipsis
          height={24}
          width={24}
          className='cursor-pointer'
          onClick={() => !isLoading && setIsMenuOpen((prev) => !prev)}
        />
      )}

      {isMenuOpen && (
        <div
          ref={menuRef}
          className='border-bg absolute top-[55px] right-2 z-10 flex w-[196px] flex-col gap-5 rounded-[16px] bg-white p-4 dark:bg-black'
        >
          <Button
            onClick={openEditDialog}
            variant='basic'
            size='basic'
            className='custom-text-sm-regular md:custom-text-md-regular hover:text-primary-100 flex cursor-pointer items-center justify-start gap-2 rounded-none'
          >
            <Pencil height={20} width={20} />
            <p>Edit</p>
          </Button>
          <Button
            onClick={() => handleDelete(id)}
            variant='basic'
            size='basic'
            disabled={isLoading}
            className='custom-text-sm-regular md:custom-text-md-regular hover:text-primary-100 text-accent-red flex cursor-pointer items-center justify-start gap-2 rounded-none'
          >
            <Trash2 height={20} width={20} />
            <p>Delete</p>
          </Button>
        </div>
      )}

      <DialogCard
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        dialogTitle='Edit Task'
        data={tempScheduleData}
        setData={setTempScheduleData}
        isLoading={isLoading}
        currentFunction={updateSchedule}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default ScheduleCard;
