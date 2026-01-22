import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

function refreshCsrfToken() {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    } else {
        console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
    }
}

refreshCsrfToken();
setInterval(refreshCsrfToken, 5 * 60 * 1000);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        refreshCsrfToken();
    }
});
