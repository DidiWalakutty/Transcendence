import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@tanstack/react-router';

export function ForgotPassword({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Forgot your password?</CardTitle>

          <CardDescription className="mt-4 text-md">
            No worries! <br />
            Enter your email address to receive a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input id="email" type="email" placeholder="youremail@example.com" required />
              </Field>
              <Field>
                <div className="flex justify-center">
                  <Button className="w-fit px-8" type="submit">
                    Send Reset Link
                  </Button>
                </div>
              </Field>

              <FieldDescription className="text-center">
                Do remember your password?{' '}
                <Link to="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
