import placeholderEvent from '@/assets/placeholder_event.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import * as m from '@/@generated/paraglide/messages';

const DEFAULT_EVENT_IMAGE = placeholderEvent;

const categories = [
  { value: 'Music', label: m.category_music() },
  { value: 'Culture', label: m.category_culture() },
  { value: 'Food', label: m.category_food() },
  { value: 'Games', label: m.category_games() },
  { value: 'Talks', label: m.category_talks() },
  { value: 'Workshops', label: m.category_workshops() },
];

export function EventForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Card
      className="
        flex
        w-full
        max-w-md
        flex-col
        rounded-lg
        bg-white
        p-6
        shadow-lg
        md:max-w-2xl
        lg:max-w-4xl
        2xl:max-w-6xl
      "
    >
      <CardHeader>
        <CardTitle className="text-3xl">{m.create_event_title()}</CardTitle>

        <CardDescription className="text-lg">{m.create_event_description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6">
          {/* Image */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="image">{m.create_event_image()}</Label>

            <div
              className="
				flex
				flex-col
				items-center
				justify-center
				gap-4
				rounded-lg
				border
				border-dashed
				p-6
				text-center
				"
            >
              {/* must be a valid image source, so now using a placeholder image */}
              <img
                src={DEFAULT_EVENT_IMAGE}
                className="
					h-80
					w-full
					max-w-2xl
					rounded-lg
					object-cover
				"
              />

              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {m.create_event_image_upload_button()}
                </Button>
                <Input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{m.create_event_event_title()}</Label>

            <Input id="title" placeholder={m.create_event_event_title_placeholder()} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{m.create_event_event_description()}</Label>

            <Textarea
              id="description"
              placeholder={m.create_event_event_description_placeholder()}
            />
          </div>

          {/* Category + Location */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">{m.create_event_category()}</Label>

              <Select>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder={m.create_event_category_placeholder()} />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">{m.create_event_location()}</Label>

              <Input id="location" placeholder={m.create_event_location_placeholder()} />
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">{m.create_event_date()}</Label>

              <Input id="date" type="date" className="w-full" />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">{m.create_event_time()}</Label>

              <Input id="time" type="time" className="w-full" />
            </div>
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-2 md:w-1/2">
            <Label htmlFor="capacity">{m.create_event_capacity()}</Label>

            <Input
              id="capacity"
              type="number"
              min="1"
              placeholder={m.create_event_capacity_placeholder()}
              className="w-full"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 flex justify-center pb-10">
            <Button type="submit" className="w-fit px-15" size="lg">
              {m.create_event_create_button()}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
