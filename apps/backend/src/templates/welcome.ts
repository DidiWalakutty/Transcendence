import { EVENTRA_THEME } from './theme.tokens.js';
import { WelcomeEmailDictionary } from './welcome.i18n.js';

interface WelcomeEmailProps {
  userName: string;
  dictionary: WelcomeEmailDictionary;
}

/**
 * Eventra Multilingual Welcome Email Component
 */
export const WelcomeEmail = ({ userName, dictionary }: WelcomeEmailProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${dictionary.previewText}</title>
      </head>
      <body style="background-color: ${EVENTRA_THEME.colors.surfacePage}; font-family: ${EVENTRA_THEME.fonts.sans}; padding: 40px 10px; margin: 0;">
        <div style="background-color: ${EVENTRA_THEME.colors.surfaceCard}; border: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; border-radius: ${EVENTRA_THEME.radius.lg}; padding: 40px 32px; max-width: 560px; margin: 0 auto; box-shadow: 0 4px 12px rgba(25, 11, 2, 0.03);">
          
          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: ${EVENTRA_THEME.colors.textPrimary}; fontSize: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
              Eventra<span style="color: ${EVENTRA_THEME.colors.brandPrimary};">.</span>
            </h1>
          </div>

          <!-- Greeting Heading -->
          <h2 style="color: ${EVENTRA_THEME.colors.textPrimary}; font-size: 22px; font-weight: 700; text-align: center; margin: 10px 0;">
            ${dictionary.greeting.replace('{userName}', userName)}
          </h2>
          
          <hr style="border: 0; border-top: 1px solid ${EVENTRA_THEME.colors.borderSubtle}; margin: 24px 0;" />
          
          <!-- Core Narrative Text -->
          <p style="color: ${EVENTRA_THEME.colors.textSecondary}; font-size: 16px; line-height: 26px; margin: 0;">
            ${dictionary.description}
          </p>
          
          <!-- Call to Action Button Area -->
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="http://localhost:5173" style="background-color: ${EVENTRA_THEME.colors.brandPrimary}; color: ${EVENTRA_THEME.colors.textOnBrand}; border-radius: ${EVENTRA_THEME.radius.lg}; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 28px; box-shadow: 0 2px 4px rgba(241, 77, 7, 0.15);">
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
