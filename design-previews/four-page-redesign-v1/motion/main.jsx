// The approved preview now opens the corresponding production route.
const routes = { photography: '/photography.html', photo: '/photography.html', music: '/music.html', contact: '/contact.html', about: '/about.html' };
window.location.replace(routes[window.location.hash.slice(1)] || '/photography.html');
