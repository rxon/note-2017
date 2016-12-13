'use strict';

// GoogleCouldMessagingで取得したAPIキーを設定
const API_KEY = 'AIzaSyB54VIwaAtaK97BaKrRMylFM2BCUk46Urg';

// GCMのエンドポイントのBaseURL
const GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

const pushLink = document.querySelector('#pushEnableLink');

/**
 * 初期化処理を行います。
 */
function initialize() {
  // プッシュ通知に対応しているかの判定
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.log('Notifications aren\'t supported.');
    showUnsupported();
    return;
  }
  // プッシュ通知が拒否設定になっていないかを確認
  if (Notification.permission === 'denied') {
    console.log('The user has blocked notifications.');
    showUnsupported();
    return;
  }
  // プッシュ通知に対応しているかの判定
  if (!('PushManager' in window)) {
    console.log('Push messaging isn\'t supported.');
    showUnsupported();
    return;
  }

  navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
    // 登録されているsubscriptionを取得します。
    serviceWorkerRegistration.pushManager.getSubscription()
        .then(subscription => {
          pushLink.disabled = false;

          if (!subscription) {
            return;
          }

          sendSubscriptionToServer(subscription);

          pushLink.checked = true;
        })
        .catch(err => {
          console.log('Error during getSubscription()', err);
        });
  });
}

/**
 * 登録されているsubscription通知を解除します。
 */
function unsubscribe() {
  pushLink.disabled = true;

  navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
    // 登録されているsubscriptionを取得します。
    serviceWorkerRegistration.pushManager.getSubscription().then(
      pushSubscription => {
        if (!pushSubscription) {
          pushLink.disabled = false;
          return;
        }

        pushSubscription.unsubscribe().then(() => {
          pushLink.disabled = false;
        }).catch(e => {
          console.log('Unsubscription error: ', e);
          pushLink.disabled = false;
        });
      }).catch(e => {
        console.log('Error thrown while unsubscribing from push messaging.', e);
      });
  });
}

/**
 * subscriptionを登録し結果を取得します。
 */
function subscribe() {
  pushLink.disabled = true;

  navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
      .then(subscription => {
        pushLink.disabled = false;

        return sendSubscriptionToServer(subscription);
      })
      .catch(err => {
        if (Notification.permission === 'denied') {
          console.log('Permission for Notifications was denied');
          pushLink.disabled = true;
        } else {
          console.log('Unable to subscribe to push.', err);
          pushLink.disabled = false;
        }
      });
  });
}

/**
 * 登録したsubscriptionをサーバーに送ります。
 */
function sendSubscriptionToServer(subscription) {
  const mergedEndpoint = endpointWorkaround(subscription);
  showCurlCommand(mergedEndpoint);
}

/**
 * 非サポートメッセージを表示します。
 */
function showUnsupported() {
  document.querySelector('#pushEnable').style.display = 'none';
}

/**
 * 引数に指定されてEndpointの情報を元にcURLコマンドを作成し表示します。
 */
function showCurlCommand(mergedEndpoint) {
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    console.log('This browser isn\'t currently supported for this demo');
    return;
  }

  const endpointSections = mergedEndpoint.split('/');
  const subscriptionId = endpointSections[endpointSections.length - 1];
  const curlCommand = 'curl --header "Authorization: key=' + API_KEY +
      '" --header Content-Type:"application/json" ' + GCM_ENDPOINT +
      ' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';

  console.log(curlCommand);
}

function endpointWorkaround(pushSubscription) {
  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
    return pushSubscription.endpoint;
  }

  let mergedEndpoint = pushSubscription.endpoint;
  if (pushSubscription.subscriptionId &&
      pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
    mergedEndpoint = pushSubscription.endpoint + '/' +
        pushSubscription.subscriptionId;
  }
  return mergedEndpoint;
}

window.addEventListener('load', () => {
  pushLink.addEventListener('click', () => {
    subscribe();
  });

  // ServiceWokerをサポートしているかチェック
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js')
    .then(initialize);
  } else {
    showUnsupported();
  }
});
