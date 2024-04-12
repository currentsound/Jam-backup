

export const arrayRemove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el);
  if (i !== -1) arr.splice(i, 1);
}

export const mergeObject = (obj: Record<string | number | symbol, unknown>, partialObj: Record<string | number | symbol, unknown>) => {
  for (const key in partialObj) {
    const value = partialObj[key];
    if (value !== undefined) {
      obj[key] = value;
    }
  }
}

export const domEvent = (el: HTMLElement, event: keyof HTMLElementEventMap) => {
  return new Promise<void>(resolve => {
    el.addEventListener(event, function onEvent() {
      el.removeEventListener(event, onEvent);
      resolve();
    });
  });
}

export const mergeClasses = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
}

export const concatBytes = (...arrays: Uint8Array[]) => {
  if (!arrays.length) return null;
  const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  const result = new Uint8Array(totalLength);
  let length = 0;
  for (const array of arrays) {
    result.set(array, length);
    length += array.length;
  }
  return result;
}

export const isDark = (hex: string) => {
  if (!hex) return true;
const r = parseInt(hex.slice(1, 3), 16);
const g = parseInt(hex.slice(3, 5), 16);
const b = parseInt(hex.slice(5, 7), 16);
return r + g + b < 128 * 3;
};


