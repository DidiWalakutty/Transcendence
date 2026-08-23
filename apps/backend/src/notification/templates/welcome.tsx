import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from 'react-email';
import { EVENTRA_THEME } from './theme.tokens';

export interface WelcomeEmailDictionary {
  previewText: string;
  greeting: string;
  description: string;
  buttonLabel: string;
  footerNotice: string;
}

interface WelcomeEmailProps {
  userName: string;
  dictionary: WelcomeEmailDictionary;
}

export const WelcomeEmail = ({ userName, dictionary }: WelcomeEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>{dictionary.previewText}</Preview>
      <Body
        style={{
          backgroundColor: EVENTRA_THEME.colors.surfacePage,
          fontFamily: EVENTRA_THEME.fonts.sans,
          padding: '40px 10px',
        }}
      >
        <Container
          style={{
            backgroundColor: EVENTRA_THEME.colors.surfaceCard,
            border: `1px solid ${EVENTRA_THEME.colors.borderSubtle}`,
            borderRadius: EVENTRA_THEME.radius.lg,
            padding: '40px 32px',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          {/* Logo Header */}
          <Section style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
            <Heading
              style={{
                color: EVENTRA_THEME.colors.textPrimary,
                fontSize: '28px',
                fontWeight: '800',
                margin: '0',
              }}
            >
              Eventra<span style={{ color: EVENTRA_THEME.colors.brandPrimary }}>.</span>
            </Heading>
          </Section>

          {/* Greeting */}
          <Heading
            style={{
              color: EVENTRA_THEME.colors.textPrimary,
              fontSize: '22px',
              fontWeight: '700',
              textAlign: 'center',
              margin: '10px 0',
            }}
          >
            {dictionary.greeting.replace('{userName}', userName)}
          </Heading>

          <Hr
            style={{
              borderColor: EVENTRA_THEME.colors.borderSubtle,
              borderWidth: '1px',
              margin: '24px 0',
            }}
          />

          {/* Body Text */}
          <Text
            style={{
              color: EVENTRA_THEME.colors.textSecondary,
              fontSize: '16px',
              lineHeight: '26px',
              margin: '0',
            }}
          >
            {dictionary.description}
          </Text>

          {/* Call to Action Button */}
          <Section style={{ textAlign: 'center' as const, margin: '32px 0 16px' }}>
            <Button
              href="http://localhost:5173"
              style={{
                backgroundColor: EVENTRA_THEME.colors.brandPrimary,
                color: EVENTRA_THEME.colors.textOnBrand,
                borderRadius: EVENTRA_THEME.radius.lg,
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                padding: '14px 28px',
              }}
            >
              {dictionary.buttonLabel}
            </Button>
          </Section>

          <Hr
            style={{
              borderColor: EVENTRA_THEME.colors.borderSubtle,
              borderWidth: '1px',
              margin: '24px 0',
            }}
          />

          {/* Footer */}
          <Text
            style={{
              color: EVENTRA_THEME.colors.textMuted,
              fontSize: '13px',
              lineHeight: '20px',
              textAlign: 'center',
              margin: '0',
            }}
          >
            {dictionary.footerNotice}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
