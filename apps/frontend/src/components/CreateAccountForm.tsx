import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create an account</CardTitle>

          <CardDescription>Sign up to discover and manage your events</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>

                <Input id="name" type="text" placeholder="Your Name" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input id="email" type="email" placeholder="your.email@example.com" required />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <Input id="password" type="password" placeholder="********" required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>

                  <Input id="confirm-password" type="password" placeholder="********" required />
                </Field>
              </div>

              <FieldDescription className="text-center">
                Password must be at least 8 characters.
              </FieldDescription>

              <Field>
                {/*
										Future:
										Add OAuth providers here for social sign up (e.g., Google etc.)

										Requires:
										- OAuth integration
										- Backend callback routes
										- Token verification
										- Account linking
									*/}
                <div className="flex flex-col items-center gap-4">
                  <Button className="px-10" type="submit">
                    Create Account
                  </Button>

                  <FieldDescription className="text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="underline underline-offset-4">
                      Sign in
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By signing up, you agree to our{' '}
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
