export default class LayerManager {
  constructor(mapManager) {
    this.map = mapManager.map;
    this.groups = {};
    this.layers = {};
    this.control = mapManager.layerControl; // Usar o controle existente
    this.isActive = false;
    this.panel = null;
    
    // Criar o painel de controle de camadas
    this.createLayerPanel();
  }

  // Modificar o método createGroup para garantir que os grupos sejam adicionados como overlays
  createGroup(name) {
    if (!this.groups[name]) {
      this.groups[name] = {
        layerGroup: L.layerGroup().addTo(this.map),
        layers: {},
        visible: true
      };
      
      // Adicionar ao controle de camadas do Leaflet como overlay (não como camada base)
      this.control.addOverlay(this.groups[name].layerGroup, name);
    }
    return this.groups[name];
  }

  // Ativar/desativar o painel de camadas
  toggleLayerPanel() {
    if (this.isActive) {
      this.hideLayerPanel();
    } else {
      this.showLayerPanel();
    }
    this.isActive = !this.isActive;
    
    // Sempre atualizar a lista quando o painel é mostrado
    if (this.isActive) {
      this.refreshLayerList();
    }
    
    return this.isActive;
  }

  // Mostrar o painel de camadas
  showLayerPanel() {
    if (this.panel) {
      this.panel.classList.add('active');
      this.refreshLayerList();
    }
  }

  // Esconder o painel de camadas
  hideLayerPanel() {
    if (this.panel) {
      this.panel.classList.remove('active');
    }
  }
  createDragIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'drag-indicator';
    indicator.className = 'drag-indicator';
    indicator.style.position = 'absolute';
    indicator.style.padding = '5px 10px';
    indicator.style.background = 'rgba(0, 0, 0, 0.7)';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '3px';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '9999';
    indicator.style.display = 'none';
    document.body.appendChild(indicator);
    return indicator;
  }
  // Criar o painel de controle de camadas
  createLayerPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'layer-panel';
    this.panel.innerHTML = `
      <div class="layer-panel-header">
        <h3>Gerenciador de Camadas</h3>
        <button class="btn-icon add-group-btn" title="Adicionar novo grupo">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <div class="layer-list-container">
        <ul class="layer-list"></ul>
      </div>
    `;
    
    document.body.appendChild(this.panel);
    
    // Adicionar event listener para o novo botão de adicionar grupo
    this.panel.querySelector('.add-group-btn').addEventListener('click', () => this.promptCreateGroup());
    
    // Inicializar o sortable para arrastar e soltar camadas
    this.initSortable();
  }
  // Inicializar a funcionalidade de arrastar e soltar
  // Substitua o método initSortable() existente por este
initSortable() {
  const layerList = this.panel.querySelector('.layer-list');
  
  // Implementação básica de drag and drop
  let draggedItem = null;
  let draggedItemType = null; // 'group' ou 'layer'
  let sourceGroupId = null;
  
  layerList.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('li');
    if (!draggedItem) return;
    
    // Determinar o tipo de item
    draggedItemType = draggedItem.classList.contains('layer-group-item') ? 'group' : 'layer';
    
    // Se for uma camada, armazenar o ID do grupo de origem
    if (draggedItemType === 'layer') {
      const groupContent = draggedItem.closest('.layer-group-content');
      sourceGroupId = groupContent ? groupContent.dataset.groupId : null;
    }
    
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  });
  
  layerList.addEventListener('dragend', (e) => {
    e.target.style.opacity = '1';
    draggedItem = null;
    draggedItemType = null;
    sourceGroupId = null;
  });
  
  layerList.addEventListener('dragover', (e) => {
    e.preventDefault();
    return false;
  });
  
  layerList.addEventListener('dragenter', (e) => {
    const item = e.target.closest('li');
    if (item && item !== draggedItem) {
      item.classList.add('drag-over');
    }
  });
  
  layerList.addEventListener('dragleave', (e) => {
    const item = e.target.closest('li');
    if (item) {
      item.classList.remove('drag-over');
    }
  });
  
  layerList.addEventListener('drop', (e) => {
    e.preventDefault();
    const item = e.target.closest('li');
    if (item && item !== draggedItem) {
      item.classList.remove('drag-over');
      
      // Determinar se é um grupo ou uma camada
      const isGroup = draggedItem.classList.contains('layer-group-item');
      const targetIsGroup = item.classList.contains('layer-group-item');
      
      // Reordenar no DOM
      if (isGroup && targetIsGroup) {
        // Reordenar grupos
        if (e.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2) {
          layerList.insertBefore(draggedItem, item);
        } else {
          layerList.insertBefore(draggedItem, item.nextSibling);
        }
        this.updateGroupOrder();
      } else if (!isGroup && !targetIsGroup) {
        // Reordenar camadas dentro do mesmo grupo
        const draggedGroup = draggedItem.closest('.layer-group-content');
        const targetGroup = item.closest('.layer-group-content');
        
        if (draggedGroup === targetGroup) {
          if (e.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2) {
            targetGroup.insertBefore(draggedItem, item);
          } else {
            targetGroup.insertBefore(draggedItem, item.nextSibling);
          }
          this.updateLayerOrder(draggedGroup.dataset.groupId);
        }
      } else if (!isGroup && targetIsGroup) {
        // Mover camada para outro grupo
        const targetGroupContent = item.querySelector('.layer-group-content');
        targetGroupContent.appendChild(draggedItem);
        this.moveLayerToGroup(draggedItem.dataset.layerId, sourceGroupId, item.dataset.groupId);
      }
    }
  });
  
  // Adicionar feedback visual durante o drag
  document.addEventListener('dragover', (e) => {
    if (!draggedItem) return;
    
    // Mostrar um indicador de posição
    const indicator = document.getElementById('drag-indicator') || this.createDragIndicator();
    
    // Posicionar o indicador
    indicator.style.display = 'block';
    indicator.style.left = `${e.pageX + 10}px`;
    indicator.style.top = `${e.pageY + 10}px`;
    
    // Mostrar informação sobre o que está sendo arrastado
    const itemName = draggedItemType === 'group' 
      ? draggedItem.querySelector('.layer-name').textContent
      : draggedItem.querySelector('.layer-name').textContent;
    
    indicator.textContent = `Movendo: ${itemName}`;
  });
  
  document.addEventListener('dragend', () => {
    // Esconder o indicador quando o drag terminar
    const indicator = document.getElementById('drag-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  });
}

    // Atualizar a ordem dos grupos
    updateGroupOrder() {
      console.log('Atualizando ordem dos grupos');
    
      // Obter a nova ordem dos grupos do DOM
      const groupItems = this.panel.querySelectorAll('.layer-group-item');
    
      // Criar um objeto temporário para armazenar os grupos na nova ordem
      const reorderedGroups = {};
    
      // Adicionar os grupos na nova ordem
      groupItems.forEach(item => {
        const groupId = item.dataset.groupId;
        if (this.groups[groupId]) {
          reorderedGroups[groupId] = this.groups[groupId];
        }
      });
    
      // Substituir o objeto original
      this.groups = reorderedGroups;
    
      console.log('Ordem dos grupos atualizada');
    }

    // Atualizar a ordem das camadas em um grupo
    updateLayerOrder(groupId) {
      console.log(`Atualizando ordem das camadas no grupo ${groupId}`);
    
      if (!this.groups[groupId]) return;
    
      // Obter a nova ordem das camadas do DOM
      const layerItems = this.panel.querySelectorAll(`.layer-group-content[data-group-id="${groupId}"] .layer-item`);
    
      // Criar um objeto temporário para armazenar as camadas na nova ordem
      const reorderedLayers = {};
    
      // Adicionar as camadas na nova ordem
      layerItems.forEach(item => {
        const layerId = item.dataset.layerId;
        if (this.groups[groupId].layers[layerId]) {
          reorderedLayers[layerId] = this.groups[groupId].layers[layerId];
        }
      });
    
      // Substituir o objeto original
      this.groups[groupId].layers = reorderedLayers;
    
      console.log(`Ordem das camadas no grupo ${groupId} atualizada`);
    }

    // Mover uma camada de um grupo para outro
    moveLayerToGroup(layerId, sourceGroupId, targetGroupId) {
      console.log(`Movendo camada ${layerId} do grupo ${sourceGroupId} para o grupo ${targetGroupId}`);
    
      // Verificar se os grupos existem
      if (!sourceGroupId || !this.groups[sourceGroupId] || !this.groups[targetGroupId]) {
        console.error('Grupos de origem ou destino não encontrados');
        return false;
      }
    
      // Verificar se a camada existe no grupo de origem
      if (!this.groups[sourceGroupId].layers[layerId]) {
        console.error('Camada não encontrada no grupo de origem');
        return false;
      }
    
      // Obter a referência da camada
      const layerInfo = this.groups[sourceGroupId].layers[layerId];
    
      // Remover a camada do grupo de origem
      this.groups[sourceGroupId].layerGroup.removeLayer(layerInfo.layer);
      delete this.groups[sourceGroupId].layers[layerId];
    
      // Adicionar a camada ao grupo de destino
      this.groups[targetGroupId].layerGroup.addLayer(layerInfo.layer);
      this.groups[targetGroupId].layers[layerId] = layerInfo;
    
      console.log(`Camada ${layerId} movida com sucesso para o grupo ${targetGroupId}`);
      return true;
    }
  // Solicitar nome para criar um novo grupo
  promptCreateGroup() {
    const groupName = prompt('Digite o nome do novo grupo:');
    if (groupName && groupName.trim() !== '') {
      this.createGroup(groupName.trim());
      this.refreshLayerList();
    }
  }

  // Criar um novo grupo de camadas
  createGroup(name) {
    if (!this.groups[name]) {
      this.groups[name] = {
        layerGroup: L.layerGroup().addTo(this.map),
        layers: {},
        visible: true
      };
      
    }
    return this.groups[name];
  }

  // Renomear um grupo
renameGroup(oldName, newName) {
  console.log(`Tentando renomear grupo de "${oldName}" para "${newName}"`);
  
  if (this.groups[oldName] && !this.groups[newName]) {
    // Criar uma cópia do grupo com o novo nome
    this.groups[newName] = {
      layerGroup: this.groups[oldName].layerGroup,
      layers: this.groups[oldName].layers,
      visible: this.groups[oldName].visible
    };
    
    // Remover o grupo antigo (apenas a referência, não a camada)
    delete this.groups[oldName];
    
    console.log(`Grupo renomeado com sucesso de "${oldName}" para "${newName}"`);
    
    // Atualizar a interface APÓS renomear o grupo
    this.refreshLayerList();
    
    return true;
  }
  
  console.log(`Não foi possível renomear: grupo "${oldName}" não existe ou "${newName}" já existe`);
  return false;
}


  // Excluir um grupo
  deleteGroup(name) {
    console.log(`Tentando excluir grupo: ${name}`);
    
    if (this.groups[name]) {
      // Remover todas as camadas do mapa
      this.map.removeLayer(this.groups[name].layerGroup);
      
      // Remover do objeto de grupos
      delete this.groups[name];
      
      console.log(`Grupo ${name} excluído com sucesso`);
      
      // Atualizar a interface APÓS excluir o grupo
      this.refreshLayerList();
      
      return true;
    }
    
    console.log(`Grupo ${name} não encontrado`);
    return false;
  }

  // Adicionar um marcador ao grupo especificado
  // Modificar o método addMarkerToGroup
addMarkerToGroup(marker, groupName = 'Marcadores') {
  console.log('Adicionando marcador ao grupo:', groupName);
  
  // Criar o grupo se não existir
  if (!this.groups[groupName]) {
    console.log('Criando grupo:', groupName);
    this.createGroup(groupName);
  }
  
  // Adicionar o marcador ao grupo
  this.groups[groupName].layerGroup.addLayer(marker);
  
  // Armazenar referência ao marcador
  const markerId = `marker_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  this.groups[groupName].layers[markerId] = {
    layer: marker,
    name: marker.markerData?.name || 'Marcador',
    type: 'marker',
    visible: true
  };
  
  console.log('Marcador adicionado com ID:', markerId);
  
  // Atualizar a interface
  this.refreshLayerList();
  
  return markerId;
}

// Adicionar um método para debug
debug() {
  console.log('LayerManager groups:', this.groups);
  console.log('LayerManager layers:', this.layers);
}


// Modificar o método addGeoJSON no LayerManager
addGeoJSON(data, name, groupName = null, style = {}) {
  console.log('LayerManager.addGeoJSON - Dados:', data);
  console.log('LayerManager.addGeoJSON - Nome:', name);
  console.log('LayerManager.addGeoJSON - Grupo:', groupName);
  console.log('LayerManager.addGeoJSON - Estilo:', style);
  
  try {
      // Criar o layer GeoJSON com os estilos fornecidos
      const layer = L.geoJSON(data, {
          style: style, // Aplicar o estilo diretamente
          onEachFeature: this._bindPopup
      });
      
      console.log('Layer GeoJSON criado:', layer);
      
      const layerId = `geojson_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      if (groupName) {
          // Adicionar ao grupo especificado
          if (!this.groups[groupName]) {
              this.createGroup(groupName);
          }
          
          // Acessar o layerGroup dentro do objeto de grupo e adicionar a camada
          this.groups[groupName].layerGroup.addLayer(layer);
          
          // Adicionar ao controle de camadas
          this.control.addOverlay(this.groups[groupName].layerGroup, groupName);
      } else {
          // Adicionar diretamente ao mapa
          layer.addTo(this.map);
          
          // Adicionar ao controle de camadas
          this.control.addOverlay(layer, name);
      }
      
      console.log('Layer adicionado com sucesso');
      return layer;
  } catch (error) {
      console.error('Erro ao adicionar GeoJSON:', error);
      alert(`Erro ao adicionar camada: ${error.message}`);
      return null;
  }
}


  // Remover uma camada
  removeLayer(layerId, groupName = null) {
    if (groupName && this.groups[groupName] && this.groups[groupName].layers[layerId]) {
      // Remover do grupo
      this.groups[groupName].layerGroup.removeLayer(this.groups[groupName].layers[layerId].layer);
      delete this.groups[groupName].layers[layerId];
    } else if (this.layers[layerId]) {
      // Remover do mapa
      this.map.removeLayer(this.layers[layerId].layer);
      
      // Remover do controle
      this.control.removeLayer(this.layers[layerId].layer);
      
      // Remover do objeto de camadas
      delete this.layers[layerId];
    }
    
    // Atualizar a interface
    this.refreshLayerList();
  }

  // Mostrar/esconder uma camada
  toggleLayerVisibility(layerId, groupName = null) {
    if (groupName && this.groups[groupName] && this.groups[groupName].layers[layerId]) {
      const layerInfo = this.groups[groupName].layers[layerId];
      
      if (layerInfo.visible) {
        this.groups[groupName].layerGroup.removeLayer(layerInfo.layer);
      } else {
        this.groups[groupName].layerGroup.addLayer(layerInfo.layer);
      }
      
      layerInfo.visible = !layerInfo.visible;
    } else if (this.layers[layerId]) {
      const layerInfo = this.layers[layerId];
      
      if (layerInfo.visible) {
        this.map.removeLayer(layerInfo.layer);
      } else {
        this.map.addLayer(layerInfo.layer);
      }
      
      layerInfo.visible = !layerInfo.visible;
    }
    
    // Atualizar a interface imediatamente
    this.refreshLayerList();
  }

  // Mostrar/esconder um grupo
  toggleGroupVisibility(groupName) {
    if (this.groups[groupName]) {
      if (this.groups[groupName].visible) {
        this.map.removeLayer(this.groups[groupName].layerGroup);
      } else {
        this.map.addLayer(this.groups[groupName].layerGroup);
      }
      
      this.groups[groupName].visible = !this.groups[groupName].visible;
      
      // Atualizar a interface imediatamente
      this.refreshLayerList();
    }
  }

  // Renomear uma camada
  renameLayer(layerId, newName, groupName = null) {
    if (groupName && this.groups[groupName] && this.groups[groupName].layers[layerId]) {
      this.groups[groupName].layers[layerId].name = newName;
    } else if (this.layers[layerId]) {
      this.layers[layerId].name = newName;
      
      // Atualizar no controle de camadas
      // Isso é mais complexo no Leaflet e pode exigir remover e adicionar novamente
    }
    
    // Atualizar a interface
    this.refreshLayerList();
  }

  // Atualizar a lista de camadas na interface
  refreshLayerList() {
    const layerList = this.panel.querySelector('.layer-list');
    layerList.innerHTML = '';
    
    // Adicionar grupos
    for (const groupName in this.groups) {
      const group = this.groups[groupName];
      
      const groupItem = document.createElement('li');
      groupItem.className = 'layer-group-item';
      groupItem.setAttribute('draggable', 'true');
      groupItem.dataset.groupId = groupName;
      
      groupItem.innerHTML = `
  <div class="layer-group-header">
    <div class="layer-visibility">
      <input type="checkbox" class="group-visibility-toggle" ${group.visible ? 'checked' : ''}>
    </div>
    <div class="layer-name">${groupName}</div>
    <div class="layer-actions">
      <button class="btn btn-sm rename-group" title="Renomear grupo">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-sm delete-group" title="Excluir grupo">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-sm toggle-group" title="Expandir/recolher">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
  </div>
  <ul class="layer-group-content" data-group-id="${groupName}"></ul>
`;
      
      layerList.appendChild(groupItem);
      
      // Adicionar camadas do grupo
      const groupContent = groupItem.querySelector('.layer-group-content');
      for (const layerId in group.layers) {
        const layerInfo = group.layers[layerId];
        
        const layerItem = document.createElement('li');
        layerItem.className = 'layer-item';
        layerItem.setAttribute('draggable', 'true');
        layerItem.dataset.layerId = layerId;
        
        // Determinar o ícone com base no tipo de camada
        let layerIcon = 'fa-map-marker-alt';
        if (layerInfo.type === 'geojson') {
          layerIcon = 'fa-draw-polygon';
        } else if (layerInfo.type === 'wms') {
          layerIcon = 'fa-server';
        } else if (layerInfo.type === 'tile') {
          layerIcon = 'fa-th';
        }
        
        layerItem.innerHTML = `
          <div class="layer-item-content">
            <div class="layer-visibility">
              <input type="checkbox" class="layer-visibility-toggle" ${layerInfo.visible ? 'checked' : ''}>
            </div>
            <div class="layer-icon">
              <i class="fas ${layerIcon}"></i>
            </div>
            <div class="layer-name">${layerInfo.name}</div>
            <div class="layer-actions">
              <button class="btn btn-sm rename-layer" title="Renomear camada">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm delete-layer" title="Excluir camada">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
        
        groupContent.appendChild(layerItem);
      }
      
      const currentGroupName = groupName; // Capturar o nome do grupo no escopo atual
    
      const toggleVisibility = groupItem.querySelector('.group-visibility-toggle');
      toggleVisibility.addEventListener('change', () => {
        this.toggleGroupVisibility(currentGroupName);
      });
      
      const renameBtn = groupItem.querySelector('.rename-group');
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impedir propagação do evento
        
        const newName = prompt('Digite o novo nome para o grupo:', currentGroupName);
        if (newName && newName.trim() !== '' && newName !== currentGroupName) {
          console.log(`Solicitação para renomear grupo de "${currentGroupName}" para "${newName.trim()}"`);
          this.renameGroup(currentGroupName, newName.trim());
        }
      });
      
      const deleteBtn = groupItem.querySelector('.delete-group');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impedir propagação do evento
        
        console.log(`Solicitação para excluir grupo: ${currentGroupName}`);
        if (confirm(`Tem certeza que deseja excluir o grupo "${currentGroupName}" e todas as suas camadas?`)) {
          console.log(`Confirmação recebida para excluir o grupo: ${currentGroupName}`);
          this.deleteGroup(currentGroupName);
        }
      });

      const toggleBtn = groupItem.querySelector('.toggle-group');
      toggleBtn.addEventListener('click', () => {
        const groupContent = groupItem.querySelector('.layer-group-content');
        groupContent.classList.toggle('collapsed');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-down');
        toggleBtn.querySelector('i').classList.toggle('fa-chevron-right');
      });
      
      // Adicionar event listeners para as camadas do grupo
      groupContent.querySelectorAll('.layer-item').forEach(item => {
        const layerId = item.dataset.layerId;
        
        const toggleVisibility = item.querySelector('.layer-visibility-toggle');
        toggleVisibility.addEventListener('change', () => {
          this.toggleLayerVisibility(layerId, groupName);
        });
        
        const renameBtn = item.querySelector('.rename-layer');
        renameBtn.addEventListener('click', () => {
          const currentName = this.groups[groupName].layers[layerId].name;
          const newName = prompt('Digite o novo nome para a camada:', currentName);
          if (newName && newName.trim() !== '' && newName !== currentName) {
            this.renameLayer(layerId, newName.trim(), groupName);
          }
        });
        
        const deleteBtn = item.querySelector('.delete-layer');
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Tem certeza que deseja excluir a camada "${this.groups[groupName].layers[layerId].name}"?`)) {
            this.removeLayer(layerId, groupName);
          }
        });
      });
    }
    
    // Adicionar camadas independentes (não agrupadas)
    for (const layerId in this.layers) {
      const layerInfo = this.layers[layerId];
      
      const layerItem = document.createElement('li');
      layerItem.className = 'layer-item standalone';
      layerItem.setAttribute('draggable', 'true');
      layerItem.dataset.layerId = layerId;
      
      // Determinar o ícone com base no tipo de camada
      let layerIcon = 'fa-map-marker-alt';
      if (layerInfo.type === 'geojson') {
        layerIcon = 'fa-draw-polygon';
      } else if (layerInfo.type === 'wms') {
        layerIcon = 'fa-server';
      } else if (layerInfo.type === 'tile') {
        layerIcon = 'fa-th';
      }
      
      layerItem.innerHTML = `
        <div class="layer-item-content">
          <div class="layer-visibility">
            <input type="checkbox" class="layer-visibility-toggle" ${layerInfo.visible ? 'checked' : ''}>
          </div>
          <div class="layer-icon">
            <i class="fas ${layerIcon}"></i>
          </div>
          <div class="layer-name">${layerInfo.name}</div>
          <div class="layer-actions">
            <button class="btn btn-sm rename-layer" title="Renomear camada">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm delete-layer" title="Excluir camada">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      layerList.appendChild(layerItem);
      
      // Adicionar event listeners para a camada
      const toggleVisibility = layerItem.querySelector('.layer-visibility-toggle');
      toggleVisibility.addEventListener('change', () => {
        this.toggleLayerVisibility(layerId);
      });
      
      const renameBtn = layerItem.querySelector('.rename-layer');
      renameBtn.addEventListener('click', () => {
        const currentName = this.layers[layerId].name;
        const newName = prompt('Digite o novo nome para a camada:', currentName);
        if (newName && newName.trim() !== '' && newName !== currentName) {
          this.renameLayer(layerId, newName.trim());
        }
      });
      
      const deleteBtn = layerItem.querySelector('.delete-layer');
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja excluir a camada "${this.layers[layerId].name}"?`)) {
          this.removeLayer(layerId);
        }
      });
    }
  }
}