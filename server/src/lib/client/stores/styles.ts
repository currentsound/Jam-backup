import { readonly, writable} from "svelte/store";

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

const writableWidth = writable<number>(700);

let observer: ResizeObserver | undefined = undefined;

export const setContainerForWidth = (container: HTMLElement) => {

    if(observer) {
      observer.disconnect()
    }

    observer = new ResizeObserver(() => {
      writableWidth.set(container.offsetWidth);
    });
    observer.observe(container);
}
export const getWidth = () => readonly(writableWidth);

const backgroundColorStore = writable<string>('white');

export const getBackgroundColor = readonly(backgroundColorStore);
export const setBackgroundColor = (color: string) => backgroundColorStore.set(color);

