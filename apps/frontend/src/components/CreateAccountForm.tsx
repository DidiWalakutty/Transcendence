import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const locale = getLocale();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.create_account_title()}</CardTitle>

          <CardDescription>{m.create_account_subtitle()}</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <FieldGroup>
              {/* Full name */}
              <Field>
                <FieldLabel htmlFor="name">{m.create_account_full_name()}</FieldLabel>

                <Input id="name" type="text" placeholder={m.placeholder_name()} required />
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">{m.create_account_email()}</FieldLabel>

                <Input id="email" type="email" placeholder={m.placeholder_email()} required />
              </Field>

              {/* Passwords */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password">{m.create_account_password()}</FieldLabel>

                  <Input
                    id="password"
                    type="password"
                    placeholder={m.placeholder_password()}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    {m.create_account_confirm_password()}
                  </FieldLabel>

                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={m.placeholder_password()}
                    required
                  />
                </Field>
              </div>

              <FieldDescription className="text-center">
                {m.create_account_password_info()}
              </FieldDescription>

              <Field>
                {/*
							Future:
							Add OAuth providers here.

							Requires:
							- OAuth integration
							- Backend callback routes
							- Token verification
							- Account linking
							*/}
                <div className="flex flex-col items-center gap-4">
                  <Button className="px-10" type="submit">
                    {m.button_create_account()}
                  </Button>

                  <FieldDescription className="text-center">
                    {m.create_account_already_have_account()}{' '}
                    <Link
                      to="/$locale/login"
                      params={{ locale }}
                      className="underline underline-offset-4"
                    >
                      {m.create_account_sign_in()}
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Terms and privacy */}
      <FieldDescription className="px-6 text-center">
        {m.create_account_info()}{' '}
        <Link
          to="/$locale/terms-of-service"
          params={{ locale }}
          className="underline underline-offset-4"
        >
          {m.create_account_terms()}
        </Link>{' '}
        {m.create_account_and()}{' '}
        <Link
          to="/$locale/privacy-policy"
          params={{ locale }}
          className="underline underline-offset-4"
        >
          {m.create_account_privacy()}
        </Link>
      </FieldDescription>
    </div>
  );
}
