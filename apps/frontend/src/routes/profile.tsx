import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { usePresence, usePresenceConnection } from '@/hooks/use-presence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Link } from '@tanstack/react-router';
import { TwoFactorSettings } from '@/components/TwoFactorSettings';
import * as m from '@/@generated/paraglide/messages';
import { locales } from '@/@generated/paraglide/runtime';
import { AvatarPicker } from '@/components/AvatarPicker';
import { NO_AVATAR, UserAvatar } from '@/components/UserAvatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context: { session } }) => {
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query({
        ...context.trpc.users.getMe.queryOptions(),
        staleTime: 'static',
      }),
      context.queryClient.query({
        ...context.trpc.friends.getFriends.queryOptions(),
        staleTime: 'static',
      }),
      context.queryClient.query({
        ...context.trpc.friends.getPendingRequests.queryOptions(),
        staleTime: 'static',
      }),
      context.queryClient.query({
        ...context.trpc.users.getUsers.queryOptions(),
        staleTime: 'static',
      }),
    ]);
  },
  component: ProfilePage,
});

function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-muted-foreground'}`}
      aria-hidden="true"
    />
  );
}

function getLanguageName(locale: string) {
  try {
    const nativeName = new Intl.DisplayNames([locale], { type: 'language' }).of(locale);
    if (nativeName) {
      return nativeName.charAt(0).toUpperCase() + nativeName.slice(1);
    }
  } catch {
    // Ignore and fall through to the code fallback below.
  }
  return locale.toUpperCase();
}

function normalizeLanguage(value: unknown): string {
  if (typeof value !== 'string') return '';
  if ((locales as readonly string[]).includes(value)) return value;
  // Legacy rows stored the English name instead of the locale code.
  if (value === 'english') return 'en';
  return '';
}

function ProfilePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { session } = Route.useRouteContext();
  const [saved, setSaved] = useState(false);

  const userQuery = useQuery(trpc.users.getMe.queryOptions());
  const user = userQuery.data;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  // Seeded from the loader-prefetched user so the avatar renders server-side
  // instead of flashing initials until the sync effect runs.
  const [avatar, setAvatar] = useState<string>(user?.avatar ?? NO_AVATAR);

  // Sync form state when user loads
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setUsername(user.username ?? '');
      setAboutMe(user.aboutMe ?? '');
      setLocation(user.location ?? '');
      setLanguage(normalizeLanguage(user.preferedLanguage));
      setAvatar(user.avatar ?? NO_AVATAR);
    }
  }, [user]);

  const updateUser = useMutation(
    trpc.users.updateUser.mutationOptions({
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(trpc.users.getMe.queryKey(), updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    }),
  );
  const friendsQuery = useQuery(trpc.friends.getFriends.queryOptions());
  const pendingQuery = useQuery(trpc.friends.getPendingRequests.queryOptions());

  const acceptFriend = useMutation(
    trpc.friends.acceptFriend.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.friends.getFriends.queryKey() });
        void queryClient.invalidateQueries({
          queryKey: trpc.friends.getPendingRequests.queryKey(),
        });
      },
    }),
  );

  const removeFriend = useMutation(
    trpc.friends.removeFriend.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.friends.getFriends.queryKey() });
      },
    }),
  );

  const friends = friendsQuery.data ?? [];
  const pending = pendingQuery.data ?? [];
  // Derived directly from this tab's own subscription connection state rather
  // than round-tripping through the server, since that round trip otherwise
  // races the connection itself and can show "Offline" right after login.
  const isSelfOnline = usePresenceConnection(!!user);
  const onlineIds = usePresence(friends.map((f) => f.id));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateUser.mutateAsync({
      id: user.id,
      name,
      username,
      aboutMe,
      location,
      ...(language ? { preferedLanguage: language as 'en' | 'nl' | 'es' } : {}),
      avatar,
    });
  };

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const usersQuery = useQuery(trpc.users.getUsers.queryOptions());

  const addFriend = useMutation(
    trpc.friends.addFriend.mutationOptions({
      onSuccess: () => {
        setSelectedFriendId(null);
        void queryClient.invalidateQueries({
          queryKey: trpc.friends.getPendingRequests.queryKey(),
        });
      },
    }),
  );

  const friendIds = new Set(friends.map((f) => f.id));
  const pendingIds = new Set(pending.map((p) => p.id));

  const eligibleUsers = (usersQuery.data ?? []).filter(
    (candidate) =>
      candidate.id !== user?.id && !friendIds.has(candidate.id) && !pendingIds.has(candidate.id),
  );
  const eligibleIds = eligibleUsers.map((candidate) => candidate.id);
  const eligibleById = new Map(eligibleUsers.map((candidate) => [candidate.id, candidate]));

  function getFriendLabel(id: string) {
    const candidate = eligibleById.get(id);
    return candidate ? (candidate.displayUsername ?? candidate.username) : id;
  }
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{m.profile_login_required()}</p>
      </div>
    );
  }

  if (userQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{userQuery.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">{m.profile_title()}</h1>

      <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Identity */}
        <Card className="lg:sticky lg:top-24">
          <CardHeader className="flex flex-col items-center gap-4 text-center">
            <AvatarPicker
              value={avatar}
              name={user?.name}
              username={user?.username}
              onValueChange={setAvatar}
            />
            <CardTitle>{user?.displayUsername ?? user?.username}</CardTitle>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <StatusDot online={isSelfOnline} />
              {isSelfOnline ? m.profile_online() : m.profile_offline()}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <Link
              to="/my-events"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              {m.button_my_events()}
            </Link>

            <Link
              to="/my-tickets"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              {m.button_my_tickets()}
            </Link>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="flex min-w-0 flex-col gap-8">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="name">{m.profile_name()}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  {/* Username */}
                  <div className="grid gap-2">
                    <Label htmlFor="username">{m.profile_username()}</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* About Me */}
                <div className="grid gap-2">
                  <Label htmlFor="aboutMe">{m.profile_about_me()}</Label>
                  <Textarea
                    id="aboutMe"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder={m.profile_about_placeholder()}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Location */}
                  <div className="grid gap-2">
                    <Label htmlFor="location">{m.profile_location()}</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={m.profile_location_placeholder()}
                    />
                  </div>

                  {/* Language */}
                  <div className="grid gap-2">
                    <Label htmlFor="language">{m.language_label()}</Label>
                    <Select
                      value={language}
                      onValueChange={(value) => {
                        if (value) {
                          setLanguage(value);
                        }
                      }}
                    >
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue placeholder={m.profile_language_placeholder()} />
                      </SelectTrigger>
                      <SelectContent>
                        {locales.map((locale) => (
                          <SelectItem key={locale} value={locale}>
                            {getLanguageName(locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {updateUser.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{updateUser.error.message}</AlertDescription>
                  </Alert>
                )}

                {saved && (
                  <Alert>
                    <AlertDescription>{m.profile_saved()}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={updateUser.isPending} className="sm:self-start">
                  {updateUser.isPending ? (
                    <>
                      <Spinner /> {m.profile_saving()}
                    </>
                  ) : (
                    m.profile_save_button()
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <TwoFactorSettings />
          <Card>
            <CardHeader>
              <CardTitle>{m.profile_friends_title()}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="friend-search">{m.profile_friends_add_label()}</Label>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Combobox
                      items={eligibleIds}
                      itemToStringLabel={getFriendLabel}
                      value={selectedFriendId}
                      onValueChange={(value) => setSelectedFriendId(value)}
                    >
                      <ComboboxInput
                        id="friend-search"
                        placeholder={m.profile_friends_search_placeholder()}
                        triggerAriaLabel={m.profile_friends_open_search()}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>{m.admin_no_results()}</ComboboxEmpty>
                        <ComboboxList>
                          {(id: string) => (
                            <ComboboxItem key={id} value={id}>
                              {getFriendLabel(id)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <Button
                    size="sm"
                    disabled={!selectedFriendId || addFriend.isPending}
                    onClick={() => {
                      if (selectedFriendId) {
                        addFriend.mutate({ friendId: selectedFriendId });
                      }
                    }}
                  >
                    {m.profile_friends_add_button()}
                  </Button>
                </div>

                {addFriend.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{addFriend.error.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              {pending.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {m.profile_friends_pending()}
                  </h3>
                  {pending.map((person) => (
                    <div key={person.id} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <UserAvatar
                          name={person.name}
                          username={person.username}
                          avatar={person.avatar}
                          className="size-8"
                        />
                        {person.displayUsername ?? person.username}
                      </span>
                      <Button
                        size="sm"
                        disabled={acceptFriend.isPending}
                        onClick={() => acceptFriend.mutate({ friendId: person.id })}
                      >
                        {m.profile_friends_accept()}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{m.profile_friends_empty()}</p>
                ) : (
                  friends.map((person) => (
                    <div key={person.id} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <UserAvatar
                          name={person.name}
                          username={person.username}
                          avatar={person.avatar}
                          className="size-8"
                        />
                        <StatusDot online={onlineIds.has(person.id)} />
                        {person.displayUsername ?? person.username}
                        <span className="text-xs text-muted-foreground">
                          {onlineIds.has(person.id) ? m.profile_online() : m.profile_offline()}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={removeFriend.isPending}
                        onClick={() => removeFriend.mutate({ friendId: person.id })}
                      >
                        {m.profile_friends_remove()}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
