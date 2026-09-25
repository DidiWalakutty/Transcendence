import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateEventsLists } from '@/lib/invalidation';
import { useTRPC } from '@/integrations/trpc/react';
import * as m from '@/@generated/paraglide/messages';
import { EventCategoryCombobox } from '@/components/events/EventCategoryCombobox';
import { EventDatePicker } from '@/components/events/EventDatePicker';
import { EventImagePicker } from '@/components/events/EventImagePicker';
import {
  createEventSchema,
  EVENT_ADDRESS_MAX,
  EVENT_CAPACITY_MAX,
  EVENT_DESCRIPTION_MAX,
  EVENT_LOCATION_MAX,
  EVENT_TITLE_MAX,
  isEventDateInPast,
  type EventCategory,
} from '@repo/schemas/events';
import { EVENT_PLACEHOLDER } from '@repo/schemas/users';
import { authClient } from '@/lib/auth-client';

// The sentinel, not the bundled asset URL: the picker shows the asset for it
// (eventImageSource), while the stored value stays independent of the build's
// hashed file names.
const DEFAULT_EVENT_IMAGE = EVENT_PLACEHOLDER;

export function EventForm() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createEvent = useMutation(
    trpc.eventCreation.createEvent.mutationOptions({
      onSuccess: async () => {
        await invalidateEventsLists(queryClient, trpc);
      },
    }),
  );

  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedImage, setSelectedImage] = useState(DEFAULT_EVENT_IMAGE);
  const [showErrors, setShowErrors] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [hasContactInfo, setHasContactInfo] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const session = authClient.useSession();
  const currentUser = session.data?.user;

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowErrors(true);

    if (
      !title.trim() ||
      !description.trim() ||
      selectedCategories.length === 0 ||
      !location.trim() ||
      !address.trim() ||
      !selectedDate ||
      !time ||
      !capacity
    ) {
      return;
    }

    const parsed = createEventSchema.safeParse({
      title,
      description,
      category: selectedCategories,
      location,
      address,
      date: selectedDate,
      time,
      image: selectedImage,
      maxCapacity: Number(capacity),
      contactName: hasContactInfo ? contactName.trim() || undefined : undefined,
      contactEmail: hasContactInfo ? contactEmail.trim() || undefined : undefined,
    });
    if (!parsed.success) {
      return;
    }

    // A rejected mutation is shown through the global toast; it must not
    // escape as an uncaught promise in the console.
    const result = await createEvent.mutateAsync(parsed.data).catch(() => undefined);

    if (!result) {
      return;
    }

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
        w-full
        max-w-7xl
      "
    >
      <CardHeader>
        <CardTitle className="text-3xl">{m.create_event_title()}</CardTitle>

        <CardDescription className="text-lg">{m.create_event_description()}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label htmlFor="image">{m.create_event_image()}</Label>

            <EventImagePicker
              id="image"
              name="image"
              value={selectedImage}
              onValueChange={setSelectedImage}
            />
          </div>

          <div className="flex flex-col gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">{m.create_event_event_title()}</Label>

              <div className="rounded-lg border border-input bg-white">
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={EVENT_TITLE_MAX}
                  placeholder={m.create_event_event_title_placeholder()}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              {showErrors && !title.trim() && (
                <p className="text-sm text-red-500">{m.create_event_event_title_required()}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">{m.create_event_event_description()}</Label>

              <div className="rounded-lg border border-input bg-white">
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={EVENT_DESCRIPTION_MAX}
                  placeholder={m.create_event_event_description_placeholder()}
                  className="min-h-32 resize-y border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              {showErrors && !description.trim() && (
                <p className="text-sm text-red-500">
                  {m.create_event_event_description_required()}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">{m.create_event_category()}</Label>

              <EventCategoryCombobox
                id="category"
                value={selectedCategories}
                onValueChange={(value) => setSelectedCategories(value as EventCategory[])}
              />

              {showErrors && selectedCategories.length === 0 && (
                <p className="text-sm text-red-500">{m.create_event_category_required()}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {/* Location + Address */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Location */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="location">{m.create_event_location()}</Label>

                <div className="rounded-lg border border-input bg-white">
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    maxLength={EVENT_LOCATION_MAX}
                    placeholder={m.create_event_location_placeholder()}
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>

                {showErrors && !location.trim() && (
                  <p className="text-sm text-red-500">{m.create_event_location_required()}</p>
                )}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">{m.create_event_address()}</Label>

                <div className="rounded-lg border border-input bg-white">
                  <Input
                    id="address"
                    name="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    maxLength={EVENT_ADDRESS_MAX}
                    placeholder={m.create_event_address_placeholder()}
                    className="border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>

                {showErrors && !address.trim() && (
                  <p className="text-sm text-red-500">{m.create_event_address_required()}</p>
                )}
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

                {showErrors && !selectedDate && (
                  <p className="text-sm text-red-500">{m.create_event_date_required()}</p>
                )}
                {showErrors && selectedDate && isEventDateInPast(selectedDate) && (
                  <p className="text-sm text-red-500">{m.create_event_date_past()}</p>
                )}
              </div>

              {/* Time */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="time">{m.create_event_time()}</Label>

                <div className="rounded-lg border border-input bg-white">
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>

                {showErrors && !time && (
                  <p className="text-sm text-red-500">{m.create_event_time_required()}</p>
                )}
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
                  max={EVENT_CAPACITY_MAX}
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  placeholder={m.create_event_capacity_placeholder()}
                  className="w-full border-0 bg-transparent focus-visible:ring-0"
                />
              </div>

              {showErrors && !capacity && (
                <p className="text-sm text-red-500">{m.create_event_capacity_required()}</p>
              )}
            </div>

            {/* Contact Toggle Checkbox */}
            <div className="flex items-center space-x-2 rounded-lg border border-input p-4 bg-white mt-4">
              <input
                type="checkbox"
                id="hasContactInfo"
                checked={hasContactInfo}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setHasContactInfo(isChecked);
                  if (isChecked) {
                    setContactName(currentUser?.name || '');
                  } else {
                    setContactName('');
                    setContactEmail('');
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="hasContactInfo" className="text-sm font-medium text-gray-700">
                {m.event_contact_include()}
              </label>
            </div>

            {/* Slide-out Field Containers */}
            {hasContactInfo && (
              <div className="grid gap-6 md:grid-cols-2 mt-4 p-4 rounded-lg bg-gray-50 border border-input">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contactName">{m.event_contact_name_label()}</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={m.event_contact_name_placeholder()}
                    className="bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contactEmail">{m.event_contact_email_label()}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="organizer@example.com"
                    className="bg-white"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Submit */}
          <div className="flex justify-center lg:col-span-2">
            <Button
              type="submit"
              className="w-fit px-15"
              size="lg"
              disabled={createEvent.isPending}
            >
              {m.create_event_create_button()}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
