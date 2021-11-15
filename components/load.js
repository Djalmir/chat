class Load extends HTMLElement {
	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})

		const style = shadow.appendChild(document.createElement('style'))
		style.textContent = `
			#container {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: none;
				align-items: center;
				justify-content: center;
				z-index: 10;
			}

			#shadow {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100vh;
				background: #000000cd;
			}

			#loading{
				width:48px;
				z-index:1;
				transform-origin: center center;
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			@keyframes fadeOut {
				from {
					opacity: 1;
				}
				to {
					opacity: 0
				}
			}
		`

		const wrapper = shadow.appendChild(document.createElement('div'))
		wrapper.id = 'container'

		const shadowDiv = wrapper.appendChild(document.createElement('div'))
		shadowDiv.id = 'shadow'

		const loading = wrapper.appendChild(document.createElement('img'))
		loading.id = 'loading'
		loading.src = 'https://djalmir.github.io/chat/images/loading.svg'

		this.setLoading = (isLoading) => {
			if (isLoading) {
				wrapper.style.display = 'flex'
				wrapper.style.animation = 'fadeIn .2s linear 1'
			}
			else {
				wrapper.style.animation = 'fadeOut .2s linear 1 forwards'
				wrapper.addEventListener('animationend', hideLoading)
			}
		}

		const hideLoading = () => {
			wrapper.removeEventListener('animationend', hideLoading)
			wrapper.style.display = 'none'
		}
	}
	
}

customElements.define('app-load', Load)
