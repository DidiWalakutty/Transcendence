import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';

import { useTRPC } from '@/integrations/trpc/react';
import { authClient } from '@/lib/auth-client';
import * as m from '@/@generated/paraglide/messages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

export function TwoFactorSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(trpc.users.getMe.queryOptions());
  const enabled = user?.twoFactorEnabled ?? false;

  const [password, setPassword] = useState('');
  const [enrollment, setEnrollment] = useState<{ totpURI: string; backupCodes: string[] } | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState('');

  useEffect(() => {
    if (!enrollment) {
      setQrDataUrl(null);
      return;
    }
    void QRCode.toDataURL(enrollment.totpURI).then(setQrDataUrl);
  }, [enrollment]);

  const refreshUser = () =>
    queryClient.invalidateQueries({ queryKey: trpc.users.getMe.queryKey() });

  const enable = useMutation({
    mutationKey: ['auth', 'enableTwoFactor'],
    mutationFn: async () => {
      const { data, error } = await authClient.twoFactor.enable({ password });

      if (error) {
        throw new Error(error.message ?? m.two_factor_settings_enable_error());
      }

      return data;
    },
    onSuccess: (data) => {
      setEnrollment(data);
    },
  });

  const confirm = useMutation({
    mutationKey: ['auth', 'verifyTwoFactor'],
    mutationFn: async () => {
      const { data, error } = await authClient.twoFactor.verifyTotp({ code: confirmCode });

      if (error) {
        throw new Error(error.message ?? m.two_factor_settings_confirm_error());
      }

      return data;
    },
    onSuccess: () => {
      setEnrollment(null);
      setConfirmCode('');
      setPassword('');
      void refreshUser();
    },
  });

  const cancelSetup = useMutation({
    mutationKey: ['auth', 'cancelTwoFactor'],
    mutationFn: async () => {
      const { error } = await authClient.twoFactor.disable({ password });

      if (error) {
        throw new Error(error.message ?? m.two_factor_settings_cancel_error());
      }
    },
    onSuccess: () => {
      setEnrollment(null);
      setConfirmCode('');
      setPassword('');
      void refreshUser();
    },
  });

  const disable = useMutation({
    mutationKey: ['auth', 'disableTwoFactor'],
    mutationFn: async () => {
      const { error } = await authClient.twoFactor.disable({ password });

      if (error) {
        throw new Error(error.message ?? m.two_factor_settings_disable_error());
      }
    },
    onSuccess: () => {
      setPassword('');
      void refreshUser();
    },
  });

  const secret = enrollment ? new URL(enrollment.totpURI).searchParams.get('secret') : null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{m.two_factor_settings_title()}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {enrollment ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {m.two_factor_settings_setup_instructions()}
            </p>

            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Two-factor setup QR code" className="h-48 w-48" />
            ) : null}

            {secret ? (
              <p className="text-xs text-muted-foreground">
                {m.two_factor_settings_manual_entry()} <code>{secret}</code>
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label>{m.two_factor_settings_backup_codes_label()}</Label>
              <div className="grid grid-cols-2 gap-1 rounded-md border p-3 font-mono text-sm">
                {enrollment.backupCodes.map((code) => (
                  <span key={code}>{code}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <InputOTP maxLength={6} value={confirmCode} onChange={setConfirmCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {confirm.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{confirm.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex gap-2">
                <Button
                  onClick={() => confirm.mutate()}
                  disabled={confirmCode.length !== 6 || confirm.isPending}
                >
                  {m.two_factor_settings_confirm_button()}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cancelSetup.mutate()}
                  disabled={cancelSetup.isPending}
                >
                  {m.two_factor_settings_cancel_button()}
                </Button>
              </div>
            </div>
          </div>
        ) : enabled ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {m.two_factor_settings_enabled_description()}
            </p>
            <div className="grid gap-2">
              <Label htmlFor="2fa-password-disable">{m.two_factor_settings_password_label()}</Label>
              <Input
                id="2fa-password-disable"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {disable.error ? (
              <Alert variant="destructive">
                <AlertDescription>{disable.error.message}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              variant="outline"
              onClick={() => disable.mutate()}
              disabled={!password || disable.isPending}
            >
              {m.two_factor_settings_disable_button()}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {m.two_factor_settings_disabled_description()}
            </p>
            <div className="grid gap-2">
              <Label htmlFor="2fa-password-enable">{m.two_factor_settings_password_label()}</Label>
              <Input
                id="2fa-password-enable"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {enable.error ? (
              <Alert variant="destructive">
                <AlertDescription>{enable.error.message}</AlertDescription>
              </Alert>
            ) : null}
            <Button onClick={() => enable.mutate()} disabled={!password || enable.isPending}>
              {m.two_factor_settings_enable_button()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
