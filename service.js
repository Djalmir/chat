const urlB64ToUint8Array = (base64String) => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
	const rawData = atob(base64)
	const outputArray = new Uint8Array(rawData.length)
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}

const saveSubscription = async subscription => {
	const response = await fetch('https://razion-apis.herokuapp.com/service-worker/save-subscription', {
		// const response = await fetch('http://192.168.100.100:3333/service-worker/save-subscription', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	})
	return response.json()
}

self.addEventListener('activate', async () => {
	try {
		const applicationServerKey = urlB64ToUint8Array('BA-ngyQgPl7vBViMr2WnkQvRyGjqW6170b2c7LltmZf2RHoBAi07noIeZtG43sBCLjplS-DHsdyeTq6tzch9pnU')
		const options = {applicationServerKey, userVisibleOnly: true}
		const subscription = await self.registration.pushManager.subscribe(options)
		const response = await saveSubscription(subscription)
		console.log('saveSubscription response: ', response)
	}
	catch (err) {
		console.log('Error: ', err)
	}
})

self.addEventListener('push', function (event) {
	console.log(event.data)
	if (event.data) {
		console.log('Push event!!', event.data.text())
		showLocalNotification("Djalmir Miodutzki", event.data.text(), self.registration)
	}
	else {
		console.log('push event, but no data')
	}
})

const showLocalNotification = (title, body, swRegistration) => {
	const options = {
		body,
		vibrate: [300, 100, 300, 100, 200, 50, 100, 100, 500],
		icon: 'https://avatars.githubusercontent.com/u/54116932?v=4',
		image: 'https://media-exp1.licdn.com/dms/image/C5616AQGDXhHSWXJPAA/profile-displaybackgroundimage-shrink_200_800/0/1579622883491?e=1642032000&v=beta&t=yuQoyTImXzn2ov1AV4b_SVWtcl6jumjIAosvr9OB3g8',
		actions: [
			{
				action: 1,
				title: 'Abrir!',
				icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9D1Phwf51CzH7tr32-eEkRETMsKLgeqY5yQ&usqp=CAU'
			},
			{
				action: 0,
				title: 'Ignorar',
				icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9D1Phwf51CzH7tr32-eEkRETMsKLgeqY5yQ&usqp=CAU'
			}
		],
		requireInteraction: true
	}
	swRegistration.showNotification(title, options)
}

self.addEventListener('notificationclick', function (event) {

	console.log('On notification click: ', event)
	// event.notification.close();

	if (event.action > 0) {
		// This looks to see if the current is already open and
		// focuses if it is
		event.waitUntil(clients.matchAll({
			includeUncontrolled: true,
			type: "window"
		}).then(function (clientList) {
			for (var i = 0; i < clientList.length; i++) {
				var client = clientList[i]
				console.log(client.url)
				if (client.url.startsWith('https://djalmir.github.io/chat')) {
					// if (client.url.startsWith('http://192.168.100.100:8080')) {
					return client.focus()
				}
			}
			if (clients.openWindow)
				return clients.openWindow('https://djalmir.github.io/chat')
				// return clients.openWindow('http://192.168.100.100:8080')
		}))
	}
})