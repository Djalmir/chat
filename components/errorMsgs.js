class ErrorMsgs extends HTMLElement {
	constructor() {
		super()

		const shadow = this.attachShadow({mode: 'open'})

		const style = shadow.appendChild(document.createElement('style'))
		style.textContent = `
			#errorMsgsContainer {
				position: fixed;
				top: 0;
				right: 0;
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 5px;
				padding: 5px;
				z-index: 6;
			}

			.errorMsg {
				box-sizing: border-box;
				background: #dd1212;
				display: flex;
				align-items: center;
				gap: 15px;
				padding: 10px 14px;
				box-sizing: border-box;
				transition: .2s;
				border-radius: .2rem;
				border-left: 1px solid #bdbdbd;
				border-top: 1px solid #bdbdbd;
				border-right: 1px solid #404040;
				border-bottom: 1px solid #404040;
			}
			
			.errorMsgText {
				flex: 1;
				font-weight: bolder;
				color: #ddd;
			}
			
			.closeErrorBtn {
				width: 32px;
				height: 32px;
				border-radius: 50%;
				background: radial-gradient(#0000008d, transparent 60%);
				color: #bdbdbd;
				cursor: pointer;
				display: flex;
				align-items: center;
				border-left: 1px solid #bdbdbd;
				border-top: 1px solid #bdbdbd;
				border-right: 1px solid #404040;
				border-bottom: 1px solid #404040;
				transition: .2s;
			}

			.closeErrorBtn:hover,
			.closeErrorBtn:focus {
				transform: scale(1.04);
			}

			.closeErrorBtn:active {
				transform scale(.98);
				border-left: 1px solid #404040;
				border-top: 1px solid #404040;
				border-right: 1px solid #bdbdbd;
				border-bottom: 1px solid #bdbdbd;
			}

			@keyframes show {
				from {
					transform: translateX(125%);
				}

				to {
					transform: translateX(0);
				}
			}

			@keyframes hide {
				from {
					transform: translateX(0);
				}

				to {
					transform: translateX(125%);
				}
			}
		`

		const wrapper = shadow.appendChild(document.createElement('div'))
		wrapper.id = 'errorMsgsContainer'

		this.show = (error) => {
			const existingMsg = Array.from(wrapper.children).find(msg => msg.firstChild.textContent == error)
			if (existingMsg)
				existingMsg.closeMsg()


			const errorMsg = wrapper.insertBefore(document.createElement('div'), wrapper.children[0])
			errorMsg.classList.add('errorMsg')

			const errorMsgText = errorMsg.appendChild(document.createElement('span'))
			errorMsgText.classList.add('errorMsgText')
			errorMsgText.textContent = error

			const closeErrorBtn = errorMsg.appendChild(document.createElement('button'))
			closeErrorBtn.classList.add('closeErrorBtn')
			closeErrorBtn.onclick = () => {errorMsg.closeMsg()}
			closeErrorBtn.innerHTML = `
				<svg viewBox="0 0 20 20">
					<line x1="5" y1="5" x2="15" y2="15" stroke="white" stroke-width="4" stroke-linecap="round" />
					<line x1="5" y1="15" x2="15" y2="5" stroke="white" stroke-width="4" stroke-linecap="round" />
				</svg>
			`

			errorMsg.style.animation = 'show .2s ease-out 1'

			errorMsg.closeMsg = () => {
				errorMsg.style.animation = 'hide .2s ease-in 1 forwards'
				wrapper.addEventListener('animationend', removeMsg)
			}

			const removeMsg = () => {
				wrapper.removeEventListener('animationend', removeMsg)
				wrapper.removeChild(errorMsg)
			}
		}

		this.closeAll = () => {
			Array.from(wrapper.children).map((errorMsg) => {
				errorMsg.closeMsg()
			})
		}
	}
}

customElements.define('error-msgs', ErrorMsgs)