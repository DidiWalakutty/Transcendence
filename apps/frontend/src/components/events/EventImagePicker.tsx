import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

import placeholderEvent from '@/assets/placeholder_event.png';
import * as m from '@/@generated/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_STORED_IMAGE_SIZE = 72 * 1024;
const MAX_IMAGE_WIDTH = 1280;
const MAX_IMAGE_HEIGHT = 720;

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

async function compressImage(file: File): Promise<string> {
  const source = await readFile(file);
  const image = await loadImage(source);
  let scale = Math.min(1, MAX_IMAGE_WIDTH / image.width, MAX_IMAGE_HEIGHT / image.height);
  let lastResult = source;

  for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.68, 0.54, 0.4]) {
      lastResult = canvas.toDataURL('image/webp', quality);
      if (lastResult.length <= MAX_STORED_IMAGE_SIZE) return lastResult;
    }

    scale *= 0.75;
  }

  if (lastResult.length > MAX_STORED_IMAGE_SIZE) throw new Error();
  return lastResult;
}

export function EventImagePicker({
  id,
  name,
  value,
  onValueChange,
}: {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  async function selectImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(m.event_image_invalid_type());
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_SIZE) {
      setError(m.event_image_too_large());
      return;
    }

    try {
      onValueChange(await compressImage(file));
      setError(undefined);
    } catch {
      setError(m.event_image_read_error());
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-white p-4 text-center">
      <img
        src={value === 'PLACEHOLDER' ? placeholderEvent : value}
        alt=""
        className="h-48 w-full rounded-lg object-cover"
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 size-4" />
        {m.create_event_image_upload_button()}
      </Button>
      <Input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          void selectImage(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <input type="hidden" name={name} value={value} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
