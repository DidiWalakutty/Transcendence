import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome</CardTitle>

          <CardDescription>Log in to manage your events</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <FieldGroup>
              {/*
								Future: 
								Add OAuth providers here, e.g. Google
								
								Requires:
								- OAuth provider setup
								- Backend callback routes
								- Token Verification
							*/}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input id="email" type="email" placeholder="youremail@example.com" required />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>

                <Input id="password" type="password" placeholder="********" required />
                <Link
                  to="/forgot-password"
                  className="text-right ml-auto text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </Field>

              <Field>
                <div className="flex flex-col items-center gap-4">
                  <Button className="px-15" type="submit">
                    Login
                  </Button>

                  <FieldDescription className="text-center">
                    Don't have an account?{' '}
                    <Link to="/create-account" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{' '}
        <Link to="/terms-of-service" className="underline underline-offset-4">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
      </FieldDescription>
    </div>
  );
}
