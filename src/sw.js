/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    workbox.precaching.precacheAndRoute([]);

    workbox.routing.registerRoute(
        /(.*)articles(.*)\.(?:png|gif|jpg)/,
        workbox.strategies.cacheFirst({
            cacheName: 'images-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                })
            ]
        })
    );

    workbox.routing.registerRoute(
        /(.*)images\/icon\/(.*)/,
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'icon-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 5
                })
            ]
        })
    );

    const articleHandler = workbox.strategies.networkFirst({
        cacheName: 'articles-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50
            })
        ]
    });

    workbox.routing.registerRoute(/(.*)article(.*)\.html/, args => {
        return articleHandler.handle(args)
            .then(response => {
                if (!response) {
                    return caches.match('pages/offline.html');
                } else if (response.status === 404) {
                    return caches.match('pages/404.html');
                }
                return response;
            });
    });



    const postsHandler = workbox.strategies.cacheFirst({
        cacheName: 'posts-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 50
            })
        ]
    });

    workbox.routing.registerRoute(/(.*)pages\/post(.*)\.html/, args => {
        return postsHandler.handle(args)
            .then(response => {
                if (response && response.status === 404) {
                    return caches.match('pages/404.html');
                }
                return response;
            })
            .catch(function () {
                return caches.match('pages/offline.html');
            });
    });

    const queue = new workbox.backgroundSync.Queue('myQueueName');

    self.addEventListener('fetch', (event) => {
        if (event.request.method === 'POST' && event.request.url.includes('dbcoderain')) {
            // Clone the request to ensure it's save to read when
            // adding to the Queue.
            const promiseChain = fetch(event.request.clone())
                .then((response) => {
                    debugger;
                    return response;
                })
                .catch((err) => {
                    return queue.addRequest(event.request);
                });

            event.waitUntil(promiseChain);
        }
    });

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
