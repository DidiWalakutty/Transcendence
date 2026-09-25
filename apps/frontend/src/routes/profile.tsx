import { createFileRoute } from '@tanstack/react-router';
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
import { getLocale, locales, setLocale } from '@/@generated/paraglide/runtime';
import { AvatarPicker } from '@/components/AvatarPicker';
import { NO_AVATAR, UserAvatar } from '@/components/UserAvatar';
import { StatusDot } from '@/components/ui/status-dot';
import { getLanguageName } from '@/lib/i18n';
import { normalizeUserLanguage, getUserLabel } from '@repo/schemas/users';
import { makePasswordField } from '@repo/schemas/fields';
import { requireAuth } from '@/lib/route-guards';
import { toast } from 'sonner';
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
    requireAuth(session);
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
        ...context.trpc.friends.getEligibleUsers.queryOptions({}),
        staleTime: 'static',
      }),
    ]);
  },
  component: ProfilePage,
});

function getProfileValidationErrors(error: unknown): {
  name?: string;
  username?: string;
  language?: string;
} {
  const message = error instanceof Error ? error.message : String(error);

  if (message === 'A user with this username already exists') {
    return {
      username: 'A user with this username already exists',
    };
  }

  try {
    const issues = JSON.parse(message);

    if (!Array.isArray(issues)) {
      return {};
    }

    const errors: {
      name?: string;
      username?: string;
      language?: string;
    } = {};

    for (const issue of issues) {
      const field = issue?.path?.[0];

      if (
        typeof field === 'string' &&
        typeof issue?.message === 'string' &&
        (field === 'name' || field === 'username' || field === 'language')
      ) {
        if (field === 'name') {
          errors.name = issue.message;
        } else if (field === 'username') {
          errors.username = issue.message;
        } else {
          errors.language = issue.message;
        }
      }
    }

    return errors;
  } catch {
    return {};
  }
}

function normalizeLanguage(value: unknown): string {
  return normalizeUserLanguage(value);
}

function ProfilePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { session } = Route.useRouteContext();
  const [saved, setSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    username?: string;
    language?: string;
    form?: string;
  }>({});

  const userQuery = useQuery(trpc.users.getMe.queryOptions());
  const user = userQuery.data;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
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
        setAvatar(updatedUser.avatar ?? NO_AVATAR);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    }),
  );

  const handleAvatarChange = (nextAvatar: string) => {
    if (!user || updateUser.isPending || nextAvatar === (user.avatar ?? NO_AVATAR)) return;

    const previousAvatar = avatar;
    setAvatar(nextAvatar);
    const saveAvatar = updateUser.mutateAsync({ id: user.id, avatar: nextAvatar });

    toast.promise(saveAvatar, {
      loading: m.profile_saving(),
      success: m.profile_saved(),
      error: (error) => (error instanceof Error ? error.message : String(error)),
    });

    void saveAvatar.catch(() => {
      setAvatar(previousAvatar);
    });
  };

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
  const isSelfOnline = usePresenceConnection(!!user);
  const onlineIds = usePresence(friends.map((f) => f.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setProfileErrors({});

    try {
      const updatedUser = await updateUser.mutateAsync({
        id: user.id,
        name,
        username,
        aboutMe,
        location,
        ...(language ? { preferedLanguage: language as 'en' | 'nl' | 'es' } : {}),
        avatar,
      });

      const savedLanguage = normalizeLanguage(updatedUser.preferedLanguage);

      if (savedLanguage !== getLocale()) {
        await setLocale(savedLanguage as (typeof locales)[number]);
      }
    } catch (error) {
      const validationErrors = getProfileValidationErrors(error);

      if (Object.keys(validationErrors).length > 0) {
        setProfileErrors(validationErrors);
      } else {
        setProfileErrors({
          form: 'Unable to save your profile. Please try again.',
        });
      }
    }
  };

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const changePasswordMutation = useMutation(
    trpc.users.changePassword.mutationOptions({
      onSuccess: () => {
        setPasswordSuccess(true);
        setPasswordError(null);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success(m.profile_password_success());
        setTimeout(() => setPasswordSuccess(false), 5000);
      },
      onError: (err: any) => {
        setPasswordSuccess(false);

        if (err.message && err.message.startsWith('[')) {
          setPasswordError(m.create_account_password_info());
          return;
        }

        if (err.message === 'invalid_current_password') {
          setPasswordError(m.profile_password_error_invalid());
        } else if (err.message === 'passwords_do_not_match') {
          setPasswordError(m.profile_password_error_match());
        } else {
          setPasswordError(err.message || 'An unexpected error occurred');
        }
      },
    }),
  );

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationCheck = makePasswordField(getLocale()).safeParse(newPassword);
    if (!validationCheck.success) {
      setPasswordError(m.create_account_password_info());
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(m.profile_password_error_match());
      return;
    }
    setPasswordError(null);

    await changePasswordMutation
      .mutateAsync({
        oldPassword,
        newPassword,
        confirmPassword,
      })
      .catch(() => undefined);
  };

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const eligibleQuery = useQuery(trpc.friends.getEligibleUsers.queryOptions({}));

  const addFriend = useMutation(
    trpc.friends.addFriend.mutationOptions({
      onSuccess: () => {
        setSelectedFriendId(null);
        void queryClient.invalidateQueries({
          queryKey: trpc.friends.getPendingRequests.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.friends.getEligibleUsers.queryKey({}),
        });
      },
    }),
  );

  const eligibleUsers = eligibleQuery.data ?? [];
  const eligibleIds = eligibleUsers.map((candidate) => candidate.id);
  const eligibleById = new Map(eligibleUsers.map((candidate) => [candidate.id, candidate]));

  function getFriendLabel(id: string) {
    const candidate = eligibleById.get(id);
    return candidate ? getUserLabel(candidate) : id;
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
        {/* Identity Column */}
        <Card className="lg:sticky lg:top-24">
          <CardHeader className="flex flex-col items-center gap-4 text-center">
            <AvatarPicker
              value={avatar}
              name={user?.name}
              username={user?.username}
              onValueChange={handleAvatarChange}
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

        {/* Details Column Wrapper */}
        <div className="flex min-w-0 flex-col gap-8">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="name">{m.profile_name()}</Label>

                    <Input
                      id="name"
                      value={name}
                      aria-invalid={!!profileErrors.name}
                      aria-describedby={profileErrors.name ? 'name-error' : undefined}
                      onChange={(e) => {
                        setName(e.target.value);
                        setProfileErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                    />

                    {profileErrors.name && (
                      <p id="name-error" className="text-sm text-destructive">
                        {profileErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="grid gap-2">
                    <Label htmlFor="username">{m.profile_username()}</Label>

                    <Input
                      id="username"
                      value={username}
                      aria-invalid={!!profileErrors.username}
                      aria-describedby={profileErrors.username ? 'username-error' : undefined}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setProfileErrors((prev) => ({ ...prev, username: undefined }));
                      }}
                    />

                    {profileErrors.username && (
                      <p id="username-error" className="text-sm text-destructive">
                        {profileErrors.username}
                      </p>
                    )}
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
                    className="bg-input/50"
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
                      itemToStringLabel={(value) => (value ? getLanguageName(value) : '')}
                      disabled={updateUser.isPending}
                      onValueChange={(value) => {
                        if (value) {
                          setLanguage(value);
                        }
                      }}
                    >
                      <SelectTrigger id="language" className="w-full bg-input/50">
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

                {profileErrors.form && (
                  <Alert variant="destructive">
                    <AlertDescription>{profileErrors.form}</AlertDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>{m.profile_change_password_title()}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
                {/* Aligned Current Password Box Row */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="oldPassword">{m.profile_old_password_label()}</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      placeholder="********"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="hidden sm:block" />
                </div>

                {/* New Password & Confirmation Input Split Row */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">{m.profile_new_password_label()}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="********"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">{m.profile_confirm_password_label()}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert>
                    <AlertDescription>{m.profile_password_success()}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="sm:self-start"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner /> {m.profile_saving()}
                    </>
                  ) : (
                    m.profile_password_submit_button()
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Settings Module Wrapper */}
          <TwoFactorSettings />

          {/* Friends Tracking Section */}
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
                <h3 className="text-sm font-medium text-muted-foreground">
                  {m.profile_friends_title()}
                </h3>
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
