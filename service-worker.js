// service-worker.js

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Proactive Planner', body: 'You have a new notification.' };
  
  const options = {
    body: data.body,
    icon: '/vite.svg', // A default icon
    badge: '/vite.svg', // An icon for the notification tray
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
