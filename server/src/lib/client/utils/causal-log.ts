let timeout: string | number | undefined = undefined;
export default function log(...args: unknown[]) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('\n----------------\n\n');
  }, 20) as unknown as string | number | undefined;
  console.log(...args);
}
