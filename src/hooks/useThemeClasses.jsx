import { useDaisyTheme } from "./useDaisyTheme";


export function useThemeClasses() {
  const theme = useDaisyTheme();

  // return whichever Tailwind + DaisyUI classes you need
  //   return theme === 'dark'
  //     ? '!bg-base-neutral-500 !text-base-100'
  //     : '!bg-base-100 !text-neutral-500';
  // }
  // if (theme === "dark") {
  //   // Solid neutral background in dark mode:
  //   return "bg-base-100 text-neutral-content";
  // }

  // // Gradient in light mode:
  // return "bg-gradient-to-r from-emerald-300 to-emerald-800 text-base-100";

  if (theme === "dark") {
    // remove gradient-image and apply solid color
    return "!bg-none !bg-gray-400/65";
    // return "!bg-none !bg-gradient-to-r !from-gray-400 !to-gray-500";
  }

  // light mode: gradient + white text
  return "";



}
