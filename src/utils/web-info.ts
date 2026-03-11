export const WEB_INFO = {
    SITE_NAME: import.meta.env.VITE_SITE_NAME ?? 'Toolbox4Devs',
    BASE_URL:  import.meta.env.VITE_BASE_URL ?? `https://${import.meta.env.VITE_VERCEL_URL ?? 'localhost'}`,
    DEFAULT_DESCRIPTION:
        'A free collection of browser-based developer utilities. ' +
        'JSON formatter, UUID generator, JWT decoder, Base64 encoder and more.',
    LOGO: `${import.meta.env.VITE_BASE_URL ?? ''}/images/icon-96.png`
}