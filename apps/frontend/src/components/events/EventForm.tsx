import placeholderEvent from '@/assets/placeholder_event.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import * as m from '@/@generated/paraglide/messages';
import { EventCategoryCombobox } from '@/components/events/EventCategoryCombobox';
import { EventDatePicker } from '@/components/events/EventDatePicker';
import { EventImagePicker } from '@/components/events/EventImagePicker';

const DEFAULT_EVENT_IMAGE = placeholderEvent;

export function EventForm() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const createEvent = useMutation(trpc.eventCreation.createEvent.mutationOptions());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(DEFAULT_EVENT_IMAGE);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const result = await createEvent.mutateAsync({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: selectedCategories,
      location: formData.get('location') as string,
      address: formData.get('address') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      image: selectedImage,
      maxCapacity: Number(formData.get('capacity')),
    });
    await navigate({
      to: '/events/$eventId',
      params: {
        eventId: result.eventId,
      },
    });
  };

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Image */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="image">{m.create_event_image()}</Label>
            <EventImagePicker
              id="image"
              name="image"
              value={selectedImage}
              onValueChange={setSelectedImage}
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{m.create_event_event_title()}</Label>

            <div className="rounded-lg border border-input bg-white">
              <Input
                id="title"
                name="title"
                placeholder={m.create_event_event_title_placeholder()}
                className="border-0 bg-transparent focus-visible:ring-0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{m.create_event_event_description()}</Label>

            <div className="rounded-lg border border-input bg-white">
              <Textarea
                id="description"
                name="description"
                placeholder={m.create_event_event_description_placeholder()}
                className="min-h-32 resize-y border-0 bg-transparent focus-visible:ring-0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">{m.create_event_category()}</Label>
            <EventCategoryCombobox
              id="category"
              value={selectedCategories}
              onValueChange={setSelectedCategories}
            />
          </div>

          {/* Location + Address */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">{m.create_event_location()}</Label>

              <div className="rounded-lg border border-input bg-white">
                <Input
                  id="location"
                  name="location"
                  placeholder={m.create_event_location_placeholder()}
                  className="border-0 bg-transparent focus-visible:ring-0"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">{m.create_event_address()}</Label>

              <div className="rounded-lg border border-input bg-white">
                <Input
                  id="address"
                  name="address"
                  placeholder={m.create_event_address_placeholder()}
                  className="border-0 bg-transparent focus-visible:ring-0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">{m.create_event_date()}</Label>
              <EventDatePicker
                id="date"
                name="date"
                value={selectedDate}
                onValueChange={setSelectedDate}
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">{m.create_event_time()}</Label>

              <div className="rounded-lg border border-input bg-white">
                <Input
                  id="time"
                  name="time"
                  type="time"
                  className="w-full text-text-primary border-0 bg-transparent focus-visible:ring-0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-2 md:w-1/2">
            <Label htmlFor="capacity">{m.create_event_capacity()}</Label>

            <div className="rounded-lg border border-input bg-white">
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder={m.create_event_capacity_placeholder()}
                className="w-full border-0 bg-transparent focus-visible:ring-0"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-10 flex justify-center pb-10">
            <Button
              type="submit"
              className="w-fit px-15"
              size="lg"
              disabled={createEvent.isPending || selectedCategories.length === 0 || !selectedDate}
            >
              {m.create_event_create_button()}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
