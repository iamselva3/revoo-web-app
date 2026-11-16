import { RefObject, useEffect } from 'react';

/**
 * Publishes the height of a bar fixed to the bottom of the screen (the phone bottom menu, the sell
 * flow's action bar) as the CSS variable `--bottom-bar`. Pages leave that much room at their end so
 * their last button is never hidden, and the floating chat button sits just above the bar. Only one
 * such bar is shown at a time; 0 when the bar isn't fixed (desktop) or isn't shown.
 */
export const useBottomBarHeight = (ref: RefObject<HTMLElement | null>, active = true) => {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const root = document.documentElement;
    const update = () => {
      const fixed = getComputedStyle(el).position === 'fixed';
      root.style.setProperty('--bottom-bar', `${fixed ? Math.round(el.getBoundingClientRect().height) : 0}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      root.style.setProperty('--bottom-bar', '0px');
    };
  }, [ref, active]);
};
