var ws
var pingTimer
function connect() {
	let name = document.querySelector('#nameInput').value.trim()
	if (name == '')
		alert('Digite seu nome.')
	else {
		ws = new WebSocket('wss://razion-apis.herokuapp.com/')
		// ws = new WebSocket('ws://192.168.100.100:3333/')

		ws.addEventListener('open', () => {

			let sendingData = {
				type: 'command',
				command: 'set_name',
				params: name
			}
			ws.send(JSON.stringify(sendingData))

			document.querySelector('#login').style.display = 'none'
			document.querySelector('#chatContainer').style.display = 'flex'

			resetPingTimer()
		})

		ws.addEventListener('message', ({data}) => {
			// console.log(data)
			data = JSON.parse(data)
			if (data.type == 'command')
				executeCode(data)
			else {
				let chat = document.querySelector('#chat')
				if (data.from == name) {
					let myMsg = document.createElement('div')
					myMsg.classList.add('myMsg')
					let div = document.createElement('div')
					div.innerText = data.message
					myMsg.appendChild(div)
					chat.appendChild(myMsg)
				}
				else {
					let msg = document.createElement('div')
					let div = document.createElement('div')
					if (data.from) {
						msg.classList.add('friendsMsg')
						let sup = document.createElement('sup')
						sup.innerText = data.from
						div.appendChild(sup)
					}
					else
						msg.classList.add('systemMsg')
					let b = document.createElement('b')
					b.innerText = data.message
					div.appendChild(b)
					msg.appendChild(div)
					chat.appendChild(msg)
				}
				chat.scrollTo({left: 0, top: chat.scrollHeight, behavior: 'smooth'})
				resetPingTimer()
			}
		})

		ws.addEventListener('error', (err) => {
			console.error('Ocorreu um erro: ', err)
		})

		ws.addEventListener('close', () => {
			console.log('Sua conexão foi finalizada.')
		})
	}
}

function sendMessage(e) {
	let input = document.querySelector('#messageInput')
	let sendingData = {
		type: 'message',
		message: input.value.trim(),
		to: 'all'
	}
	if (e) {
		if (e.key == 'Enter' && !shiftDown) {
			if (sendingData != '') {
				if (sendingData.message.trim() != '') {
					ws.send(JSON.stringify(sendingData))
					input.value = ''
				}
			}
		}
	}
	else {
		if (sendingData != '') {
			if (sendingData.message.trim() != '') {
				ws.send(JSON.stringify(sendingData))
				input.value = ''
			}
		}
	}
	resetPingTimer()
}

function resetPingTimer() {
	clearTimeout(pingTimer)
	pingTimer = setTimeout(() => {
		let sendingData = {
			type: 'command',
			command: 'ping'
		}
		ws.send(JSON.stringify(sendingData))
	}, 5000)
}

function executeCode(data) {
	switch (data.command) {
		case ('update_users_list'):
			let list = document.querySelector('#onlineUsersList')
			list.innerHTML = '<li>Todos</li>'
			let users = data.params
			users.map((user) => {
				list.innerHTML += `<li>${ user }</li>`
			})
			break
		case ('pong'):
			// console.log('ping pong efetuado')
			resetPingTimer()
			break
	}
}

let shiftDown = false
window.onkeydown = (e) => {
	if (e.key == 'Shift')
		shiftDown = true
}
window.onkeyup = (e) => {
	if (e.key == 'Shift')
		shiftDown = false
}
document.querySelector('#messageInput').addEventListener('keydown', sendMessage)

function checkNotificationsAvailability() {
	if (!('serviceWorker' in navigator)) {
		throw new Error('No Service Worker support!')
	}
	if (!('PushManager' in window)) {
		throw new Error('No Push API Support!')
	}
}

async function registerServiceWorker() {
	const swRegistration = await navigator.serviceWorker.register('service.js')
	return swRegistration
}

async function requestNotificationPermission() {
	const permission = await window.Notification.requestPermission()
	if (permission !== 'granted') {
		throw new Error('Permissão para notificações negada.')
	}
}

async function notificationMain() {
	checkNotificationsAvailability()
	const swRegistration = await registerServiceWorker()
	const permission = await requestNotificationPermission()
}

notificationMain()