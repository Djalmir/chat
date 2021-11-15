class Load extends HTMLElement {
	constructor(){
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
				background: #0000008d;
			}
		`

		const wrapper = shadow.appendChild(document.createElement('div'))
		wrapper.id = 'container'
	}
}