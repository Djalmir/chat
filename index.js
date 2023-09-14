var ws
var pingTimer
var activeChat = 'all'
var friends = []
var load = document.querySelector('#app-load')
var errorMsg = document.querySelector('#error-msgs')

function loginInputKeyPress(e) {
	if (e.key == 'Enter')
		connect()
}

function connect() {
	let name = document.querySelector('#nameInput').value.trim()
	if (name == '')
		errorMsg.show('Digite seu nome.')
	else {
		load.setLoading(true)
		// ws = new WebSocket('ws://192.168.100.100:3333/')
		ws = new WebSocket('wss://vps49327.publiccloud.com.br/api/')

		ws.addEventListener('open', () => {
			ws.name = name

			let sendingData = {
				type: 'command',
				command: 'set_name',
				params: name
			}


			ws.send(JSON.stringify(sendingData))
		})

		ws.addEventListener('message', ({data}) => {
			// console.log(data)
			data = JSON.parse(data)
			if (data.type == 'success') {
				if (data.success == 'login') {
					errorMsg.closeAll()
					document.querySelector('#login').style.display = 'none'
					document.querySelector('#chatContainer').style.display = 'flex'

					sendingData = {
						type: 'command',
						command: 'get-messages',
						from: activeChat
					}

					ws.send(JSON.stringify(sendingData))
					resetPingTimer()
					load.setLoading(false)
				}
			}
			else if (data.type == 'error') {
				load.setLoading(false)
				errorMsg.show(data.error)
			}
			else if (data.type == 'command')
				executeCode(data)
			else {
				// console.log('receiving data: ', data)
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
					// console.log('data: ', data)
					// console.log('name: ', ws.name, ' ', name)
					if ((data.from == activeChat && data.to == name) || (data.from == name) || (activeChat == 'all' && data.to == 'all') || (!data.from)) {
						let msg = document.createElement('div')
						let div = document.createElement('div')
						if (data.from) {
							msg.classList.add('friendsMsg')
							let sup = document.createElement('sup')
							sup.innerText = data.from
							div.appendChild(sup)
							if (data.to == name && !friends.find(friend => friend == data.from))
								friends.push(data.from)
						}
						else
							msg.classList.add('systemMsg')
						let b = document.createElement('b')
						b.innerText = data.message
						div.appendChild(b)
						msg.appendChild(div)
						chat.appendChild(msg)
					}
					else {
						let notifyLi
						if (data.to == 'all')
							notifyLi = Array.from(document.querySelectorAll('#onlineUsersList li')).find(li => li.innerText == 'Todos')
						else
							notifyLi = Array.from(document.querySelectorAll('#onlineUsersList li')).find(li => li.innerText == data.from)
						notifyLi.classList.add('newMessages')
						document.querySelector('#menuBt').classList.add('newMessages')
					}
				}
				chat.scrollTo({left: 0, top: chat.scrollHeight, behavior: 'smooth'})
				resetPingTimer()
			}
		})

		ws.addEventListener('error', (err) => {
			console.error('Ocorreu um erro: ', err)
		})

		ws.addEventListener('close', () => {
			console.error('Sua conexão foi finalizada.')
			errorMsg.show('Sua conexão foi finalizada.')
		})
	}
}

// function errorMsg.show(error) {
// 	document.querySelector('#errorMsg #errorMsgText').innerText = error
// 	document.querySelector('#errorMsg').style.top = '0'
// }

// function closeErrorMsg() {
// 	document.querySelector('#errorMsg #errorMsgText').innerText = ''
// 	document.querySelector('#errorMsg').style.top = '-100px'
// }

function sendMessage(e) {
	let input = document.querySelector('#messageInput')
	let sendingData = {
		type: 'message',
		message: input.value.trim(),
		to: activeChat
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
	if (activeChat != 'all' && !friends.find(friend => friend == activeChat))
		friends.push(activeChat)
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
			// list.innerHTML = `<li class='active' onclick="setActiveChat('all')">Todos</li>`
			// let users = data.params
			// users.map((user) => {
			// 	// console.log(user, ws)
			// 	if (user !== ws.name)
			// 		list.innerHTML += `<li onclick="setActiveChat('${ user }')">${ user }</li>`
			// })

			if (list.innerText.trim() == '')
				list.innerHTML = `<li class='active' onclick="setActiveChat('all')">Todos</li>`

			let activeUsers = data.params
			Array.from(list.children).map((li) => {
				if (li.innerText != 'Todos') {
					if (!activeUsers.includes(li.innerText) && !friends.includes(li.innerText)) {
						list.removeChild(li)
					}
				}
			})
			activeUsers.map((user) => {
				if (user != ws.name) {
					if (!Array.from(list.children).find(child => child.innerText == user)) {
						let li = document.createElement('li')
						li.onclick = () => {setActiveChat(user)}
						li.innerText = user
						list.appendChild(li)
					}
				}
			})
			break
		case ('pong'):
			// console.log('ping pong efetuado')
			resetPingTimer()
			break
	}
}

var showingMenu = false
function showMenu() {
	showingMenu = !showingMenu
	if (showingMenu) {
		shadow.style.transform = 'scale(1)'
		shadow.style.opacity = '1'
		document.querySelector('#menuBtContainer').style.width = '300px'
		document.querySelector('#menuSVG').style.stroke = '#7d7d7d'
		aside.style.left = '0'

		// document.addEventListener('transitionend', btToArrow)
		setTimeout(() => {
			let animationElements = Array.from(document.getElementsByClassName('showAnimation'))
			animationElements.map((element) => {
				element.beginElement()
			})
			document.getElementById('menuSVG').style.transform = "rotateZ(180deg)"
		}, 125)
	}
	else {
		shadow.style.opacity = '0'
		shadow.addEventListener('transitionend', removeShadow)
		document.querySelector('#menuBtContainer').style.width = '40px'
		document.querySelector('#menuSVG').style.stroke = '#bdbdbd'
		aside.style.left = '-310px'

		// document.addEventListener('transitionend', arrowToBt)
		let animationElements = Array.from(document.getElementsByClassName('hideAnimation'))
		animationElements.map((element) => {
			element.beginElement()
		})
		document.getElementById('menuSVG').style.transform = "rotateZ(0deg)"
	}
}

// function btToArrow() {
// 	document.removeEventListener('transitionend', btToArrow)
// 	let animationElements = Array.from(document.getElementsByClassName('showAnimation'))
// 	animationElements.map((element) => {
// 		element.beginElement()
// 	})
// 	document.getElementById('menuSVG').style.transform = "rotateZ(180deg)"
// }

// function arrowToBt() {
// 	document.removeEventListener('transitionend', arrowToBt)
// 	let animationElements = Array.from(document.getElementsByClassName('hideAnimation'))
// 	animationElements.map((element) => {
// 		element.beginElement()
// 	})
// 	document.getElementById('menuSVG').style.transform = "rotateZ(0deg)"
// }

function removeShadow() {
	shadow.removeEventListener('transitionend', removeShadow)
	shadow.style.transform = 'scale(0)'
}

function setActiveChat(user) {

	if (showingMenu)
		showMenu()

	titleSpan.innerText = user == 'all' ? 'Todos' : user
	activeChat = user
	document.querySelector('li.active').classList.remove('active')
	let activeLi
	if (user == 'all')
		activeLi = Array.from(document.querySelectorAll('#onlineUsersList li')).find(li => li.innerText == 'Todos')
	else
		activeLi = Array.from(document.querySelectorAll('#onlineUsersList li')).find(li => li.innerText == user)

	activeLi.classList.add('active')
	activeLi.classList.remove('newMessages')
	if (document.getElementsByClassName('newMessages').length == 1)
		document.querySelector('#menuBt').classList.remove('newMessages')

	let sendingData = {
		type: 'command',
		command: 'get-messages',
		from: activeChat
	}

	document.querySelector('#chat').innerHTML = ''
	ws.send(JSON.stringify(sendingData))
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

// errorMsg.show('teste um')
// errorMsg.show('mais um teste. Ops.. teste 2')
// errorMsg.show('Lorem ipsum dolor sit am.. Ou seria teste 3?')
// errorMsg.show('só mais um')