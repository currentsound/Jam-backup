export const calculateGeometry = ({width, height, n}) => {
  const ratio = Math.min(width, height) / Math.max(width, height);

  const distance = ([k, l]) => Math.abs(ratio - k / l);

  const admissibleSet = [];

  for (let i = 1; i < Math.sqrt(n); i++) {
    for (let j = Math.ceil(n / i); j < n / i + 1; j++) {
      console.log(i, j, distance([i, j]));
      admissibleSet.push([i, j]);
    }
  }

  console.log(admissibleSet);

  const [k, l] = admissibleSet.sort((a, b) => distance(a) - distance(b))[0];

  const [columns, rows] = width > height ? [l, k] : [k, l];

  return {
    videoWidth: Math.floor(width / columns),
    videoHeight: Math.floor(height / rows),
  };
};

export const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

export const parseConfig = configString => {
  const searchParams = new URLSearchParams(configString);

  return {
    roomId: searchParams.get('roomId'),
    debug: searchParams.get('debug'),
  };
};
