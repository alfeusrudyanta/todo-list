import ThemeToggle from '../ThemeToggle';
import useHeader from './useHeader';

const Header = () => {
  const { isMobile, toggle, onDarkMode } = useHeader();

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

export default Header;
