// Client-side image downscaling, shared by the event image picker and the
// avatar picker. Images are stored as data URLs in Postgres text columns, so
// the result has to stay small; the loop keeps shrinking until it fits.

export type CompressOptions = {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  // Center-crops to a square before scaling. Used for avatars.
  square?: boolean;
};

const QUALITY_STEPS = [0.82, 0.68, 0.54, 0.4];
const RESIZE_ATTEMPTS = 5;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error());
    reader.onerror = () => reject(reader.error ?? new Error());
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error());
    image.src = source;
  });
}

export async function compressImage(file: File, options: CompressOptions): Promise<string> {
  const source = await readFile(file);
  const image = await loadImage(source);

  // Source rectangle: the whole image, or its centered square.
  const side = Math.min(image.width, image.height);
  const crop = options.square
    ? { x: (image.width - side) / 2, y: (image.height - side) / 2, width: side, height: side }
    : { x: 0, y: 0, width: image.width, height: image.height };

  let scale = Math.min(1, options.maxWidth / crop.width, options.maxHeight / crop.height);
  let lastResult = source;

  for (let resizeAttempt = 0; resizeAttempt < RESIZE_ATTEMPTS; resizeAttempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(crop.width * scale));
    canvas.height = Math.max(1, Math.round(crop.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error();
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    for (const quality of QUALITY_STEPS) {
      lastResult = canvas.toDataURL('image/webp', quality);
      if (lastResult.length <= options.maxBytes) return lastResult;
    }

    scale *= 0.75;
  }

  if (lastResult.length > options.maxBytes) throw new Error();
  return lastResult;
}
