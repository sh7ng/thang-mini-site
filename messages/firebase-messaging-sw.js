importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');
importScripts('./firebase-config-sw.js');
firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{const title=payload.notification?.title||'Tin nhắn gia đình';const options={body:payload.notification?.body||'Bạn có tin nhắn mới',icon:'/messages/icon.svg',badge:'/messages/icon.svg',data:{url:'/messages/'}};self.registration.showNotification(title,options);});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if('focus'in client){client.navigate('/messages/');return client.focus();}}return clients.openWindow('/messages/');}));});

const CACHE='family-messages-v1';self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/messages/','/messages/index.html','/messages/style.css','/messages/app.js','/messages/firebase-config.js','/messages/manifest.webmanifest','/messages/icon.svg']))));self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('/messages/index.html'))));});
