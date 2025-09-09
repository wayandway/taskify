import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function ThemeChangeButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const handleChangeTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeImage = theme === 'light' ? '/icons/theme-light.svg' : '/icons/theme-dark.svg';

  return (
    <button
      onClick={handleChangeTheme}
      className={`btn-violet-light dark:btn-violet-dark flex gap-2 border-none ${className}`}
    >
      <Image src={themeImage} alt='theme' width={25} height={25} />
      {/* {!isSignPage && <span className='hidden font-bold md:block dark:text-dark-10'>{themeText} 테마</span>} */}
    </button>
  );
}
