const CACHE_NAME = 'cosmic-toolbox-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/responsive.css',
  './css/animations.css',
  './js/app.js',
  './js/analyzer.js',
  './js/bmi.js',
  './js/calculator.js',
  './js/colorConverter.js',
  './js/currency.js',
  './js/dateCalc.js',
  './js/expense.js',
  './js/notes.js',
  './js/password.js',
  './js/pomodoro.js',
  './js/qrcode.js',
  './js/timer.js',
  './js/todo.js',
  './js/unitConverter.js',
  './js/worldClock.js',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
