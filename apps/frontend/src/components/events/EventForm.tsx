import placeholderEvent from '@/assets/placeholder_event.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { enUS, nl } from 'date-fns/locale';
import { format } from 'date-fns';
import { Select, SelectContent, SelectGroup, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { getLocale } from '@/@generated/paraglide/runtime';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import * as m from '@/@generated/paraglide/messages';

const DEFAULT_EVENT_IMAGE = placeholderEvent;

const categories = [
  { value: 'music', label: m.category_music() },
  { value: 'culture', label: m.category_culture() },
  { value: 'food', label: m.category_food() },
  { value: 'games', label: m.category_games() },
  { value: 'talks', label: m.category_talks() },
  { value: 'workshops', label: m.category_workshops() },
];

export function EventForm() {
  const locale = getLocale();
  const calendarLocale = locale == 'nl' ? nl : enUS;
  const trpc = useTRPC();
  const navigate = useNavigate();
  const createEvent = useMutation(
    trpc.eventCreation.createEvent.mutationOptions({
      onSuccess: (data) => {
        console.log('CREATE EVENT: mutation succeeded');
        console.log('CREATE EVENT: returned data', data);
      },
      onError: (error) => {
        console.error('CREATE EVENT: mutation failed', error);
      },
    }),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('CREATE EVENT: submit triggered');

    const formData = new FormData(event.currentTarget);
    console.log('CREATE EVENT: form data', Object.fromEntries(formData));

    const result = await createEvent.mutateAsync({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: selectedCategories,
      location: formData.get('location') as string,
      address: formData.get('address') as string,
      dateTime: `${formData.get('date')}T${formData.get('time')}`,
      image: DEFAULT_EVENT_IMAGE,
      maxCapacity: Number(formData.get('capacity')),
    });
    console.log('CREATE EVENT: returned data', result);
    await navigate({
      to: '/$locale/events/$eventId',
      params: {
        locale,
        eventId: result.eventId,
      },
    });
  };

  const selectedCategoryLabel =
    selectedCategories.length === 0
      ? undefined
      : selectedCategories
          .map((value) => categories.find((category) => category.value === value)?.label)
          .filter(Boolean)
          .join(', ');

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
                bg-white
                p-6
                text-center
              "
            >
              <img
                src={DEFAULT_EVENT_IMAGE}
                alt=""
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

            <div className="rounded-lg border border-input bg-white">
              <Select open={categoryOpen} onOpenChange={setCategoryOpen}>
                <SelectTrigger
                  id="category"
                  className="w-full border-0 bg-transparent focus:ring-0"
                >
                  {selectedCategories.length === 0 ? (
                    <span className="text-muted-foreground">
                      {m.create_event_category_placeholder()}
                    </span>
                  ) : (
                    <span>{selectedCategoryLabel}</span>
                  )}
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.value);

                      return (
                        <div
                          key={category.value}
                          className="
						flex
						cursor-pointer
						items-center
						gap-2
						rounded-sm
						px-2
						py-2
						text-sm
						outline-none
						hover:bg-accent
						"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            handleCategoryChange(category.value);
                          }}
                        >
                          <div
                            className={`
							flex
							h-4
							w-4
							items-center
							justify-center
							rounded
							border
							${isSelected ? 'border-primary bg-primary' : 'border-input bg-white'}
						`}
                          >
                            {isSelected && <span className="text-xs text-white">✓</span>}
                          </div>

                          <span>{category.label}</span>
                        </div>
                      );
                    })}
                  </SelectGroup>

                  {/* Dropdown actions */}
                  <div className="flex items-center justify-between border-t px-2 py-2">
                    {selectedCategories.length > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategories([]);
                        }}
                      >
                        {m.filter_clear()}
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setCategoryOpen(false);
                      }}
                    >
                      {m.button_ok()}
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>

            {selectedCategories.length > 0 && (
              <p className="text-sm text-text-muted">{selectedCategories.length} selected</p>
            )}
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

              <Popover>
                <PopoverTrigger
                  id="date"
                  type="button"
                  className={`
					inline-flex
					h-9
					w-full
					items-center
					justify-start
					rounded-md
					border
					border-input
					bg-white
					px-3
					py-2
					text-left
					text-sm
					font-normal
					shadow-xs
					outline-none
					transition-colors
					hover:bg-white
					focus-visible:border-ring
					focus-visible:ring-[3px]
					focus-visible:ring-ring/50
					${!selectedDate ? 'text-muted-foreground' : 'text-text-primary'}
				`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {selectedDate
                    ? format(selectedDate, 'dd/MM/yyyy', {
                        locale: calendarLocale,
                      })
                    : m.create_event_date()}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={calendarLocale}
                  />
                </PopoverContent>
              </Popover>

              <input
                type="hidden"
                name="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                required
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
            <Button type="submit" className="w-fit px-15" size="lg">
              {m.create_event_create_button()}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
