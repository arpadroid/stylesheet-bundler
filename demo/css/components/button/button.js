/* eslint-disable sonarjs/no-duplicate-string */
class ButtonComponent extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.button = this.renderButton();
        this.iconNode = this.renderIcon();
        this.buttonText = this.renderButtonText();
        this.button.append(this.buttonText, this.iconNode);
    }

    renderButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('button');
        button.addEventListener('click', event => this.onClick(event));
        return button;
    }

    renderButtonText() {
        const buttonText = document.createElement('span');
        buttonText.className = 'button-text';
        buttonText.textContent = this.getAttribute('label');
        return buttonText;
    }

    renderIcon() {
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = this.getAttribute('icon');
        return icon;
    }

    connectedCallback() {
        this.appendChild(this.button);
        this.update();
    }

    update() {
        this.iconNode.textContent = this.isLightTheme() ? '🌙' : '☀️';
        this.buttonText.textContent = this.isLightTheme() ? 'Go dark' : 'Go light';
    }
}

customElements.define('button-component', ButtonComponent);

export default ButtonComponent;
