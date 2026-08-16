import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [saved, setSaved] = useState(false);

  const userQuery = useQuery(trpc.users.getMe.queryOptions());
  const user = userQuery.data;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');

  // Sync form state when user loads
  useState(() => {
    if (user) {
      setName(user.name ?? '');
      setUsername(user.username ?? '');
      setAboutMe(user.aboutMe ?? '');
      setLocation(user.location ?? '');
      setLanguage(user.preferedLanguage ?? '');
    }
  });

  const updateUser = useMutation(
    trpc.users.updateUser.mutationOptions({
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(trpc.users.getMe.queryKey(), updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    }),
  );

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
            <Link to="/$locale/my-events" params={{ locale: 'en' }}>
              <Button variant="outline">My Events</Button>
            </Link>
            <Button variant="outline" disabled>
              My Registered Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
