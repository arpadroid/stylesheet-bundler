class Button {
    constructor(config = {}) {
        this.setConfig(config);
    }

    setConfig(config = {}) {
        this._config = Object.assign(this.getDefaultConfig(), config);
    }

    getDefaultConfig() {
        return {
            type: 'button',
            text: ''
        };
    }

    render() {
        const button = document.createElement('button');
        button.textContent = 'Click me';
        button.addEventListener('click', event => this.onClick(event));
        this.button = button;
        return button;
    }

    onClick(event) {
        const { onClick } = this._config;
        if (typeof onClick === 'function') {
            onClick(event);
        }
        console.log('Button clicked', event);
    }
}

export default Button;
