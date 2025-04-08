// sidebar.js
import SidebarButton from './SidebarButton.js';

export default class Sidebar {
    constructor(map) {
        this.map = map;
        this.buttons = [];
        this.init();
    }

    init() {
        // Cria o container da sidebar estática
        this.container = document.createElement('div');
        this.container.className = 'sidebar';
        this.container.innerHTML = `
            <div class="sidebar-header">
                <span>Menu</span>
            </div>
            <div class="sidebar-content"></div>
        `;
        document.getElementById('map').parentNode.appendChild(this.container);

        // Posiciona ao lado do mapa
        this.updatePosition();
        this.map.on('moveend', () => this.updatePosition());
    }

    addButton(buttonConfig) {
        const button = new SidebarButton(buttonConfig);
        this.buttons.push(button);
        this.container.querySelector('.sidebar-content').appendChild(button.element);
        return button;
    }

    updatePosition() {
        const mapRect = this.map.getContainer().getBoundingClientRect();
        this.container.style.left = `${mapRect.left + 10}px`; // 10px de margem
        this.container.style.top = `${mapRect.top + mapRect.height / 2}px`;
        this.container.style.transform = 'translateY(-50%)';
    }
}
