/**
 * Динамическое определение базового URL бэкенда в рантайме (в браузере).
 * Позволяет использовать один и тот же билд (npm run build) и локально в Docker, и в Amvera.
 */
export const getApiUrl = (): string => {
    const hostname = window.location.hostname;

    // Если в адресе сайта есть 'amvera', значит фронтенд запущен в облаке Amvera Cloud.
    if (hostname.includes('amvera')) {
        return 'https://techsoftback-denisdenisdenis.amvera.io';
    }

    // Во всех остальных случаях (localhost, 127.0.0.1, локальные IP-адреса контейнеров Docker)
    // используем локальный бэкенд разработчика.
    return 'http://localhost:8000';
};

export const API_URL = getApiUrl();