import { EVENTRA_THEME } from './theme.tokens';
import { EventCancellationEmailDictionary } from './event-cancellation.i18n';

interface EventCancellationEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress: string;
  lang: 'en' | 'nl' | 'es' | 'ru' | 'ro';
  dictionary: EventCancellationEmailDictionary;
}

export const EventCancellationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  lang,
  dictionary,
}: EventCancellationEmailProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${dictionary.previewText}</title>
      </head>
      <body style="background-color: ${EVENTRA_THEME.colors.surfacePage}; font-family: ${EVENTRA_THEME.fonts.sans}; padding: 40px 10px; margin: 0;">
        <div style="background-color: ${EVENTRA_THEME.colors.surfaceCard}; border: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; border-radius: ${EVENTRA_THEME.radius.lg}; padding: 40px 32px; max-width: 560px; margin: 0 auto; box-shadow: 0 4px 12px rgba(25, 11, 2, 0.03);">

          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
              Eventra<span style="color: ${EVENTRA_THEME.colors.brandPrimary};">.</span>
            </h1>
          </div>

          <!-- Greeting Heading -->
          <h2 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 22px; font-weight: 700; text-align: center; margin: 10px 0;">
            ${dictionary.greeting.replace('{userName}', userName)}
          </h2>

          <hr style="border: 0; border-top: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; margin: 24px 0;" />

          <!-- Core Cancellation Notice Narrative -->
          <p style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 16px; line-height: 26px; margin: 0 0 24px;">
            ${dictionary.description}
          </p>

          <!-- ⚠️ Cancelled Summary Card Container -->
          <div style="background-color: ${EVENTRA_THEME.colors.surfaceSubtle}; border: 1px dashed ${EVENTRA_THEME.colors.borderDefault}; border-radius: ${EVENTRA_THEME.radius.md}; padding: 20px 24px; margin-bottom: 24px;">
            <h3 style="color: ${EVENTRA_THEME.colors.brandPrimary}; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px;">
              ${dictionary.detailsHeader}
            </h3>
            
            <div style="margin-bottom: 12px;">
              <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${dictionary.labelEvent}</span>
              <del style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 16px; font-weight: 700; text-decoration: line-through;">${eventTitle}</del>
            </div>

            <div style="margin-bottom: 12px;">
              <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${dictionary.labelDateTime}</span>
              <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 15px; font-weight: 600;">${eventDate} · ${eventTime}</span>
            </div>

            <div>
              <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${dictionary.labelLocation}</span>
              <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 15px; font-weight: 600;">${eventLocation}</span>
              <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 13px; font-weight: 500; display: block; margin-top: 2px;">${eventAddress}</span>
            </div>
          </div>

          <!-- Call to Action Link -->
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="http://localhost:3000/${lang}/events" style="background-color: ${EVENTRA_THEME.colors.textPrimary}; color: ${EVENTRA_THEME.colors.textOnBrand}; border-radius: ${EVENTRA_THEME.radius.lg}; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 28px; box-shadow: 0 2px 4px rgba(25, 11, 2, 0.15);">
              ${dictionary.buttonLabel}
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; margin: 24px 0;" />

          <!-- Automated Footer Footnote -->
          <p style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 13px; line-height: 20px; text-align: center; margin: 0;">
            ${dictionary.footerNotice}
          </p>

        </div>
      </body>
    </html>
  `.trim();
};
