// measure-tools.js
export default class MeasureTools {
    constructor(map) {
        this.map = map;
        this.isActive = false;
        this.currentMode = null;
        this.measure = null;
        this.measureLayers = []; // Para rastrear camadas de medição ativas
        this.popup = null; // Referência para o popup
        this.labels = []; // Para armazenar os labels de medição
        this.vertexMarkers = []; // Para armazenar os marcadores de vértices
        this.popupVisible = false; // Estado do popup
        this.activeButton = null; // Referência ao botão ativo
        
        this.createPopup();
    }

    createPopup() {
        // Criar o elemento do popup
        this.popupElement = document.createElement('div');
        this.popupElement.className = 'measure-popup';
        this.popupElement.innerHTML = `
            <div class="measure-popup-header">Ferramentas de Medição</div>
            <div class="measure-popup-content">
                <button class="measure-btn" data-mode="distance">
                    <i class="fas fa-ruler"></i> Medir Distância
                </button>
                <button class="measure-btn" data-mode="area">
                    <i class="fas fa-ruler-combined"></i> Medir Área
                </button>
                <button class="measure-btn" data-mode="clear">
                    <i class="fas fa-trash"></i> Limpar Medições
                </button>
            </div>
        `;
        
        // Adicionar ao corpo do documento, mas inicialmente oculto
        document.body.appendChild(this.popupElement);
        this.popupElement.style.display = 'none';
        
        // Adicionar event listeners aos botões
        this.popupElement.querySelector('[data-mode="distance"]').addEventListener('click', () => {
            this.toggleMeasure('distance');
            this.hidePopup();
        });
        
        this.popupElement.querySelector('[data-mode="area"]').addEventListener('click', () => {
            this.toggleMeasure('area');
            this.hidePopup();
        });
        
        this.popupElement.querySelector('[data-mode="clear"]').addEventListener('click', () => {
            this.clearMeasurements();
            this.hidePopup();
        });
        
        // Fechar o popup ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (this.popupElement.style.display === 'block' && 
                !this.popupElement.contains(e.target) && 
                !e.target.closest('.sidebar-button[data-tool="measure"]')) {
                this.hidePopup();
            }
        });
    }

    togglePopup(buttonElement) {
        if (this.popupVisible) {
            this.hidePopup();
        } else {
            this.activeButton = buttonElement; // Armazena referência ao botão
            this.showPopup(buttonElement);
        }
        return this.popupVisible; // Retorna o estado atual, não inverte
    }

    showPopup(buttonElement) {
        // Posicionar o popup próximo ao botão
        const buttonRect = buttonElement.getBoundingClientRect();
        
        // Verificar se o popup ficaria fora da tela à direita
        const windowWidth = window.innerWidth;
        const popupWidth = this.popupElement.offsetWidth || 220; // Largura estimada se não estiver visível
        
        let leftPos = buttonRect.right + 10;
        if (leftPos + popupWidth > windowWidth) {
            leftPos = buttonRect.left - popupWidth - 10;
        }
        
        this.popupElement.style.left = `${leftPos}px`;
        this.popupElement.style.top = `${buttonRect.top}px`;
        this.popupElement.style.display = 'block';
        this.popupVisible = true;
        
        console.log('Popup de medição mostrado:', {
            left: leftPos,
            top: buttonRect.top,
            buttonRect: buttonRect,
            popupElement: this.popupElement
        });
    }

    hidePopup() {
        console.log('Escondendo popup de medição');
        this.popupElement.style.display = 'none';
        this.popupVisible = false;
        
        // Se tiver um botão ativo, desative-o
        if (this.activeButton) {
            console.log('Desativando botão:', this.activeButton);
            if (typeof this.activeButton.classList !== 'undefined') {
                this.activeButton.classList.remove('active');
            } else if (this.activeButton.toggleActive && typeof this.activeButton.toggleActive === 'function') {
                this.activeButton.toggleActive(false);
            }
        }
        this.activeButton = null;
    }

    toggleMeasure(mode) {
        // Se for para limpar, apenas chama o método e retorna
        if (mode === 'clear') {
            this.clearMeasurements();
            return;
        }
        
        // Se já estiver ativo com o mesmo modo, desativa
        if (this.isActive && this.currentMode === mode) {
            this.deactivate();
            return;
        }

        // Se estiver ativo com modo diferente, desativa primeiro
        if (this.isActive) {
            this.deactivate();
        }

        // Ativa o novo modo
        this.activate(mode);
    }

    activate(mode) {
        this.currentMode = mode;
        this.isActive = true;

        // Configura o estilo das medições
        const lineStyle = {
            color: '#4285F4', // Cor primária do Google
            weight: 3,
            opacity: 0.8
        };
        
        const polygonStyle = {
            color: '#4285F4',
            weight: 3,
            opacity: 0.8,
            fillColor: '#4285F4',
            fillOpacity: 0.2
        };

        // Inicializa o plugin de medição do Leaflet
        if (mode === 'distance') {
            this.measure = new L.Draw.Polyline(this.map, {
                shapeOptions: lineStyle,
                showLength: true,
                metric: true,
                feet: false,
                nautic: false
            });
        } else if (mode === 'area') {
            this.measure = new L.Draw.Polygon(this.map, {
                shapeOptions: polygonStyle,
                showArea: true,
                metric: true,
                feet: false,
                nautic: false
            });
        }

        if (this.measure) {
            this.measure.enable();
            this.addMeasurementListeners();
        }
    }

    deactivate() {
        if (this.measure) {
            this.measure.disable();
            this.measure = null;
        }
        this.isActive = false;
        this.currentMode = null;
    }
    addMeasurementListeners() {
        // Remover listener anterior se existir
        this.map.off('draw:created', this.drawCreatedHandler);
    
        // Criar novo handler e armazenar referência
        this.drawCreatedHandler = (e) => {
            // Não adicionar a camada original ao mapa
            const originalLayer = e.layer;
            if (this.currentMode === 'distance') {
                // Para distância, criar uma nova polyline manualmente
                const points = originalLayer.getLatLngs();
    
                // Criar uma linha simples sem preenchimento
                const line = L.polyline(points, {
                    color: '#4285F4',
                    weight: 3,
                    opacity: 0.8,
                    fill: false,
                    fillOpacity: 0,
                    className: 'distance-line measure-line' // Adicione 'measure-line' aqui
                });
    
                line._measurement = true;
                this.measureLayers.push(line);
                this.map.addLayer(line);
    
                // Adicionar marcadores e labels
                this.addVertexMarkers(line);
                this.addDistanceLabels(line);
                
                // Adicionar a classe após a camada ser adicionada ao mapa
                if (line.getElement) {
                    setTimeout(() => {
                        const element = line.getElement();
                        if (element) {
                            element.classList.add('measure-line');
                        }
                    }, 100);
                }
            } else {
                // Para área, usar a camada original
                originalLayer._measurement = true;
                originalLayer.options.className = 'measure-area'; // Adicione a classe aqui
                this.measureLayers.push(originalLayer);
                this.map.addLayer(originalLayer);
    
                // Adicionar marcadores e labels
                this.addVertexMarkers(originalLayer);
                this.addAreaLabel(originalLayer);
                
                // Adicionar a classe após a camada ser adicionada ao mapa
                if (originalLayer.getElement) {
                    setTimeout(() => {
                        const element = originalLayer.getElement();
                        if (element) {
                            element.classList.add('measure-area');
                        }
                    }, 100);
                }
            }
        };
    
        // Adicionar o novo listener
        this.map.on('draw:created', this.drawCreatedHandler);
    }
    
    addVertexMarkers(layer) {
        const latlngs = this.currentMode === 'area' ? layer.getLatLngs()[0] : layer.getLatLngs();
        
        // Para cada ponto, adiciona um marcador
        latlngs.forEach(latlng => {
            const marker = L.circleMarker(latlng, {
                radius: 5,
                fillColor: '#4285F4',
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
                fillOpacity: 1
            }).addTo(this.map);
            
            this.vertexMarkers.push(marker);
        });
    }

    addDistanceLabels(layer) {
        const latlngs = layer.getLatLngs();
        let totalDistance = 0;
        
        // Para cada segmento da linha, adiciona um label
        for (let i = 1; i < latlngs.length; i++) {
            const segmentDistance = latlngs[i-1].distanceTo(latlngs[i]);
            totalDistance += segmentDistance;
            
            // Calcula o ponto médio do segmento para posicionar o label
            const midPoint = L.latLng(
                (latlngs[i-1].lat + latlngs[i].lat) / 2,
                (latlngs[i-1].lng + latlngs[i].lng) / 2
            );
            
            // Formata a distância
            const formattedDistance = this.formatDistance(segmentDistance);
            
            // Cria o label como um marcador com ícone personalizado
            const label = L.marker(midPoint, {
                icon: L.divIcon({
                    className: 'measure-label',
                    html: `<div class="measure-label-text">${formattedDistance}</div>`,
                    iconSize: [80, 20],
                    iconAnchor: [40, 10]
                }),
                interactive: false // Não interativo para não interferir com cliques
            }).addTo(this.map);
            
            this.labels.push(label);
        }
        
        // Adiciona um popup com a distância total no final da linha
        const lastPoint = latlngs[latlngs.length - 1];
        const totalLabel = L.marker(lastPoint, {
            icon: L.divIcon({
                className: 'measure-total-label',
                html: `<div class="measure-total-text">Total: ${this.formatDistance(totalDistance)}</div>`,
                iconSize: [120, 24],
                iconAnchor: [0, 24]
            }),
            interactive: false
        }).addTo(this.map);
        
        this.labels.push(totalLabel);
    }

    addAreaLabel(layer) {
        const latlngs = layer.getLatLngs()[0];
        const area = L.GeometryUtil.geodesicArea(latlngs);
        const formattedArea = this.formatArea(area);
        
        // Calcula o centroide do polígono
        let lat = 0, lng = 0;
        for (let i = 0; i < latlngs.length; i++) {
            lat += latlngs[i].lat;
            lng += latlngs[i].lng;
        }
        lat /= latlngs.length;
        lng /= latlngs.length;
        
        // Cria o label como um marcador com ícone personalizado
        const label = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'measure-label',
                html: `<div class="measure-label-text">${formattedArea}</div>`,
                iconSize: [100, 24],
                iconAnchor: [50, 12]
            }),
            interactive: false // Não interativo para não interferir com cliques
        }).addTo(this.map);
        
        this.labels.push(label);
    }

    formatDistance(distance) {
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(2)} km`;
        } else {
            return `${distance.toFixed(0)} m`;
        }
    }

    formatArea(area) {
        if (area >= 1000000) {
            return `${(area / 1000000).toFixed(2)} km²`;
        } else if (area >= 10000) {
            return `${(area / 10000).toFixed(2)} ha`;
        } else {
            return `${area.toFixed(0)} m²`;
        }
    }

    clearMeasurements() {
        // Remove todas as camadas de medição
        this.measureLayers.forEach(layer => {
            if (layer && this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
            }
        });
        this.measureLayers = [];
        
        // Remove todos os labels
        this.labels.forEach(label => {
            if (label && this.map.hasLayer(label)) {
                this.map.removeLayer(label);
            }
        });
        this.labels = [];
        
        // Remove todos os marcadores de vértices
        this.vertexMarkers.forEach(marker => {
            if (marker && this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }
        });
        this.vertexMarkers = [];
    }
}
