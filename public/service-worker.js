'use strict';

self.addEventListener('push', event => {
  console.log('Received a push message', event);

  // サンプルでは固定のメッセージを通知するようにしています。
  // 動的にユーザーごとにメッセージを変えたい場合は、
  // ペイロードの暗号化を行うか、FetchAPIで動的に情報を取得する必要があります。
  const title = '新着記事のお知らせです';
  const body = 'ServiceWorkerの記事を公開しました';
  const icon = 'ics_logo_512x512.png';
  const tag = 'simple-push-demo-notification-tag';
  const url = 'https://ics.media/entry/11763';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      tag,
      data: {
        url
      }
    })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  let notoficationURL = '/';
  if (event.notification.data.url) {
    notoficationURL = event.notification.data.url;
  }

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(clientList => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(notoficationURL);
    }
  }));
});
