'use client';

import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import { Button } from './ui/button';

type ThemeToggleProps = {
  onDarkMode: boolean;
  toggle: () => void;
  isMobile: boolean;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  onDarkMode,
  toggle,
  isMobile,
}) => {
  return (
    <div className='container-bg relative flex gap-2 rounded-2xl p-2'>
      <Button
        variant={'basic'}
        size={'basic'}
        onClick={toggle}
        disabled={!onDarkMode}
        className='group p-1 md:p-[6px]'
      >
        <Sun
          height={16}
          width={16}
          className='text-white group-hover:scale-105 md:h-[20px] md:w-[20px]'
        />
      </Button>

      <Button
        variant={'basic'}
        size={'basic'}
        onClick={toggle}
        disabled={onDarkMode}
        className='group p-1 md:p-[6px]'
      >
        <Moon
          height={16}
          width={16}
          className='group-hover:scale-105 md:h-[20px] md:w-[20px] dark:text-white'
        />
      </Button>

      <motion.div
        animate={{ x: onDarkMode ? (isMobile ? 32 : 40) : 0 }}
        transition={{ duration: 0.3 }}
        className='bg-primary-100 absolute h-6 w-6 rounded-[8px] md:h-8 md:w-8'
      />
    </div>
  );
};

export default ThemeToggle;
