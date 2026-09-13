import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

import placeholderEvent from '@/assets/placeholder_event.png';
import * as m from '@/@generated/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { compressImage } from '@/lib/image';

const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;
const COMPRESS_OPTIONS = {
  maxWidth: 1280,
  maxHeight: 720,
  maxBytes: 72 * 1024,
};

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
      onValueChange(await compressImage(file, COMPRESS_OPTIONS));
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
