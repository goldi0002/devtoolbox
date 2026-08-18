export const WEB_INFO = {
    SITE_NAME: import.meta.env.VITE_SITE_NAME ?? 'Toolbox4Devs',
    BASE_URL: import.meta.env.VITE_BASE_URL ?? 'https://toolbox4devs.com',
    DEFAULT_DESCRIPTION:
        'A free collection of browser-based developer utilities. ' +
        'JSON formatter, UUID generator, JWT decoder, Base64 encoder and more.',
    LOGO: `${import.meta.env.VITE_BASE_URL ?? 'https://toolbox4devs.com'}/images/icon-96.png`,
    PRIVACY_POLICY_LAST_UPDATED: '2026-03-12', //yyyy-mm-dd
    CONTACT_QUESTIONS_EMAIL: import.meta.env.VITE_CONCAT_QUESTIONS_EMAIL,
    WEB_OWNER_GITHUB_PROFILE: import.meta.env.VITE_WEB_OWNER_GIT_PROFILE_URL,
    WEB_OWNER_EMAIL: import.meta.env.VITE_WEB_OWNER_EMAIL_ADDRESS
}
export const WEB_DEVELOPER_INFO = {
    NAME: 'Gaurav Thakur',
    ROLE: 'Builder & maintainer of ToolBox4Devs',
    BIO: 'Full-stack developer who got tired of bloated, ad-ridden dev tools. Built ToolBox4Devs to have one clean, fast, private place for everyday utilities.',
    GITHUB: WEB_INFO.WEB_OWNER_GITHUB_PROFILE,
    EMAIL: 'mailto:' + WEB_INFO.WEB_OWNER_EMAIL,
    TWITTER: ''
}


export const WEB_PRINCIPLES = [
    {
        num: '01',
        label: 'No backend',
        desc: 'Every tool runs entirely in your browser. Your data never touches a server.',
    },
    {
        num: '02',
        label: 'No tracking',
        desc: 'Zero cookies, zero fingerprinting, zero data collection. We never see what you paste, type, or generate — it never leaves your browser.',
    },
    {
        num: '03',
        label: 'No ads',
        desc: 'Clean, distraction-free interface focused entirely on the work.',
    },
    {
        num: '04',
        label: 'No paywall',
        desc: 'Every tool is free. No account required, no trial, no upsell.',
    },
]