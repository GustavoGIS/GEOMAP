// marker-tools.js
export default class MarkerTools {
    constructor(map, layerManager = null) {
        this.map = map;
        this.markers = [];
        this.isAddingMarker = false;
        this.selectedIcon = null;
        this.markerName = '';
        this.tempMarkerIcon = null;
        this.layerManager = layerManager; // Referência ao gerenciador de camadas
        
        // Criar os elementos de UI
        this.createIconSelectionPopup();
        this.createMarkerFormPopup();
        
        // Adicionar listener para cliques no mapa
        this.mapClickHandler = this.handleMapClick.bind(this);
    }
    
    // Iniciar o processo de adicionar marcador
    startAddMarker() {
        this.showIconSelectionPopup();
    }
          
       // Modifique o método createIconSelectionPopup para remover a prévia e cor personalizada
createIconSelectionPopup() {
    this.iconPopup = document.createElement('div');
    this.iconPopup.className = 'modal';
    this.iconPopup.innerHTML = `
        <div class="modal-content marker-icon-modal">
            <span class="close-modal">&times;</span>
            <h2>Adicionar Marcador</h2>
            <div class="form-group">
                <label for="marker-name">Nome do Marcador:</label>
                <input type="text" id="marker-name" placeholder="Digite um nome para o marcador">
            </div>
            
            <div class="form-group">
                <label>Escolha a cor do marcador:</label>
                <div class="color-picker-container">
                    <div class="color-options">
                        <div class="color-option selected" data-color="#E53935" style="background-color: #E53935;"></div>
                        <div class="color-option" data-color="#D81B60" style="background-color: #D81B60;"></div>
                        <div class="color-option" data-color="#8E24AA" style="background-color: #8E24AA;"></div>
                        <div class="color-option" data-color="#5E35B1" style="background-color: #5E35B1;"></div>
                        <div class="color-option" data-color="#3949AB" style="background-color: #3949AB;"></div>
                        <div class="color-option" data-color="#1E88E5" style="background-color: #1E88E5;"></div>
                        <div class="color-option" data-color="#039BE5" style="background-color: #039BE5;"></div>
                        <div class="color-option" data-color="#00ACC1" style="background-color: #00ACC1;"></div>
                        <div class="color-option" data-color="#00897B" style="background-color: #00897B;"></div>
                        <div class="color-option" data-color="#43A047" style="background-color: #43A047;"></div>
                        <div class="color-option" data-color="#7CB342" style="background-color: #7CB342;"></div>
                        <div class="color-option" data-color="#C0CA33" style="background-color: #C0CA33;"></div>
                        <div class="color-option" data-color="#FDD835" style="background-color: #FDD835;"></div>
                        <div class="color-option" data-color="#FFB300" style="background-color: #FFB300;"></div>
                        <div class="color-option" data-color="#FB8C00" style="background-color: #FB8C00;"></div>
                        <div class="color-option" data-color="#F4511E" style="background-color: #F4511E;"></div>
                        <div class="color-option" data-color="#6D4C41" style="background-color: #6D4C41;"></div>
                        <div class="color-option" data-color="#757575" style="background-color: #757575;"></div>
                        <div class="color-option" data-color="#546E7A" style="background-color: #546E7A;"></div>
                        <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Escolha um ícone:</label>
                <div class="icon-search">
                    <input type="text" id="icon-search" placeholder="Pesquisar ícones...">
                    <button id="search-icon-btn"><i class="fas fa-search"></i></button>
                </div>
                <div class="icon-grid-container">
                    <div class="icon-grid"></div>
                    <div id="loading-indicator" class="loading-icons">Carregando ícones...</div>
                </div>
            </div>
            <div class="form-actions">
    <button id="confirm-icon" class="modal-button confirm-button" disabled>
        <i class="fas fa-check"></i>
        <span class="button-text">Confirmar</span>
    </button>
    <button id="cancel-icon" class="modal-button cancel-button">
        <i class="fas fa-times"></i>
        <span class="button-text">Cancelar</span>
    </button>
</div>
        </div>
    `;
    
    document.body.appendChild(this.iconPopup);
    
    // Adicionar event listeners
    this.iconPopup.querySelector('.close-modal').addEventListener('click', () => this.hideIconSelectionPopup());
    this.iconPopup.querySelector('#cancel-icon').addEventListener('click', () => this.hideIconSelectionPopup());
    this.iconPopup.querySelector('#confirm-icon').addEventListener('click', () => this.confirmIconSelection());
    
    // Configurar a seleção de cores
    this.setupColorPicker();
    
    // Configurar a pesquisa de ícones
    this.setupIconSearch();
  }
  
  setupColorPicker() {
    this.selectedColor = '#E53935'; // Cor padrão (vermelho)
    
    // Event listeners para as opções de cores predefinidas
    const colorOptions = this.iconPopup.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remover seleção anterior
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Adicionar seleção ao item clicado
            option.classList.add('selected');
            
            // Atualizar a cor selecionada
            this.selectedColor = option.getAttribute('data-color');
        });
    });
    
    // Event listener para atualizar quando um ícone é selecionado
    this.iconPopup.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-item');
        if (iconItem) {
            const iconName = iconItem.getAttribute('data-icon');
            this.selectedIcon = iconName;
        }
    });
  }
  
        
        // Modifique o método loadIcons
        async loadIcons() {
            const iconGrid = this.iconPopup.querySelector('.icon-grid');
            const loadingIndicator = this.iconPopup.querySelector('#loading-indicator');
              
            // Mostrar indicador de carregamento
            loadingIndicator.style.display = 'block';
            iconGrid.innerHTML = '';
              
            try {
                // Carregar ícones do JSON
                const allIcons = await this.loadIconsList();
                  
                // Filtrar ícones com base na pesquisa
                const filteredIcons = this.searchTerm 
                    ? allIcons.filter(icon => icon.includes(this.searchTerm.toLowerCase()))
                    : allIcons;
                  
                // Ocultar indicador de carregamento
                loadingIndicator.style.display = 'none';
                  
                // Limpar a grade
                iconGrid.innerHTML = '';
                  
                if (filteredIcons.length === 0) {
                    // Mostrar mensagem se não houver resultados
                    const noResults = document.createElement('div');
                    noResults.className = 'no-results';
                    noResults.textContent = 'Nenhum ícone encontrado';
                    iconGrid.parentElement.appendChild(noResults);
                } else {
                    // Remover mensagem de "nenhum resultado" se existir
                    const existingNoResults = iconGrid.parentElement.querySelector('.no-results');
                    if (existingNoResults) {
                        existingNoResults.remove();
                    }
                      
                    // Adicionar ícones à grade
                    filteredIcons.forEach(icon => {
                        const iconItem = document.createElement('div');
                        iconItem.className = 'icon-item';
                        iconItem.setAttribute('data-icon', icon);
                        iconItem.innerHTML = `<span class="material-icons">${icon}</span>`;
                          
                        // Event listener para seleção de ícone
                        iconItem.addEventListener('click', () => {
                            // Remover seleção anterior
                            iconGrid.querySelectorAll('.icon-item').forEach(item => {
                                item.classList.remove('selected');
                            });
                              
                            // Adicionar seleção ao item clicado
                            iconItem.classList.add('selected');
                            this.selectedIcon = icon;
                              
                            // Habilitar botão de confirmar
                            this.iconPopup.querySelector('#confirm-icon').disabled = false;
                        });
                          
                        iconGrid.appendChild(iconItem);
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar ícones:', error);
                loadingIndicator.style.display = 'none';
                  
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Erro ao carregar ícones. Por favor, tente novamente.';
                iconGrid.parentElement.appendChild(errorMessage);
            }
        }
            // Adicione este método à classe MarkerTools
            async loadIconsList() {
                try {
                    const response = await fetch('./assets/material-icons-list.json');
                    
                    if (!response.ok) {
                        throw new Error(`Erro ao carregar lista de ícones: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Verificar se data.icons é um objeto (não um array)
                    if (data.icons && typeof data.icons === 'object' && !Array.isArray(data.icons)) {
                        // Extrair os nomes dos ícones (as chaves do objeto)
                        return Object.keys(data.icons);
                    } else if (data.icons && Array.isArray(data.icons)) {
                        // Se for um array, usar diretamente
                        return data.icons;
                    } else {
                        throw new Error('Formato de JSON não reconhecido');
                    }
                } catch (error) {
                    console.error('Erro ao carregar lista de ícones:', error);
                    return this.getFallbackIconsList();
                }
            }

            // Método de fallback com uma lista mínima de ícones
            getFallbackIconsList() {
                return [
                    'location_on', 'place', 'home', 'business', 'school', 'local_hospital',
                    'restaurant', 'local_cafe', 'shopping_cart', 'local_gas_station', 'directions_car',
                    'local_parking', 'terrain', 'park', 'beach_access'
                ];
            }
          // Modifique o método setupIconSearch
          setupIconSearch() {
              this.searchTerm = '';
              
              const searchInput = this.iconPopup.querySelector('#icon-search');
              const searchButton = this.iconPopup.querySelector('#search-icon-btn');
              
              // Event listener para pesquisa
              searchInput.addEventListener('input', (e) => {
                  this.searchTerm = e.target.value.trim();
                  this.loadIcons(); // Chama o método assíncrono
              });
              
              searchButton.addEventListener('click', () => {
                  this.searchTerm = searchInput.value.trim();
                  this.loadIcons(); // Chama o método assíncrono
              });
              
              // Carregar todos os ícones inicialmente
              this.loadIcons(); // Chama o método assíncrono
          }
          
    // Criar popup de formulário do marcador
    createMarkerFormPopup() {
        this.formPopup = document.createElement('div');
        this.formPopup.className = 'modal';
        this.formPopup.innerHTML = `
            <div class="modal-content marker-form-modal">
                <span class="close-modal">&times;</span>
                <h2>Informações do Marcador</h2>
                <form id="marker-form">
                    <div class="form-group">
                        <label for="municipio">Município:</label>
                        <input type="text" id="municipio" name="municipio" placeholder="Digite o município">
                    </div>
                    <div class="form-group">
                        <label for="endereco">Endereço:</label>
                        <input type="text" id="endereco" name="endereco" placeholder="Digite o endereço">
                    </div>
                    <div class="form-group">
                        <label for="observacoes">Observações:</label>
                        <textarea id="observacoes" name="observacoes" rows="3" placeholder="Digite suas observações"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="foto">Adicionar Foto:</label>
                        <input type="file" id="foto" name="foto" accept="image/jpeg, image/png">
                        <div id="foto-preview" class="foto-preview"></div>
                    </div>
                    <div class="form-actions">
    <button type="submit" class="modal-button confirm-button">
        <i class="fas fa-save"></i>
        <span class="button-text">Salvar</span>
    </button>
    <button type="button" id="cancel-form" class="modal-button cancel-button">
        <i class="fas fa-times"></i>
        <span class="button-text">Cancelar</span>
    </button>
</div>
                </form>
            </div>
        `;
        
        document.body.appendChild(this.formPopup);
        
        // Adicionar event listeners
        this.formPopup.querySelector('.close-modal').addEventListener('click', () => this.hideMarkerFormPopup());
        this.formPopup.querySelector('#cancel-form').addEventListener('click', () => this.hideMarkerFormPopup());
        
        // Preview da foto
        const fotoInput = this.formPopup.querySelector('#foto');
        const fotoPreview = this.formPopup.querySelector('#foto-preview');
        
        fotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Submissão do formulário
        this.formPopup.querySelector('#marker-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMarkerData();
        });
    }
    
    // Mostrar popup de seleção de ícone
    showIconSelectionPopup() {
        // Resetar seleções anteriores
        this.selectedIcon = null;
        this.markerName = '';
        this.iconPopup.querySelector('#marker-name').value = '';
        this.iconPopup.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
        this.iconPopup.querySelector('#confirm-icon').disabled = true;
        
        // Mostrar popup
        this.iconPopup.classList.add('active');
    }
    
    // Esconder popup de seleção de ícone
    hideIconSelectionPopup() {
        this.iconPopup.classList.remove('active');
    }
    
    // Confirmar seleção de ícone e iniciar adição de marcador
confirmIconSelection() {
        // Obter o nome do marcador do input
        this.markerName = this.iconPopup.querySelector('#marker-name').value.trim();
        
        if (!this.selectedIcon) {
            alert('Por favor, selecione um ícone para o marcador.');
            return;
        }
        
        if (!this.markerName) {
            alert('Por favor, digite um nome para o marcador.');
            return;
        }
        
        // Esconder popup
        this.hideIconSelectionPopup();
        
        // Criar ícone temporário para o cursor
        this.createTempMarkerIcon();
        
        // Ativar modo de adição de marcador
        this.isAddingMarker = true;
        
        // Mudar o cursor para o ícone selecionado
        document.body.style.cursor = 'crosshair';
        
        // Adicionar listener para clique no mapa
        this.map.on('click', this.mapClickHandler);
    
}

    
    // Criar ícone temporário para o cursor
    // Criar ícone temporário para o cursor
createTempMarkerIcon() {
    this.tempMarkerIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
            <div class="marker-icon-container" style="background-color: ${this.selectedColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <span class="material-icons marker-icon" style="font-size: 24px;">${this.selectedIcon}</span>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
}

updateMarkerColor(marker, newColor) {
    // Atualizar a cor nos dados do marcador
    marker.markerData.color = newColor;
    
    // Criar um novo ícone com a nova cor
    const newIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `
            <div class="marker-icon-container" style="background-color: ${newColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                <span class="material-icons marker-icon" style="font-size: 24px;">${marker.markerData.icon}</span>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
    
    // Atualizar o ícone do marcador
    marker.setIcon(newIcon);
}
    
   
   // Lidar com clique no mapa para adicionar marcador
   handleMapClick(e) {
    // Remover listener para evitar múltiplos cliques
    this.map.off('click', this.mapClickHandler);
    
    // Restaurar cursor
    document.body.style.cursor = '';
    
    // Criar marcador no local clicado
    const marker = L.marker(e.latlng, {
        icon: this.tempMarkerIcon
    }).addTo(this.map);
    
    // Armazenar dados iniciais do marcador
    marker.markerData = {
        name: this.markerName,
        icon: this.selectedIcon,
        color: this.selectedColor,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        municipio: '',
        endereco: '',
        observacoes: '',
        foto: null
    };
    
    // Adicionar à lista de marcadores
    this.markers.push(marker);
    
    // Adicionar ao gerenciador de camadas, se disponível
    if (this.layerManager) {
        try {
            console.log('Adicionando marcador ao gerenciador de camadas');
            this.layerManager.addMarkerToGroup(marker, 'Marcadores');
        } catch (error) {
            console.error('Erro ao adicionar marcador ao gerenciador de camadas:', error);
        }
    } else {
        console.log('LayerManager não disponível');
    }
    
    // Mostrar formulário para preencher dados adicionais
    this.showMarkerFormPopup(marker);
    
    // Desativar modo de adição de marcador
    this.isAddingMarker = false;
}

// Importar marcadores de JSON
importMarkers(jsonData) {
    try {
        const markersData = JSON.parse(jsonData);
        
        // Limpar marcadores existentes
        this.clearAllMarkers();
        
        // Adicionar novos marcadores
        markersData.forEach(data => {
            // Criar ícone
            const icon = L.divIcon({
                className: 'custom-marker-icon',
                html: `
                    <div class="marker-icon-container" style="background-color: ${data.color || '#E53935'}; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
                        <span class="material-icons marker-icon" style="font-size: 22px;">${data.icon}</span>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });
            
            // Criar marcador - removida a propriedade draggable: true
            const marker = L.marker([data.lat, data.lng], {
                icon: icon
            }).addTo(this.map);
            
            // Adicionar dados
            marker.markerData = data;
            
            // Adicionar à lista
            this.markers.push(marker);
            
            // Atualizar popup
            this.updateMarkerPopup(marker);
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao importar marcadores:', error);
        return false;
    }
}

    
    
    // Mostrar popup de formulário do marcador
    showMarkerFormPopup(marker) {
        this.currentMarker = marker;
        
        // Limpar formulário
        this.formPopup.querySelector('#municipio').value = '';
        this.formPopup.querySelector('#endereco').value = '';
        this.formPopup.querySelector('#observacoes').value = '';
        this.formPopup.querySelector('#foto').value = '';
        this.formPopup.querySelector('#foto-preview').innerHTML = '';
        
        // Mostrar popup
        this.formPopup.classList.add('active');
    }
    
    // Esconder popup de formulário do marcador
    hideMarkerFormPopup() {
        this.formPopup.classList.remove('active');
    }
    
    // Salvar dados do marcador
    saveMarkerData() {
        if (!this.currentMarker) return;
        
        // Obter dados do formulário
        const municipio = this.formPopup.querySelector('#municipio').value;
        const endereco = this.formPopup.querySelector('#endereco').value;
        const observacoes = this.formPopup.querySelector('#observacoes').value;
        
        // Obter foto
        const fotoInput = this.formPopup.querySelector('#foto');
        let foto = null;
        if (fotoInput.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(fotoInput.files[0]);
            reader.onload = () => {
                this.currentMarker.markerData.foto = reader.result;
                this.updateMarkerPopup(this.currentMarker);
                
                // Atualizar o gerenciador de camadas se disponível
                if (this.layerManager) {
                    this.layerManager.refreshLayerList();
                }
            };
        }
        
        // Atualizar dados do marcador
        this.currentMarker.markerData.municipio = municipio;
        this.currentMarker.markerData.endereco = endereco;
        this.currentMarker.markerData.observacoes = observacoes;
        
        // Atualizar popup do marcador
        this.updateMarkerPopup(this.currentMarker);
        
        // Atualizar o gerenciador de camadas se disponível
        if (this.layerManager) {
            this.layerManager.refreshLayerList();
        }
        
        // Esconder formulário
        this.hideMarkerFormPopup();
    }
    
    // Atualizar popup do marcador com os dados
    // Atualizar popup do marcador com os dados
updateMarkerPopup(marker) {
    const data = marker.markerData;
    let popupContent = `
        <div class="marker-popup">
            <h3>${data.name}</h3>
            <p><strong>Latitude:</strong> ${data.lat.toFixed(6)}</p>
            <p><strong>Longitude:</strong> ${data.lng.toFixed(6)}</p>
            <hr>
            <p><strong>Município:</strong> ${data.municipio || 'Não informado'}</p>
            <p><strong>Endereço:</strong> ${data.endereco || 'Não informado'}</p>
            <p><strong>Observações:</strong> ${data.observacoes || 'Não informado'}</p>
    `;
    
    if (data.foto) {
        popupContent += `
            <div class="marker-photo">
                <img src="${data.foto}" alt="Foto do local">
            </div>
        `;
    }
    
    popupContent += `
            <div class="marker-style-editor">
                <label>Cor:</label>
                <input type="color" class="marker-color-picker" value="${data.color}" data-marker-id="${this.markers.indexOf(marker)}" style="width: 20px; height: 20px;">
            </div>
        <div class="marker-actions">
    <button class="popup-button edit-button edit-marker" data-marker-id="${this.markers.indexOf(marker)}">
        <i class="fas fa-edit"></i>
        <span class="button-text">Editar</span>
    </button>
    <button class="popup-button delete-button delete-marker" data-marker-id="${this.markers.indexOf(marker)}">
        <i class="fas fa-trash"></i>
        <span class="button-text">Excluir</span>
    </button>
</div>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Adicionar event listeners para os botões e o seletor de cor
    marker.on('popupopen', () => {
        const editBtn = document.querySelector(`.edit-marker[data-marker-id="${this.markers.indexOf(marker)}"]`);
        const deleteBtn = document.querySelector(`.delete-marker[data-marker-id="${this.markers.indexOf(marker)}"]`);
        const colorPicker = document.querySelector(`.marker-color-picker[data-marker-id="${this.markers.indexOf(marker)}"]`);
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editMarker(marker));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteMarker(marker));
        }
        
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                const newColor = e.target.value;
                this.updateMarkerColor(marker, newColor);
            });
        }
    });
}

    updateMarkerColor(marker, newColor) {
        // Atualizar a cor nos dados do marcador
        marker.markerData.color = newColor;
        
        // Criar um novo ícone com a nova cor
        const newIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: `
                <div class="marker-icon-container" style="background-color: ${newColor};">
                    <span class="material-icons marker-icon">${marker.markerData.icon}</span>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
        
        // Atualizar o ícone do marcador
        marker.setIcon(newIcon);
    }
    
        
        // Editar um marcador existente
        editMarker(marker) {
            this.currentMarker = marker;
            
            // Preencher o formulário com os dados existentes
            this.formPopup.querySelector('#municipio').value = marker.markerData.municipio || '';
            this.formPopup.querySelector('#endereco').value = marker.markerData.endereco || '';
            this.formPopup.querySelector('#observacoes').value = marker.markerData.observacoes || '';
            
            // Limpar o campo de foto e preview
            this.formPopup.querySelector('#foto').value = '';
            
            // Se houver uma foto, mostrar no preview
            if (marker.markerData.foto) {
                this.formPopup.querySelector('#foto-preview').innerHTML = `
                    <img src="${marker.markerData.foto}" alt="Preview">
                `;
            } else {
                this.formPopup.querySelector('#foto-preview').innerHTML = '';
            }
            
            // Fechar o popup do marcador
            marker.closePopup();
            
            // Mostrar o formulário
            this.formPopup.classList.add('active');
        }
        
        // Excluir um marcador
        deleteMarker(marker) {
            // Confirmar exclusão
            if (confirm(`Tem certeza que deseja excluir o marcador "${marker.markerData.name}"?`)) {
                // Remover do mapa
                this.map.removeLayer(marker);
                
                // Remover da lista de marcadores
                const index = this.markers.indexOf(marker);
                if (index > -1) {
                    this.markers.splice(index, 1);
                }
                
                // Remover do gerenciador de camadas, se disponível
                if (this.layerManager) {
                    // Procurar o marcador em todos os grupos
                    for (const groupName in this.layerManager.groups) {
                        for (const layerId in this.layerManager.groups[groupName].layers) {
                            if (this.layerManager.groups[groupName].layers[layerId].layer === marker) {
                                this.layerManager.removeLayer(layerId, groupName);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Exportar marcadores para JSON
        exportMarkers() {
            const markersData = this.markers.map(marker => {
                return {
                    ...marker.markerData,
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng
                };
            });
            
            return JSON.stringify(markersData);
        }
        
        // Importar marcadores de JSON
        importMarkers(jsonData) {
            try {
                const markersData = JSON.parse(jsonData);
                
                // Limpar marcadores existentes
                this.clearAllMarkers();
                
                // Adicionar novos marcadores
                markersData.forEach(data => {
                    // Criar ícone
                    const icon = L.divIcon({
                        className: 'custom-marker-icon',
                        html: `<span class="material-icons">${data.icon}</span>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    });
                    
                    // Criar marcador
                    const marker = L.marker([data.lat, data.lng], {
                        icon: icon,
                        draggable: true
                    }).addTo(this.map);
                    
                    // Adicionar dados
                    marker.markerData = data;
                    
                    // Adicionar à lista
                    this.markers.push(marker);
                    
                    // Atualizar popup
                    this.updateMarkerPopup(marker);
                });
                
                return true;
            } catch (error) {
                console.error('Erro ao importar marcadores:', error);
                return false;
            }
        }
        
        // Limpar todos os marcadores
        clearAllMarkers() {
            // Remover cada marcador do mapa
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            
            // Limpar array
            this.markers = [];
        }
    }
    
    
    
