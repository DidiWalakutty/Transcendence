import { EVENTRA_THEME } from './theme.tokens';

export function EmailShell({
  lang,
  title,
  greeting,
  description,
  children,
  footer,
}: {
  lang: string;
  title: string;
  greeting: string;
  description: string;
  children: string;
  footer: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="background-color: ${EVENTRA_THEME.colors.surfacePage}; font-family: ${EVENTRA_THEME.fonts.sans}; padding: 40px 10px; margin: 0;">
        <div style="background-color: ${EVENTRA_THEME.colors.surfaceCard}; border: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; border-radius: ${EVENTRA_THEME.radius.lg}; padding: 40px 32px; max-width: 560px; margin: 0 auto; box-shadow: 0 4px 12px rgba(25, 11, 2, 0.03);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
              Eventra<span style="color: ${EVENTRA_THEME.colors.brandPrimary};">.</span>
            </h1>
          </div>
          <h2 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 22px; font-weight: 700; text-align: center; margin: 10px 0;">
            ${greeting}
          </h2>
          <hr style="border: 0; border-top: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; margin: 24px 0;" />
          <p style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 16px; line-height: 26px; margin: 0 0 24px;">
            ${description}
          </p>
          ${children}
          <hr style="border: 0; border-top: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; margin: 24px 0;" />
          <p style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 13px; line-height: 20px; text-align: center; margin: 0;">
            ${footer}
          </p>
        </div>
      </body>
    </html>
  `.trim();
}

export function EventDetailsCard({
  detailsHeader,
  labelEvent,
  labelDateTime,
  labelLocation,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  highlightTitle = false,
  highlightDateTime = false,
  highlightLocation = false,
  highlightAddress = false,
}: {
  detailsHeader: string;
  labelEvent: string;
  labelDateTime: string;
  labelLocation: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress: string;
  highlightTitle?: boolean;
  highlightDateTime?: boolean;
  highlightLocation?: boolean;
  highlightAddress?: boolean;
}): string {
  const highlight = (on: boolean) =>
    on ? `color: #c2410c; background-color: #fff7ed; padding: 2px 6px; border-radius: 4px;` : '';
  return `
    <div style="background-color: ${EVENTRA_THEME.colors.surfaceSubtle}; border: 1px dashed ${EVENTRA_THEME.colors.borderDefault}; border-radius: ${EVENTRA_THEME.radius.md}; padding: 20px 24px; margin-bottom: 24px;">
      <h3 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px;">
        ${detailsHeader}
      </h3>
      <div style="margin-bottom: 12px;">
        <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${labelEvent}</span>
        <strong style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 16px; font-weight: 700; ${highlight(highlightTitle)}">${eventTitle}</strong>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${labelDateTime}</span>
        <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 15px; font-weight: 600; ${highlight(highlightDateTime)}">${eventDate} · ${eventTime}</span>
      </div>
      <div>
        <span style="color: ${EVENTRA_THEME.colors.textMuted}; font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">${labelLocation}</span>
        <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 15px; font-weight: 600; ${highlight(highlightLocation)}">${eventLocation}</span>
        <span style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 13px; font-weight: 500; display: block; margin-top: 2px; ${highlight(highlightAddress)}">${eventAddress}</span>
      </div>
    </div>
  `.trim();
}

export function EmailCta({ href, label }: { href: string; label: string }): string {
  return `
    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="${href}" style="background-color: ${EVENTRA_THEME.colors.brandPrimary}; color: ${EVENTRA_THEME.colors.textOnBrand}; border-radius: ${EVENTRA_THEME.radius.lg}; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 28px; box-shadow: 0 2px 4px rgba(241, 77, 7, 0.15);">
        ${label}
      </a>
    </div>
  `.trim();
}
