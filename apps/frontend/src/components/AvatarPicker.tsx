// Avatar upload control for the profile page.
// The chosen file is center-cropped, downscaled and stored as a data URL on
// users.avatar, the same way event images are stored.

import { useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { NO_AVATAR, UserAvatar, avatarSource } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_AVATAR_IMAGE_BYTES, validateAndCompress } from '@/lib/image';

const COMPRESS_OPTIONS = {
  maxWidth: 256,
  maxHeight: 256,
  maxBytes: MAX_AVATAR_IMAGE_BYTES,
  square: true,
};

export function AvatarPicker({
  value,
  name,
  username,
  onValueChange,
}: {
  value: string | null | undefined;
  name?: string | null;
  username?: string | null;
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
    <div className="flex flex-col items-center gap-3">
      <UserAvatar name={name} username={username} avatar={value} className="size-24 text-4xl" />

      <div className="flex w-full flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {m.profile_avatar_upload()}
        </Button>

        {avatarSource(value) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              onValueChange(NO_AVATAR);
              setError(undefined);
            }}
          >
            <Trash2 />
            {m.profile_avatar_remove()}
          </Button>
        )}
      </div>

      <Input
        ref={inputRef}
        id="avatar"
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={m.profile_avatar_upload()}
        onChange={(event) => {
          void selectImage(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
