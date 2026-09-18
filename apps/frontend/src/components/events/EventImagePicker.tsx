import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

import placeholderEvent from '@/assets/placeholder_event.png';
import * as m from '@/@generated/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_EVENT_IMAGE_BYTES, eventImageSource, validateAndCompress } from '@/lib/image';

const COMPRESS_OPTIONS = {
  maxWidth: 1280,
  maxHeight: 720,
  maxBytes: MAX_EVENT_IMAGE_BYTES,
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

    try {
      onValueChange(await validateAndCompress(file, COMPRESS_OPTIONS));
      setError(undefined);
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-type') {
        setError(m.event_image_invalid_type());
      } else if (error instanceof Error && error.message === 'too-large') {
        setError(m.event_image_too_large());
      } else {
        setError(m.event_image_read_error());
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-white p-4 text-center">
      <img
        src={eventImageSource(value, placeholderEvent)}
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
