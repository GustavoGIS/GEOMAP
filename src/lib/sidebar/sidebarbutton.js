// sidebar-button.js
export default class SidebarButton {
    constructor({ icon, text, onClick, tooltip }) {
        this.element = L.DomUtil.create('button', 'sidebar-button');
        this.element.innerHTML = `
            <i class="${icon}"></i>
            <span class="btn-text">${text || ''}</span>
            <span class="tooltip">${tooltip || ''}</span>
        `;
        
        this.element.addEventListener('click', onClick);
        this.tooltip = this.element.querySelector('.tooltip');
        this.isActive = false;
        this.setupHover();
    }

    setupHover() {
        this.element.addEventListener('mouseenter', () => {
            this.tooltip.style.opacity = '1';
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.tooltip.style.opacity = '0';
        });
    }

    toggleActive(forcedState) {
        if (typeof forcedState !== 'undefined') {
            // Se um estado for forçado, use-o
            if (forcedState) {
                this.element.classList.add('active');
            } else {
                this.element.classList.remove('active');
            }
        } else {
            // Comportamento de toggle normal
            this.element.classList.toggle('active');
        }
        
        return this.element.classList.contains('active'); // Retorna o estado atual
    }

    setActive(active) {
        this.isActive = active;
        this.element.classList.toggle('active', active);
    }
}
