import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import React, { useMemo } from 'react';

import type { PostTodosResponse, Priority } from '@/types/Schedule';

import { Button } from './button';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './dialog';

type DialogCardProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dialogTitle: string;
  data: PostTodosResponse;
  setData: (value: React.SetStateAction<PostTodosResponse>) => void;
  isLoading: boolean;
  currentFunction: () => Promise<void>;
  errorMessage: string;
};

const DialogCard: React.FC<DialogCardProps> = ({
  isOpen,
  setIsOpen,
  dialogTitle,
  data = {
    id: 'DUMMY_ID',
    title: '',
    completed: false,
    date: dayjs().toISOString(),
    priority: 'LOW',
  },
  setData,
  isLoading,
  currentFunction,
  errorMessage,
}) => {
  const priorityOption = useMemo(
    () => [
      { display: 'Low', value: 'LOW' as Priority },
      { display: 'Medium', value: 'MEDIUM' as Priority },
      { display: 'High', value: 'HIGH' as Priority },
    ],
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='flex flex-col p-4'>
        <DialogHeader>
          <DialogTitle className='custom-text-lg-bold md:custom-display-xs-bold'>
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className='flex w-full max-w-full flex-col gap-4'>
          <div className='border-bg h-[120px] rounded-[8px] px-3 py-2 md:h-[140px]'>
            <p className='custom-text-sm-regular md:custom-text-xs-regular text-neutral-400'>
              Enter your task
            </p>
            <textarea
              className='custom-text-sm-regular md:custom-text-md-regular h-full w-full resize-none focus:outline-0'
              value={data.title}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
              }}
            />
          </div>

          <div className='border-bg rounded-[8px] px-3 py-2'>
            <p className='custom-text-sm-regular md:custom-text-xs-regular text-neutral-400'>
              Select priority
            </p>
            <select
              className='w-full cursor-pointer focus:ring-0 focus:outline-0'
              value={data.priority}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
            >
              {priorityOption.map((option) => (
                <option
                  key={'Key:' + option.value}
                  value={option.value}
                  className='custom-text-sm-regular md:custom-text-md-regular cursor-pointer dark:bg-black'
                >
                  {option.display}
                </option>
              ))}
            </select>
          </div>

          <div className='border-bg rounded-[8px] px-3 py-2'>
            <p className='custom-text-sm-regular md:custom-text-xs-regular text-neutral-400'>
              Select date
            </p>

            <div className='flex items-center'>
              <p className='custom-text-sm-regular md:custom-text-md-regular w-full text-start'>
                {dayjs(data.date).format('MMMM D, YYYY')}
              </p>

              <div className='relative flex cursor-pointer items-center justify-center'>
                <Calendar height={16} width={16} />
                <input
                  type='date'
                  className='absolute inset-0 h-full w-full opacity-0'
                  value={dayjs(data.date).format('YYYY-MM-DD')}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      date: dayjs(e.target.value).toISOString(),
                    }))
                  }
                  onInput={(e) => {
                    if (!e.currentTarget.value) {
                      e.currentTarget.value = dayjs(data.date).format(
                        'YYYY-MM-DD'
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className='custom-text-xs-regular md:custom-text-sm-regular text-accent-red'>
              {errorMessage}
            </p>
          )}

          <Button
            disabled={isLoading}
            onClick={currentFunction}
            className='disabled:flex disabled:w-full disabled:items-center disabled:justify-center'
          >
            {isLoading ? (
              <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500' />
            ) : (
              <p>Save</p>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCard;
