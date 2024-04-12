import { readable, type Readable} from "svelte/store";
import {getContext, setContext} from "svelte";

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

type Breakpoint = keyof typeof breakpoints;

const allBreakpoints: Set<string> = new Set(Object.keys(breakpoints));


export const mqp = (className: string, width: number = 0) => {
  const toggledBreakpoints = new Set(
    [...allBreakpoints].filter(key => width >= breakpoints[key as Breakpoint])
  );
  return className
    .split(' ')
    .map(cls => {
      if (cls.indexOf(':') === -1) return cls;
      const [br, clsMq] = cls.split(':');
      if (!allBreakpoints.has(br)) return cls;
      if (toggledBreakpoints.has(br)) return clsMq;
    })
    .filter(cls => !!cls)
    .join(' ');
}

export const setWidthContext = (container: HTMLElement) => {
  const ctx = readable<number>(container.offsetWidth, (set) => {
    const observer = new ResizeObserver(() => {
      set(container.offsetWidth);
    });
    observer.observe(container);
    return () => observer.disconnect();
  });
  setContext('width', ctx);
  return ctx;
}
export const getWidthContext = getContext<Readable<number>>('width')
