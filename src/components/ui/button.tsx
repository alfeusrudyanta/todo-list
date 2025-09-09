import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex items-center justify-center rounded-[16px] text-center cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary-100 custom-text-sm-semibold text-white md:custom-text-md-semibold hover:bg-[#093a9d]',
        basic: 'z-10',
      },
      size: {
        default: 'w-full h-11 md:h-12',
        basic: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
