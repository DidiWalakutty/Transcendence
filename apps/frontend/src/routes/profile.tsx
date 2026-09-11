import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { usePresence, usePresenceConnection } from '@/hooks/use-presence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Link } from '@tanstack/react-router';
import { TwoFactorSettings } from '@/components/TwoFactorSettings';

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

  // Sync form state when user loads
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setUsername(user.username ?? '');
      setAboutMe(user.aboutMe ?? '');
      setLocation(user.location ?? '');
      setLanguage(user.preferedLanguage ?? '');
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
      preferedLanguage: language,
    });
  };

  const [friendSearch, setFriendSearch] = useState('');

  const usersQuery = useQuery(trpc.users.getUsers.queryOptions());

  const addFriend = useMutation(
    trpc.friends.addFriend.mutationOptions({
      onSuccess: () => {
        setFriendSearch('');
        void queryClient.invalidateQueries({
          queryKey: trpc.friends.getPendingRequests.queryKey(),
        });
      },
    }),
  );

  const friendIds = new Set(friends.map((f) => f.id));

  const searchResults =
    friendSearch.trim().length < 2
      ? []
      : (usersQuery.data ?? [])
          .filter(
            (candidate) =>
              candidate.id !== user?.id &&
              !friendIds.has(candidate.id) &&
              candidate.username.toLowerCase().includes(friendSearch.trim().toLowerCase()),
          )
          .slice(0, 5);
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

      <Card>
        {/* Avatar */}
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <CardTitle>{user?.displayUsername ?? user?.username}</CardTitle>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <StatusDot online={isSelfOnline} />
            {isSelfOnline ? 'Online' : 'Offline'}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            {/* About Me */}
            <div className="grid gap-2">
              <Label htmlFor="aboutMe">About Me</Label>
              <Textarea
                id="aboutMe"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Amsterdam, Netherlands"
              />
            </div>

            {/* Language */}
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="english"
              />
            </div>

            {updateUser.error && (
              <Alert variant="destructive">
                <AlertDescription>{updateUser.error.message}</AlertDescription>
              </Alert>
            )}

            {saved && (
              <Alert>
                <AlertDescription>Profile saved successfully!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-8 flex gap-4 border-t pt-6">
            <Link to="/my-events">
              <Button variant="outline">My Events</Button>
            </Link>
            <Button variant="outline" disabled>
              My Registered Events
            </Button>
          </div>
        </CardContent>
      </Card>
      <TwoFactorSettings />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="friend-search">Add a friend</Label>
            <Input
              id="friend-search"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder="Search by username..."
            />

            {searchResults.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between gap-4">
                <span className="text-sm">{candidate.displayUsername ?? candidate.username}</span>
                <Button
                  size="sm"
                  disabled={addFriend.isPending}
                  onClick={() => addFriend.mutate({ friendId: candidate.id })}
                >
                  Add
                </Button>
              </div>
            ))}

            {addFriend.error && (
              <Alert variant="destructive">
                <AlertDescription>{addFriend.error.message}</AlertDescription>
              </Alert>
            )}
          </div>
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">Pending requests</h3>
              {pending.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-4">
                  <span>{person.displayUsername ?? person.username}</span>
                  <Button
                    size="sm"
                    disabled={acceptFriend.isPending}
                    onClick={() => acceptFriend.mutate({ friendId: person.id })}
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No friends yet.</p>
            ) : (
              friends.map((person) => (
                <div key={person.id} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <StatusDot online={onlineIds.has(person.id)} />
                    {person.displayUsername ?? person.username}
                    <span className="text-xs text-muted-foreground">
                      {onlineIds.has(person.id) ? 'Online' : 'Offline'}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={removeFriend.isPending}
                    onClick={() => removeFriend.mutate({ friendId: person.id })}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
