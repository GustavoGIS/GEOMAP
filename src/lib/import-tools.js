// import-tools.js
export default class ImportTools {
    constructor(map, layerManager) {
        console.log('Inicializando ImportTools');
        this.map = map;
        this.layerManager = layerManager;
        
        // Definir estilos predefinidos PRIMEIRO
        this.predefinedStyles = {
            // ZAS: Contorno Mars Red de 2,0 width sem fill color (Polígono)
            'ZAS': {
                color: '#BF3030', // Mars Red
                weight: 2.0,
                opacity: 1,
                fillOpacity: 0
            },
            // ZSS: Contorno Chrysoprase de 2,0 width sem fill color (Polígono)
            'ZSS': {
                color: '#3EB489', // Chrysoprase (verde)
                weight: 2.0,
                opacity: 1,
                fillOpacity: 0
            },
            // Mancha de inundação: Fill color de Big Sky Blue com 70% de transparência, sem contorno (Polígono)
            'Mancha de inundação': {
                color: '#87CEEB', // Big Sky Blue
                weight: 0,
                opacity: 0,
                fillColor: '#87CEEB', // Big Sky Blue
                fillOpacity: 0.3 // 70% de transparência
            },
            // Rota de Fuga: Usando SVG personalizado
            'Rota de Fuga': {
                color: '#FFD700', // Amarelo dourado como fallback
                weight: 3.0,
                opacity: 1,
                useSvgMarker: true,
                svgPath: './assets/rf_svg/rota_de_fuga.svg', // Verifique se este caminho está correto
                arrowCount: 1 // Número de marcadores SVG a serem colocados ao longo da linha
            },
                // PE: Ponto de Encontro
            'PE': {
                useCustomIcon: true,
                iconUrl: './assets/sign_png/PE_120x80.png', // Caminho para o ícone do PE
                iconSize: [40, 32],
                iconAnchor: [16, 32],
                showLabel: true // Habilitar o label
            },
            // Municípios: Contorno cinza com fill transparente
            'Municipios': {
                color: '#808080', // Gray
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.1
            },
            // Rodovias: Linha contínua vermelha
            'Rodovias': {
                color: '#FF0000', // Red
                weight: 3.0,
                opacity: 1
            },
            // Vias secundárias: Linha contínua laranja mais fina
            'Vias secundárias': {
                color: '#FFA500', // Orange
                weight: 2.0,
                opacity: 1
            },
            // Barragem: Contorno azul escuro com fill azul claro
            'Barragem': {
                color: '#8B4513', // SaddleBrown (marrom)
                weight: 2,
                opacity: 1,
                fillColor: '#CD853F', // Peru (marrom claro)
                fillOpacity: 0.3,
                useCustomIcon: true,
                iconUrl: './assets/inv_svg/barragem_a.svg',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                // Adicionar propriedade para indicar que deve ter label
                useLabel: true,
                labelClass: 'barragem-label' // Classe CSS personalizada para o label
            },
            // Adicione ou atualize o estilo "Inventário"
    'Inventário': {
        color: '#3388ff',
        weight: 2,
        opacity: 1,
        fillColor: '#3388ff',
        fillOpacity: 0.2,
        useCustomIcon: true,
        useCategoryMapping: true,
        categoryAttribute: 'classe',
        svgBasePath: './assets/inv_svg/',
        showLabel: false, // Desativar labels conforme solicitado
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -12],
        defaultSvg: 'default.svg'
    }
};
        
        // Inicializar mapeamento de categorias
        this.initCategoryMapping();
        // Verificar se o mapeamento foi definido corretamente
        console.log('Mapeamento de categorias após inicialização:', 
        this.predefinedStyles['Inventário'].categoryMapping ? 
        Object.keys(this.predefinedStyles['Inventário'].categoryMapping).length + ' categorias' : 
        'não definido');
        
        // DEPOIS criar o elemento de UI para importação
        this.createImportPopup();
    }
    
    
   
    
    
  // Inicializar mapeamento de categorias para ícones
initCategoryMapping() {
    // Verificar se predefinedStyles existe
    if (!this.predefinedStyles) {
        console.error('predefinedStyles não está definido');
        return;
    }
   
    // Verificar se Inventário existe
    if (!this.predefinedStyles['Inventário']) {
        console.error('predefinedStyles.Inventário não está definido');
        return;
    }
   
    // Definir o mapeamento de categorias para o tipo Inventário
    this.predefinedStyles['Inventário'].categoryMapping = {
        'Residencial': 'residencial.svg',
        'Comércio e serviços': 'comercio.svg',
        'Edificação mista (residencial e comercial)': 'edificacao_mista.svg',
        'Em construção': 'construcao.svg',
        'Desativada ou desocupada': 'desativada.svg',
        'Estrutura utilitária': 'utilitaria.svg',
        'Habitação ocasional (casa de veraneio, rancho)': 'ocasional.svg',
        'Área industrial': 'area_industrial.svg',
        'Estrutura interna (da barragem)': 'interna.svg',
        'Estrutura interna': 'interna.svg',  // Tive que colocar dois, devido a um erro na estrutura da planilha - shape
        'Terreno baldio': 'terreno_baldio.svg',
        'Unidade de conservação ambiental': 'unidade_c_ambiental.svg',
        'Condomínio (portaria/guarita)': 'condominio.svg',
        'Prédio': 'predio.svg',
        'Porto / Doca': 'porto.svg',
        'Hotel / Pousada': 'hotel.svg',
        'Posto de combustível': 'combustivel.svg',
        'Praça / Parque': 'praca.svg',
        'Shopping': 'shopping.svg',
        'Cemitério': 'cemiterio.svg',
        'Templo religioso': 'templo.svg',
        'Flutuante (sobre a água)': 'flutuante.svg',
        'Aterro / Fossa / Lixão': 'aterro.svg',
        'Estabelecimento de educação': 'escola.svg',
        'Estação de tratamento de água': 'tratamento_agua.svg',
        'Estação de tratamento de esgoto': 'tratamento_esgoto.svg',
        'Estação ferroviária': 'estacao_ferroviaria.svg',
        'Hospital / Unidade de saúde': 'hospital.svg',
        'Aeroporto': 'aeroporto.svg',
        'Barramento de outro empreendimento': 'barragem_b.svg',
        'Serviço público': 'servico_publico.svg',
        'Casa de repouso (lar de idosos / asilo)': 'casa_de_repouso.svg',
        'Terminal rodoviário': 'terminal.svg',
        'Unidade prisional': 'unidade_prisional.svg',
        'Subestação': 'subestacao.svg',
        'Serviços de telecomunicações (torre de sinal)': 'default.svg', // Usar padrão conforme indicado
        'Área de lazer / Clubes': 'area_de_lazer.svg',
        'Estrutura demolida': 'demolida.svg'
    };

     // Adicionar mapeamento para o atributo "statusentr" (segunda prioridade)
      this.predefinedStyles['Inventário'].statusMapping = {
        'Cadastro recusado': 'cadastro_negado.svg',
        'Entrevistado ausente': 'ausente.svg'
        // Adicione outros status conforme necessário
    };
    
      // Adicionar mapeamento para o atributo "acesso" (terceira prioridade)
      this.predefinedStyles['Inventário'].acessoMapping = {
        'Não': 'sem_acesso.svg',
        'Sem acesso': 'sem_acesso.svg' // Tive que colocar dois, devido a um erro na estrutura da planilha - shape
        // Adicione outros valores de acesso conforme necessário
    };
    
    console.log('Mapeamento de categorias inicializado com sucesso:');
    console.log('- Categorias (classe):', Object.keys(this.predefinedStyles['Inventário'].categoryMapping).length);
    console.log('- Status:', Object.keys(this.predefinedStyles['Inventário'].statusMapping).length);
    console.log('- Acesso:', Object.keys(this.predefinedStyles['Inventário'].acessoMapping).length);
}


    
    
    
    
    // Iniciar o processo de importação
    startImport() {
        this.showImportPopup();
    }
    
  // Criar popup de importação
createImportPopup() {
    this.importPopup = document.createElement('div');
    this.importPopup.className = 'modal';
    this.importPopup.innerHTML = `
        <div class="modal-content import-modal">
            <span class="close-modal">&times;</span>
            <h2>Importar Dados</h2>
            <div class="import-tabs">
                <button class="tab-button active" data-tab="file">Arquivo</button>
                <button class="tab-button" data-tab="url">URL</button>
            </div>
            <div class="tab-content" id="file-tab">
                <div class="form-group">
                    <label for="import-file">Selecione um arquivo GeoJSON:</label>
                    <input type="file" id="import-file" accept=".geojson,.json,.kmz,.kml">
                </div>
                <div class="form-group">
                    <label for="import-group">Adicionar ao grupo:</label>
                    <div class="input-with-button">
                        <select id="import-group">
                            <option value="new">Criar novo grupo</option>
                        </select>
                        <button id="refresh-groups" class="btn btn-sm" title="Atualizar grupos">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group" id="new-group-container" style="display: none;">
                    <label for="new-group-name">Nome do novo grupo:</label>
                    <input type="text" id="new-group-name" placeholder="Digite o nome do grupo">
                </div>
                <div class="form-group">
                    <label for="layer-type">Tipo de camada:</label>
                    <select id="layer-type">
                        <optgroup label="Áreas de Risco">
                            <option value="ZAS">ZAS - Zona de Autossalvamento</option>
                            <option value="ZSS">ZSS - Zona de Segurança Secundária</option>
                            <option value="Mancha de inundação">Mancha de inundação</option>
                        </optgroup>
                        <optgroup label="Rotas">
                            <option value="Rota de Fuga">Rota de Fuga</option>
                        </optgroup>
                        <optgroup label="Limites">
                            <option value="Municipios">Municípios</option>
                        </optgroup>
                        <optgroup label="Infraestrutura">
                            <option value="Rodovias">Rodovias</option>
                            <option value="Vias secundárias">Vias secundárias</option>
                            <option value="Barragem">Barragem</option>
                        </optgroup>
                        <optgroup label="Pontos de Interesse">
                            <option value="PE">Ponto de Encontro</option>
                            <option value="Inventário">Inventário</option>
                        </optgroup>
                        <optgroup label="Outros">
                            <option value="default">Padrão</option>
                        </optgroup>
                    </select>
                </div>
                <div class="form-group" id="attribute-mapping-container" style="display: none;">
                    <label for="label-attribute">Atributo para rótulos:</label>
                    <select id="label-attribute">
                        <option value="">Sem rótulo</option>
                        <!-- Será preenchido dinamicamente após carregar o arquivo -->
                    </select>
                </div>
                <div class="form-group" id="category-attribute-container" style="display: none;">
                    <label for="category-attribute">Atributo para categorização:</label>
                    <select id="category-attribute">
                        <option value="">Sem categorização</option>
                        <!-- Será preenchido dinamicamente após carregar o arquivo -->
                    </select>
                </div>
            </div>
            <div class="tab-content" id="url-tab" style="display: none;">
                <div class="form-group">
                    <label for="import-url">URL do arquivo GeoJSON:</label>
                    <input type="text" id="import-url" placeholder="https://exemplo.com/arquivo.geojson">
                </div>
                <div class="form-group">
                    <label for="import-url-group">Adicionar ao grupo:</label>
                    <div class="input-with-button">
                        <select id="import-url-group">
                            <option value="new">Criar novo grupo</option>
                        </select>
                        <button id="refresh-url-groups" class="btn btn-sm" title="Atualizar grupos">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group" id="new-url-group-container" style="display: none;">
                    <label for="new-url-group-name">Nome do novo grupo:</label>
                    <input type="text" id="new-url-group-name" placeholder="Digite o nome do grupo">
                </div>
                <div class="form-group">
                    <label for="url-layer-type">Tipo de camada:</label>
                    <select id="url-layer-type">
                        <optgroup label="Áreas de Risco">
                            <option value="ZAS">ZAS - Zona de Atenção Secundária</option>
                            <option value="ZSS">ZSS - Zona de Segurança Secundária</option>
                            <option value="Mancha de inundação">Mancha de inundação</option>
                        </optgroup>
                        <optgroup label="Rotas">
                            <option value="Rota de Fuga">Rota de Fuga</option>
                        </optgroup>
                        <optgroup label="Limites">
                            <option value="Municipios">Municípios</option>
                        </optgroup>
                        <optgroup label="Infraestrutura">
                            <option value="Rodovias">Rodovias</option>
                            <option value="Vias secundárias">Vias secundárias</option>
                            <option value="Barragem">Barragem</option>
                        </optgroup>
                        <optgroup label="Pontos de Interesse">
                            <option value="PE">Pontos de Encontro (PE)</option>
                            <option value="Inventário">Inventário</option>
                        </optgroup>
                        <optgroup label="Outros">
                            <option value="default">Padrão</option>
                        </optgroup>
                    </select>
                </div>
                <div class="form-group" id="url-attribute-mapping-container" style="display: none;">
                    <label for="url-label-attribute">Atributo para rótulos:</label>
                    <select id="url-label-attribute">
                        <option value="">Sem rótulo</option>
                        <!-- Será preenchido dinamicamente após carregar a URL -->
                    </select>
                </div>
                <div class="form-group" id="url-category-attribute-container" style="display: none;">
                    <label for="url-category-attribute">Atributo para categorização:</label>
                    <select id="url-category-attribute">
                        <option value="">Sem categorização</option>
                        <!-- Será preenchido dinamicamente após carregar a URL -->
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button id="import-button" class="modal-button confirm-button">
                    <i class="fas fa-file-import"></i>
                    <span class="button-text">Importar</span>
                </button>
                <button id="cancel-import" class="modal-button cancel-button">
                    <i class="fas fa-times"></i>
                    <span class="button-text">Cancelar</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(this.importPopup);
    
    // Adicionar event listeners
    this.importPopup.querySelector('.close-modal').addEventListener('click', () => this.hideImportPopup());
    this.importPopup.querySelector('#cancel-import').addEventListener('click', () => this.hideImportPopup());
    
    // Event listeners para as abas
    const tabButtons = this.importPopup.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Esconder todos os conteúdos de abas
            const tabContents = this.importPopup.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.style.display = 'none');
            
            // Mostrar o conteúdo da aba selecionada
            const tabId = button.getAttribute('data-tab');
            this.importPopup.querySelector(`#${tabId}-tab`).style.display = 'block';
        });
    });
    
    // Event listener para o select de grupo
    const importGroup = this.importPopup.querySelector('#import-group');
    importGroup.addEventListener('change', () => {
        const newGroupContainer = this.importPopup.querySelector('#new-group-container');
        if (importGroup.value === 'new') {
            newGroupContainer.style.display = 'block';
        } else {
            newGroupContainer.style.display = 'none';
        }
    });
    
    // Event listener para o select de grupo da URL
    const importUrlGroup = this.importPopup.querySelector('#import-url-group');
    importUrlGroup.addEventListener('change', () => {
        const newUrlGroupContainer = this.importPopup.querySelector('#new-url-group-container');
        if (importUrlGroup.value === 'new') {
            newUrlGroupContainer.style.display = 'block';
        } else {
            newUrlGroupContainer.style.display = 'none';
        }
    });
    
    // Event listener para o botão de atualizar grupos
    this.importPopup.querySelector('#refresh-groups').addEventListener('click', () => this.refreshGroupsList());
    this.importPopup.querySelector('#refresh-url-groups').addEventListener('click', () => this.refreshGroupsList());
    
    // Event listener para o botão de importar
    this.importPopup.querySelector('#import-button').addEventListener('click', () => this.processImport());
    
    // Novos event listeners
    
    // Event listener para o arquivo selecionado
    const fileInput = this.importPopup.querySelector('#import-file');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            this.analyzeFile(file);
        }
    });
    
    // Event listener para o tipo de camada
    const layerTypeSelect = this.importPopup.querySelector('#layer-type');
    layerTypeSelect.addEventListener('change', () => {
        this.updateFormBasedOnLayerType(layerTypeSelect.value);
    });
    
    // Event listener para o tipo de camada da URL
    const urlLayerTypeSelect = this.importPopup.querySelector('#url-layer-type');
    urlLayerTypeSelect.addEventListener('change', () => {
        this.updateFormBasedOnLayerType(
            urlLayerTypeSelect.value, 
            '#url-attribute-mapping-container', 
            '#url-category-attribute-container'
        );
    });
    
    // Event listener para a URL
    const urlInput = this.importPopup.querySelector('#import-url');
    urlInput.addEventListener('blur', () => {
        const url = urlInput.value.trim();
        if (url) {
            this.analyzeUrl(url);
        }
    });
    
    // Inicializar o estado do formulário com base no tipo de camada selecionado
    this.updateFormBasedOnLayerType(layerTypeSelect.value);
    this.updateFormBasedOnLayerType(
        urlLayerTypeSelect.value, 
        '#url-attribute-mapping-container', 
        '#url-category-attribute-container'
    );
}
// Carregar SVG e criar um ícone personalizado
loadSvgIcon(svgPath) {
    console.log('Tentando carregar SVG de:', svgPath);
    return new Promise((resolve, reject) => {
        fetch(svgPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao carregar SVG: ${response.status}`);
                }
                return response.text();
            })
            .then(svgContent => {
                console.log('SVG carregado com sucesso');
                
                // Criar um ícone personalizado com o conteúdo SVG
                const icon = L.divIcon({
                    html: svgContent,
                    className: 'custom-svg-icon',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                resolve(icon);
            })
            .catch(error => {
                console.error('Erro ao carregar SVG:', error);
                reject(error);
            });
    });
}

// Processar linhas com SVG personalizado
processSvgLines(layer, style) {
    console.log('Iniciando processamento de linhas com SVG');
    
    // Carregar o SVG primeiro
    this.loadSvgIcon(style.svgPath)
        .then(icon => {
            console.log('SVG carregado, aplicando às linhas');
            
            // Processar cada camada
            layer.eachLayer(l => {
                if (l.feature && l.feature.geometry && 
                    (l.feature.geometry.type === 'LineString' || l.feature.geometry.type === 'MultiLineString')) {
                    console.log('Processando linha:', l);
                    
                    // Obter as coordenadas da linha
                    const latLngs = l.getLatLngs();
                    
                    // Se for um array de arrays (MultiLineString), processar cada linha
                    if (latLngs.length > 0 && Array.isArray(latLngs[0])) {
                        latLngs.forEach(line => {
                            this.addSvgMarkersToLine(line, style, icon);
                        });
                    } else {
                        // LineString simples
                        this.addSvgMarkersToLine(latLngs, style, icon);
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erro ao processar linhas com SVG:', error);
        });
}


// Adicionar marcadores SVG a uma linha
addSvgMarkersToLine(latLngs, style, icon) {
    console.log('Adicionando marcadores SVG à linha');
    
    // Se não houver pontos suficientes, não fazer nada
    if (latLngs.length < 2) {
        console.log('Linha não tem pontos suficientes');
        return;
    }
    
    // Determinar quantos marcadores adicionar (usar um valor menor)
    const arrowCount = Math.min(style.arrowCount || 2, 5); // Limitar a no máximo 5
    
    // Para linhas muito curtas, adicionar apenas uma seta no meio
    if (latLngs.length === 2) {
        const midPoint = L.latLng(
            (latLngs[0].lat + latLngs[1].lat) / 2,
            (latLngs[0].lng + latLngs[1].lng) / 2
        );
        
        // Calcular o ângulo da linha
        const angle = this.calculateAngle(latLngs[0], latLngs[1]);
        this.addSvgMarker(midPoint, angle, icon);
        return;
    }
    
    // Para linhas mais complexas, distribuir as setas uniformemente
    const positions = this.getEvenlySpacedPositions(latLngs, arrowCount);
    
    // Adicionar marcadores nas posições calculadas
    positions.forEach(pos => {
        const angle = this.calculateAngle(pos.prev, pos.next);
        this.addSvgMarker(pos.point, angle, icon);
    });
}
// Obter posições uniformemente espaçadas ao longo de uma linha
getEvenlySpacedPositions(latLngs, count) {
    // Calcular o comprimento total da linha
    let totalLength = 0;
    const segments = [];
    
    for (let i = 1; i < latLngs.length; i++) {
        const segment = {
            start: latLngs[i-1],
            end: latLngs[i],
            length: latLngs[i-1].distanceTo(latLngs[i])
        };
        totalLength += segment.length;
        segments.push(segment);
    }
    
    // Se a linha for muito curta, retornar apenas o ponto médio
    if (totalLength < 50 || segments.length === 0) {
        const midIndex = Math.floor(latLngs.length / 2);
        return [{
            point: latLngs[midIndex],
            prev: latLngs[Math.max(0, midIndex-1)],
            next: latLngs[Math.min(latLngs.length-1, midIndex+1)]
        }];
    }
    
    // Calcular o intervalo entre marcadores
    const interval = totalLength / (count + 1);
    const positions = [];
    
    // Posicionar os marcadores
    for (let i = 1; i <= count; i++) {
        const targetDistance = interval * i;
        let currentDistance = 0;
        
        for (let j = 0; j < segments.length; j++) {
            const segment = segments[j];
            
            if (currentDistance + segment.length >= targetDistance) {
                // Calcular a posição exata neste segmento
                const ratio = (targetDistance - currentDistance) / segment.length;
                const lat = segment.start.lat + ratio * (segment.end.lat - segment.start.lat);
                const lng = segment.start.lng + ratio * (segment.end.lng - segment.start.lng);
                
                positions.push({
                    point: L.latLng(lat, lng),
                    prev: segment.start,
                    next: segment.end
                });
                
                break;
            }
            
            currentDistance += segment.length;
        }
    }
    
    return positions;
}

// Adicionar um marcador SVG com a rotação correta
addSvgMarker(position, angle, icon) {
    // Criar um marcador com o ícone SVG
    const marker = L.marker(position, {
        icon: icon,
        interactive: false,
        keyboard: false
    });
    
    // Adicionar ao mapa
    marker.addTo(this.map);
    
    // Rotacionar o ícone SVG
    setTimeout(() => {
        const markerElement = marker.getElement();
        if (markerElement) {
            const svgElement = markerElement.querySelector('svg');
            if (svgElement) {
                svgElement.style.transform = `rotate(${angle}deg)`;
                svgElement.style.transformOrigin = 'center center';
            }
        }
    }, 10);
    
    return marker;
}

// Adicionar um marcador rotacionado para apontar na direção da linha
addRotatedMarker(position, start, end, icon) {
    // Calcular o ângulo da linha
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Ajustar o ângulo para a orientação correta
    angle = (angle + 90) % 360;
    
    // Criar um marcador com o ícone SVG
    const marker = L.marker(position, {
        icon: icon,
        interactive: false, // Não interativo (não responde a cliques)
        keyboard: false     // Não focável por teclado
    });
    
    // Adicionar ao mapa
    marker.addTo(this.map);
    
    // Rotacionar o ícone SVG
    setTimeout(() => {
        const markerElement = marker.getElement();
        if (markerElement) {
            const svgElement = markerElement.querySelector('svg');
            if (svgElement) {
                svgElement.style.transform = `rotate(${angle}deg)`;
            }
        }
    }, 10);
    
    return marker;
}
// Calcular o ângulo entre dois pontos em graus
calculateAngle(start, end) {
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    
    // Calcular o ângulo em radianos e converter para graus
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Ajustar para que 0 graus aponte para o norte (para cima)
    angle = 90 - angle;
    
    // Normalizar para o intervalo [0, 360)
    if (angle < 0) angle += 360;
    
    return angle;
}


    
    // Mostrar popup de importação
    showImportPopup() {
        // Atualizar a lista de grupos
        this.refreshGroupsList();
        
        // Mostrar popup
        this.importPopup.classList.add('active');
    }
    
    // Esconder popup de importação
    hideImportPopup() {
        this.importPopup.classList.remove('active');
    }
    
    // Atualizar a lista de grupos nos selects
    refreshGroupsList() {
        // Obter os grupos existentes do layerManager
        const groups = Object.keys(this.layerManager.groups);
        
        // Atualizar o select de grupos para arquivo
        const importGroup = this.importPopup.querySelector('#import-group');
        const importUrlGroup = this.importPopup.querySelector('#import-url-group');
        
        // Salvar o valor selecionado atual
        const selectedValue = importGroup.value;
        const selectedUrlValue = importUrlGroup.value;
        
        // Limpar os selects, mantendo apenas a opção "Criar novo grupo"
        importGroup.innerHTML = '<option value="new">Criar novo grupo</option>';
        importUrlGroup.innerHTML = '<option value="new">Criar novo grupo</option>';
        
        // Adicionar os grupos existentes
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            importGroup.appendChild(option);
            
            const urlOption = document.createElement('option');
            urlOption.value = group;
            urlOption.textContent = group;
            importUrlGroup.appendChild(urlOption);
        });
        
        // Restaurar o valor selecionado, se possível
        if (groups.includes(selectedValue)) {
            importGroup.value = selectedValue;
        }
        
        if (groups.includes(selectedUrlValue)) {
            importUrlGroup.value = selectedUrlValue;
        }
        
        // Atualizar a visibilidade do campo de novo grupo
        const newGroupContainer = this.importPopup.querySelector('#new-group-container');
        if (importGroup.value === 'new') {
            newGroupContainer.style.display = 'block';
        } else {
            newGroupContainer.style.display = 'none';
        }
        
        const newUrlGroupContainer = this.importPopup.querySelector('#new-url-group-container');
        if (importUrlGroup.value === 'new') {
            newUrlGroupContainer.style.display = 'block';
        } else {
            newUrlGroupContainer.style.display = 'none';
        }
    }
    // Adicione este método à classe ImportTools

      // Atualizar o formulário com base no tipo de camada selecionado
        updateFormBasedOnLayerType(layerType, attributeContainerId = '#attribute-mapping-container', categoryContainerId = '#category-attribute-container') {
    const attributeMappingContainer = this.importPopup.querySelector(attributeContainerId);
    const categoryAttributeContainer = this.importPopup.querySelector(categoryContainerId);
    
    // Verificar se o tipo de camada usa rótulos
    const useLabel = this.predefinedStyles[layerType]?.useLabel || false;
    attributeMappingContainer.style.display = useLabel ? 'block' : 'none';
    
    // Verificar se o tipo de camada usa categorização
    const useCategory = this.predefinedStyles[layerType]?.useCategoryMapping || false;
    categoryAttributeContainer.style.display = useCategory ? 'block' : 'none';
    }
    // Analisar o arquivo selecionado para extrair atributos
analyzeFile(file) {
    console.log('Analisando arquivo:', file.name);
    
    // Verificar o tipo de arquivo
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'geojson' || fileExtension === 'json') {
        // Processar GeoJSON
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Verificar se é um GeoJSON válido
                if (!data.type || !data.features) {
                    console.error('O arquivo não parece ser um GeoJSON válido.');
                    return;
                }
                
                // Extrair atributos das features
                this.extractAttributes(data);
                
            } catch (error) {
                console.error('Erro ao processar arquivo GeoJSON:', error);
            }
        };
        
        reader.onerror = () => {
            console.error('Erro ao ler o arquivo.');
        };
        
        reader.readAsText(file);
    } else if (fileExtension === 'kmz' || fileExtension === 'kml') {
        // Processar KMZ/KML
        if (fileExtension === 'kml') {
            // Processar KML diretamente
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // Converter KML para GeoJSON usando a biblioteca togeojson
                    const kmlDoc = new DOMParser().parseFromString(e.target.result, 'text/xml');
                    const geojsonData = toGeoJSON.kml(kmlDoc);
                    
                    // Extrair atributos das features
                    this.extractAttributes(geojsonData);
                    
                } catch (error) {
                    console.error('Erro ao processar arquivo KML:', error);
                }
            };
            
            reader.onerror = () => {
                console.error('Erro ao ler o arquivo.');
            };
            
            reader.readAsText(file);
        } else {
            // Processar KMZ (arquivo ZIP contendo KML)
            JSZip.loadAsync(file).then((zip) => {
                // Encontrar o arquivo KML principal (geralmente doc.kml)
                const kmlFile = zip.file(/\.kml$/i)[0];
                
                if (!kmlFile) {
                    throw new Error('Nenhum arquivo KML encontrado no arquivo KMZ.');
                }
                
                return kmlFile.async('string');
            }).then((kmlContent) => {
                // Converter KML para GeoJSON
                const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Extrair atributos das features
                this.extractAttributes(geojsonData);
                
            }).catch((error) => {
                console.error('Erro ao processar arquivo KMZ:', error);
            });
        }
    }
}
// Analisar a URL para extrair atributos
// Analisar a URL para extrair atributos
analyzeUrl(url) {
    console.log('Analisando URL:', url);
    
    // Verificar o tipo de arquivo
    const urlExtension = url.split('.').pop().toLowerCase();
    
    if (urlExtension === 'geojson' || urlExtension === 'json') {
        // Processar GeoJSON
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Verificar se é um GeoJSON válido
                if (!data.type || !data.features) {
                    console.error('O arquivo não parece ser um GeoJSON válido.');
                    return;
                }
                
                // Extrair atributos das features e preencher os selects da URL
                this.extractUrlAttributes(data);
            })
            .catch(error => {
                console.error('Erro ao processar URL GeoJSON:', error);
            });
    } else if (urlExtension === 'kml') {
        // Processar KML
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(kmlContent => {
                // Converter KML para GeoJSON
                const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Extrair atributos das features
                this.extractUrlAttributes(geojsonData);
            })
            .catch(error => {
                console.error('Erro ao processar URL KML:', error);
            });
    } else if (urlExtension === 'kmz') {
        // Processar KMZ
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(data => {
                return JSZip.loadAsync(data);
            })
            .then(zip => {
                // Encontrar o arquivo KML principal (geralmente doc.kml)
                const kmlFile = zip.file(/\.kml$/i)[0];
                
                if (!kmlFile) {
                    throw new Error('Nenhum arquivo KML encontrado no arquivo KMZ.');
                }
                
                return kmlFile.async('string');
            })
            .then(kmlContent => {
                // Converter KML para GeoJSON
                const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Extrair atributos das features
                this.extractUrlAttributes(geojsonData);
            })
            .catch(error => {
                console.error('Erro ao processar URL KMZ:', error);
            });
    }
}

// Extrair atributos das features e preencher os selects
extractAttributes(data) {
    console.log('Extraindo atributos do GeoJSON');
    
    // Conjunto para armazenar atributos únicos
    const attributes = new Set();
    
    // Percorrer todas as features
    if (data.features && data.features.length > 0) {
        data.features.forEach(feature => {
            if (feature.properties) {
                // Adicionar cada propriedade ao conjunto
                Object.keys(feature.properties).forEach(key => {
                    attributes.add(key);
                });
            }
        });
    }
    
    // Converter o conjunto para array e ordenar
    const attributesArray = Array.from(attributes).sort();
    
    console.log('Atributos encontrados:', attributesArray);
    
    // Preencher os selects de atributos
    const labelAttributeSelect = this.importPopup.querySelector('#label-attribute');
    const categoryAttributeSelect = this.importPopup.querySelector('#category-attribute');
    
    // Limpar os selects, mantendo apenas a opção padrão
    labelAttributeSelect.innerHTML = '<option value="">Sem rótulo</option>';
    categoryAttributeSelect.innerHTML = '<option value="">Sem categorização</option>';
    
    // Adicionar os atributos encontrados
    attributesArray.forEach(attr => {
        // Adicionar ao select de rótulos
        const labelOption = document.createElement('option');
        labelOption.value = attr;
        labelOption.textContent = attr;
        labelAttributeSelect.appendChild(labelOption);
        
        // Adicionar ao select de categorização
        const categoryOption = document.createElement('option');
        categoryOption.value = attr;
        categoryOption.textContent = attr;
        categoryAttributeSelect.appendChild(categoryOption);
    });
    
    // Atualizar o formulário com base no tipo de camada selecionado
    const layerType = this.importPopup.querySelector('#layer-type').value;
    this.updateFormBasedOnLayerType(layerType);
    
    // Selecionar automaticamente atributos comuns para rótulos
    const commonLabelAttributes = ['name', 'title', 'Nome', 'Título', 'NOME', 'TITULO'];
    for (const attr of commonLabelAttributes) {
        if (attributesArray.includes(attr)) {
            labelAttributeSelect.value = attr;
            break;
        }
    }
    
    // Selecionar automaticamente atributos comuns para categorização
    const commonCategoryAttributes = ['type', 'category', 'Tipo', 'Categoria', 'TIPO', 'CATEGORIA'];
    for (const attr of commonCategoryAttributes) {
        if (attributesArray.includes(attr)) {
            categoryAttributeSelect.value = attr;
            break;
        }
    }
}
// Extrair atributos das features e preencher os selects para URL
extractUrlAttributes(data) {
    console.log('Extraindo atributos do GeoJSON da URL');
    
    // Conjunto para armazenar atributos únicos
    const attributes = new Set();
    
    // Percorrer todas as features
    if (data.features && data.features.length > 0) {
        data.features.forEach(feature => {
            if (feature.properties) {
                // Adicionar cada propriedade ao conjunto
                Object.keys(feature.properties).forEach(key => {
                    attributes.add(key);
                });
            }
        });
    }
    
    // Converter o conjunto para array e ordenar
    const attributesArray = Array.from(attributes).sort();
    
    console.log('Atributos encontrados na URL:', attributesArray);
    
    // Preencher os selects de atributos
    const labelAttributeSelect = this.importPopup.querySelector('#url-label-attribute');
    const categoryAttributeSelect = this.importPopup.querySelector('#url-category-attribute');
    
    // Limpar os selects, mantendo apenas a opção padrão
    labelAttributeSelect.innerHTML = '<option value="">Sem rótulo</option>';
    categoryAttributeSelect.innerHTML = '<option value="">Sem categorização</option>';
    
    // Adicionar os atributos encontrados
    attributesArray.forEach(attr => {
        // Adicionar ao select de rótulos
        const labelOption = document.createElement('option');
        labelOption.value = attr;
        labelOption.textContent = attr;
        labelAttributeSelect.appendChild(labelOption);
        
        // Adicionar ao select de categorização
        const categoryOption = document.createElement('option');
        categoryOption.value = attr;
        categoryOption.textContent = attr;
        categoryAttributeSelect.appendChild(categoryOption);
    });
    
    // Atualizar o formulário com base no tipo de camada selecionado
    const layerType = this.importPopup.querySelector('#url-layer-type').value;
    this.updateFormBasedOnLayerType(
        layerType, 
        '#url-attribute-mapping-container', 
        '#url-category-attribute-container'
    );
    
    // Selecionar automaticamente atributos comuns para rótulos
    const commonLabelAttributes = ['name', 'title', 'Nome', 'Título', 'NOME', 'TITULO'];
    for (const attr of commonLabelAttributes) {
        if (attributesArray.includes(attr)) {
            labelAttributeSelect.value = attr;
            break;
        }
    }
    
    // Selecionar automaticamente atributos comuns para categorização
    const commonCategoryAttributes = ['type', 'category', 'Tipo', 'Categoria', 'TIPO', 'CATEGORIA'];
    for (const attr of commonCategoryAttributes) {
        if (attributesArray.includes(attr)) {
            categoryAttributeSelect.value = attr;
            break;
        }
    }
}

// Adicionar contorno externo para polígonos
addOutlineToPolygons(layer, style) {
    // Clonar a camada para criar o contorno
    const outline = L.geoJSON(layer.toGeoJSON(), {
        style: {
            color: style.outlineColor,
            weight: style.outlineWidth,
            opacity: style.opacity || 1,
            fill: false
        },
        filter: (feature) => {
            // Filtrar apenas polígonos
            return feature.geometry.type.includes('Polygon');
        }
    });
    
    // Adicionar o contorno ao mapa
    outline.addTo(this.map);
    
    // Associar o contorno à camada original para que sejam tratados como uma unidade
    layer.outline = outline;
    
    // Sobrescrever o método de remoção para remover também o contorno
    const originalRemove = layer.remove;
    layer.remove = function() {
        if (this.outline) {
            this.outline.remove();
        }
        originalRemove.call(this);
    };
}

// Adicionar setas a uma linha
addArrowsToLatLngs(latLngs, style) {
    // Verificar se temos pontos suficientes
    if (!latLngs || latLngs.length < 2) return;
    
    // Determinar a frequência das setas
    const frequency = style.arrowFrequency || 3;
    const arrowSize = style.arrowSize || 12;
    const arrowColor = style.arrowColor || style.color;
    
    // Adicionar setas ao longo da linha
    for (let i = 0; i < latLngs.length - 1; i += frequency) {
        // Obter os pontos atual e próximo
        const p1 = latLngs[i];
        const p2 = latLngs[i + 1];
        
        if (!p1 || !p2) continue;
        
        // Calcular o ponto médio para posicionar a seta
        const midPoint = L.latLng(
            (p1.lat + p2.lat) / 2,
            (p1.lng + p2.lng) / 2
        );
        
        // Calcular o ângulo da linha
        const angle = this.calculateAngle(p1, p2);
        
        // Criar o marcador de seta
        this.createArrowMarker(midPoint, angle, arrowSize, arrowColor).addTo(this.map);
    }
}

// Calcular o ângulo entre dois pontos (em graus)
calculateAngle(p1, p2) {
    // Math.atan2 espera (y, x) - usamos a diferença de latitude como y e longitude como x
    // Multiplicamos por -1 porque as coordenadas do mapa têm o eixo y invertido
    return Math.atan2(-(p2.lat - p1.lat), p2.lng - p1.lng) * 180 / Math.PI;
}

// Criar um marcador de seta
createArrowMarker(position, angle, size, color) {
    // Criar um elemento HTML para a seta
    const arrowIcon = L.divIcon({
        html: `<div style="
            width: 0; 
            height: 0; 
            border-left: ${size}px solid transparent;
            border-right: ${size}px solid transparent;
            border-bottom: ${size * 1.5}px solid ${color};
            transform: rotate(${angle + 90}deg);
            transform-origin: 50% 50%;
        "></div>`,
        className: 'arrow-marker',
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size]
    });
    
    // Criar o marcador com o ícone
    return L.marker(position, {
        icon: arrowIcon,
        interactive: false // Não interativo para não interferir com cliques na linha
    });
}

    
    // Processar a importação do arquivo
    processImport() {
        // Verificar qual aba está ativa
        const activeTab = this.importPopup.querySelector('.tab-button.active').getAttribute('data-tab');
        
        if (activeTab === 'file') {
            // Importação de arquivo
            const fileInput = this.importPopup.querySelector('#import-file');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Por favor, selecione um arquivo para importar.');
                return;
            }
            
            // Obter o grupo selecionado ou criar um novo
            let groupName;
            const importGroup = this.importPopup.querySelector('#import-group');
            
            if (importGroup.value === 'new') {
                groupName = this.importPopup.querySelector('#new-group-name').value.trim();
                if (!groupName) {
                    alert('Por favor, digite um nome para o novo grupo.');
                    return;
                }
            } else {
                groupName = importGroup.value;
            }
            
            // Obter o tipo de camada selecionado
            const layerType = this.importPopup.querySelector('#layer-type').value;
            console.log('Tipo de camada selecionado para importação:', layerType);
            console.log('Estilos disponíveis:', Object.keys(this.predefinedStyles));
            
            // Processar o arquivo com base na extensão
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            
            if (fileExtension === 'geojson' || fileExtension === 'json') {
                this.processGeoJSONFile(file, groupName, layerType);
            } else if (fileExtension === 'kmz' || fileExtension === 'kml') {
                this.processKMZFile(file, groupName, layerType);
            } else {
                alert('Formato de arquivo não suportado. Por favor, selecione um arquivo GeoJSON, JSON, KMZ ou KML.');
            }
        } else {
            // Importação de URL
            const urlInput = this.importPopup.querySelector('#import-url');
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('Por favor, digite uma URL para importar.');
                return;
            }
            
            // Obter o grupo selecionado ou criar um novo
            let groupName;
            const importUrlGroup = this.importPopup.querySelector('#import-url-group');
            
            if (importUrlGroup.value === 'new') {
                groupName = this.importPopup.querySelector('#new-url-group-name').value.trim();
                if (!groupName) {
                    alert('Por favor, digite um nome para o novo grupo.');
                    return;
                }
            } else {
                groupName = importUrlGroup.value;
            }
            
            // Obter o tipo de camada selecionado
            const layerType = this.importPopup.querySelector('#url-layer-type').value;
            
            // Processar a URL com base na extensão
            const urlExtension = url.split('.').pop().toLowerCase();
            
            if (urlExtension === 'geojson' || urlExtension === 'json') {
                this.processGeoJSONUrl(url, groupName, layerType);
            } else if (urlExtension === 'kmz' || urlExtension === 'kml') {
                this.processKMZUrl(url, groupName, layerType);
            } else {
                alert('Formato de URL não suportado. Por favor, forneça uma URL para um arquivo GeoJSON, JSON, KMZ ou KML.');
            }
        }
    }
    
    // Processar arquivo GeoJSON
processGeoJSONFile(file, groupName, layerType) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Log detalhado do GeoJSON para debug
            console.log('Conteúdo do GeoJSON:', data);
            console.log('Tipo de GeoJSON:', data.type);
            if (data.features && data.features.length > 0) {
                console.log('Primeiro feature tipo:', data.features[0].geometry.type);
                console.log('Primeiro feature propriedades:', data.features[0].properties);
            }
            
            // Verificar se é um GeoJSON válido
            if (!data.type || !data.features) {
                alert('O arquivo não parece ser um GeoJSON válido.');
                return;
            }
            
            // Aplicar o estilo predefinido e adicionar ao mapa
            this.addLayerToMap(data, file.name, groupName, layerType);
            
            // Esconder o popup de importação
            this.hideImportPopup();
        } catch (error) {
            console.error('Erro ao processar arquivo GeoJSON:', error);
            alert(`Erro ao processar o arquivo: ${error.message}`);
        }
    };
    
    reader.onerror = () => {
        alert('Erro ao ler o arquivo.');
    };
    
    reader.readAsText(file);
}
    
    // Processar arquivo KMZ/KML
    processKMZFile(file, groupName, layerType) {
        // Verificar se é KMZ ou KML
        if (file.name.toLowerCase().endsWith('.kml')) {
            // Processar KML diretamente
            this.processKMLFile(file, groupName, layerType);
        } else {
            // Processar KMZ (arquivo ZIP contendo KML)
            this.processKMZArchive(file, groupName, layerType);
        }
    }
    
    // Processar arquivo KML
    processKMLFile(file, groupName, layerType) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // Converter KML para GeoJSON usando a biblioteca togeojson
                // Nota: Você precisará incluir a biblioteca togeojson no seu HTML
                const kmlDoc = new DOMParser().parseFromString(e.target.result, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Aplicar o estilo predefinido e adicionar ao mapa
                this.addLayerToMap(geojsonData, file.name, groupName, layerType);
                
                // Esconder o popup de importação
                this.hideImportPopup();
            } catch (error) {
                console.error('Erro ao processar arquivo KML:', error);
                alert(`Erro ao processar o arquivo: ${error.message}`);
            }
        };
        
        reader.onerror = () => {
            alert('Erro ao ler o arquivo.');
        };
        
        reader.readAsText(file);
    }
    
    // Processar arquivo KMZ (ZIP contendo KML)
    processKMZArchive(file, groupName, layerType) {
        // Nota: Você precisará incluir a biblioteca JSZip no seu HTML
        JSZip.loadAsync(file).then((zip) => {
            // Encontrar o arquivo KML principal (geralmente doc.kml)
            const kmlFile = zip.file(/\.kml$/i)[0];
            
            if (!kmlFile) {
                throw new Error('Nenhum arquivo KML encontrado no arquivo KMZ.');
            }
            
            return kmlFile.async('string');
        }).then((kmlContent) => {
            // Converter KML para GeoJSON
            const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
            const geojsonData = toGeoJSON.kml(kmlDoc);
            
            // Aplicar o estilo predefinido e adicionar ao mapa
            this.addLayerToMap(geojsonData, file.name, groupName, layerType);
            
            // Esconder o popup de importação
            this.hideImportPopup();
        }).catch((error) => {
            console.error('Erro ao processar arquivo KMZ:', error);
            alert(`Erro ao processar o arquivo: ${error.message}`);
        });
    }
    
    // Processar URL de GeoJSON
    processGeoJSONUrl(url, groupName, layerType) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Verificar se é um GeoJSON válido
                if (!data.type || !data.features) {
                    alert('O arquivo não parece ser um GeoJSON válido.');
                    return;
                }
                
                // Aplicar o estilo predefinido e adicionar ao mapa
                this.addLayerToMap(data, url.split('/').pop(), groupName, layerType);
                
                // Esconder o popup de importação
                this.hideImportPopup();
            })
            .catch(error => {
                console.error('Erro ao processar URL GeoJSON:', error);
                alert(`Erro ao processar a URL: ${error.message}`);
            });
    }
    
    // Processar URL de KMZ/KML
    processKMZUrl(url, groupName, layerType) {
        // Verificar se é KMZ ou KML
        if (url.toLowerCase().endsWith('.kml')) {
            // Processar KML diretamente
            this.processKMLUrl(url, groupName, layerType);
        } else {
            // Processar KMZ (arquivo ZIP contendo KML)
            this.processKMZUrlArchive(url, groupName, layerType);
        }
    }
    
    // Processar URL de KML
    processKMLUrl(url, groupName, layerType) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(kmlContent => {
                // Converter KML para GeoJSON
                const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Aplicar o estilo predefinido e adicionar ao mapa
                this.addLayerToMap(geojsonData, url.split('/').pop(), groupName, layerType);
                
                // Esconder o popup de importação
                this.hideImportPopup();
            })
            .catch(error => {
                console.error('Erro ao processar URL KML:', error);
                alert(`Erro ao processar a URL: ${error.message}`);
            });
    }
    
    // Processar URL de KMZ (ZIP contendo KML)
    processKMZUrlArchive(url, groupName, layerType) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(data => {
                return JSZip.loadAsync(data);
            })
            .then(zip => {
                // Encontrar o arquivo KML principal (geralmente doc.kml)
                const kmlFile = zip.file(/\.kml$/i)[0];
                
                if (!kmlFile) {
                    throw new Error('Nenhum arquivo KML encontrado no arquivo KMZ.');
                }
                
                return kmlFile.async('string');
            })
            .then(kmlContent => {
                // Converter KML para GeoJSON
                const kmlDoc = new DOMParser().parseFromString(kmlContent, 'text/xml');
                const geojsonData = toGeoJSON.kml(kmlDoc);
                
                // Aplicar o estilo predefinido e adicionar ao mapa
                this.addLayerToMap(geojsonData, url.split('/').pop(), groupName, layerType);
                
                // Esconder o popup de importação
                this.hideImportPopup();
            })
            .catch(error => {
                console.error('Erro ao processar URL KMZ:', error);
                alert(`Erro ao processar a URL: ${error.message}`);
            });
    }
    




// Adicionar camada ao mapa com estilo predefinido
addLayerToMap(data, fileName, groupName, layerType) {
    try {
        console.log('Adicionando camada ao mapa:', {
            dados: data,
            arquivo: fileName,
            grupo: groupName,
            tipo: layerType
        });
        
        // Obter o estilo predefinido com base no tipo de camada
        const style = this.predefinedStyles[layerType] || this.predefinedStyles['default'];
        console.log('Estilo selecionado:', style);
        
        // Criar o layer GeoJSON com o estilo aplicado e ícones personalizados
        const layer = L.geoJSON(data, {
            style: style,
            
            // Método para criar pontos personalizados
            pointToLayer: (feature, latlng) => {
    console.log('Criando ponto em:', latlng);
    console.log('Propriedades da feature:', feature.properties);
    
    // Depuração detalhada das propriedades
    if (feature.properties) {
        console.log('Atributos disponíveis:', Object.keys(feature.properties));
        
        // Verificar todos os atributos e seus valores
        for (const key in feature.properties) {
            console.log(`Atributo "${key}": ${feature.properties[key]}`);
        }
    }
    
    // Verificar se é um ponto de encontro
    const isPontoEncontro = feature.properties && (
        feature.properties.tipo === 'Ponto de Encontro' || 
        feature.properties.PE || 
        (feature.properties.name && feature.properties.name.includes('PE-')) ||
        (feature.properties.Name && feature.properties.Name.includes('PE-')) ||
        (feature.properties.NAME && feature.properties.NAME.includes('PE-')) ||
        fileName.toLowerCase().includes('ponto') || 
        groupName.toLowerCase().includes('ponto')
    );
    
      const isBarragem = layerType === 'Barragem';
    
      console.log('É ponto de encontro?', isPontoEncontro, 'Nome:', feature.properties.name || feature.properties.Name || feature.properties.NAME);
      console.log('É barragem?', isBarragem);
    
    // No método pointToLayer dentro de addLayerToMap
    if (style.useCustomIcon) {
        console.log('Usando ícone personalizado');
        
        try {
            let iconUrl;
            let categoryValue = null;
            let statusValue = null;
            let acessoValue = null;
            
            // Se for para usar mapeamento de categorias (Inventário)
            if (style.useCategoryMapping && feature.properties) {
                // Código existente para determinar o ícone...
                // [Seu código atual para determinar iconUrl]
                
                // 1. Buscar o atributo "classe" (primeira prioridade)
                for (const key in feature.properties) {
                    if (key.toLowerCase() === 'classe') {
                        categoryValue = feature.properties[key];
                        console.log(`Encontrado atributo "classe" como "${key}" com valor: ${categoryValue}`);
                        break;
                    }
                }
                
                // 2. Buscar o atributo "statusentr" (segunda prioridade)
                for (const key in feature.properties) {
                    if (key.toLowerCase() === 'statusentr') {
                        statusValue = feature.properties[key];
                        console.log(`Encontrado atributo "statusentr" como "${key}" com valor: ${statusValue}`);
                        break;
                    }
                }
                
                // 3. Buscar o atributo "acesso" (terceira prioridade)
                for (const key in feature.properties) {
                    if (key.toLowerCase() === 'acesso') {
                        acessoValue = feature.properties[key];
                        console.log(`Encontrado atributo "acesso" como "${key}" com valor: ${acessoValue}`);
                        break;
                    }
                }
                
                console.log(`Valores encontrados - Classe: ${categoryValue}, Status: ${statusValue}, Acesso: ${acessoValue}`);
                
                // Aplicar a ordem de prioridade para determinar o ícone
                if (categoryValue && style.categoryMapping) {
                    // Primeira prioridade: usar o valor de "classe"
                    console.log('Tentando usar o valor de "classe"');
                    
                    if (style.categoryMapping[categoryValue]) {
                        iconUrl = style.svgBasePath + style.categoryMapping[categoryValue];
                        console.log(`Usando ícone para categoria "${categoryValue}": ${iconUrl}`);
                    } else {
                        // Tentar busca case-insensitive
                        const lowerCategoryValue = categoryValue.toLowerCase();
                        let found = false;
                        
                        for (const key in style.categoryMapping) {
                            if (key.toLowerCase() === lowerCategoryValue) {
                                iconUrl = style.svgBasePath + style.categoryMapping[key];
                                console.log(`Usando ícone para categoria "${key}" (case-insensitive): ${iconUrl}`);
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            // Se não encontrou na categoria, passar para a próxima prioridade
                            console.log(`Categoria "${categoryValue}" não encontrada no mapeamento, verificando status...`);
                        }
                    }
                }
                
                // Se não encontrou um ícone baseado em "classe", tentar com "statusentr"
                if (!iconUrl && statusValue && style.statusMapping) {
                    console.log('Tentando usar o valor de "statusentr"');
                    
                    if (style.statusMapping[statusValue]) {
                        iconUrl = style.svgBasePath + style.statusMapping[statusValue];
                        console.log(`Usando ícone para status "${statusValue}": ${iconUrl}`);
                    } else {
                        // Tentar busca case-insensitive
                        const lowerStatusValue = statusValue.toLowerCase();
                        let found = false;
                        
                        for (const key in style.statusMapping) {
                            if (key.toLowerCase() === lowerStatusValue) {
                                iconUrl = style.svgBasePath + style.statusMapping[key];
                                console.log(`Usando ícone para status "${key}" (case-insensitive): ${iconUrl}`);
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            // Se não encontrou no status, passar para a próxima prioridade
                            console.log(`Status "${statusValue}" não encontrado no mapeamento, verificando acesso...`);
                        }
                    }
                }
                
                // Se ainda não encontrou um ícone, tentar com "acesso"
                if (!iconUrl && acessoValue && style.acessoMapping) {
                    console.log('Tentando usar o valor de "acesso"');
                    
                    if (style.acessoMapping[acessoValue]) {
                        iconUrl = style.svgBasePath + style.acessoMapping[acessoValue];
                        console.log(`Usando ícone para acesso "${acessoValue}": ${iconUrl}`);
                    } else {
                        // Tentar busca case-insensitive
                        const lowerAcessoValue = acessoValue.toLowerCase();
                        let found = false;
                        
                        for (const key in style.acessoMapping) {
                            if (key.toLowerCase() === lowerAcessoValue) {
                                iconUrl = style.svgBasePath + style.acessoMapping[key];
                                console.log(`Usando ícone para acesso "${key}" (case-insensitive): ${iconUrl}`);
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            console.log(`Acesso "${acessoValue}" não encontrado no mapeamento`);
                        }
                    }
                }
                
                // Se ainda não encontrou um ícone, usar o padrão
                if (!iconUrl) {
                    iconUrl = style.svgBasePath + style.defaultSvg;
                    console.log(`Nenhum valor correspondente encontrado, usando ícone padrão: ${iconUrl}`);
                }
            } else {
                // Usar o ícone definido no estilo
                iconUrl = style.iconUrl || (style.svgBasePath + style.defaultSvg);
                console.log(`Usando ícone definido no estilo: ${iconUrl}`);
            }
            
            console.log('URL final do ícone:', iconUrl);
            
            // Usar divIcon para melhor compatibilidade
            const divIcon = L.divIcon({
                className: 'inventory-icon-container',
                html: `<img src="${iconUrl}" class="inventory-icon" style="width:${style.iconSize[0]}px; height:${style.iconSize[1]}px;" onerror="this.src='https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'; this.style.width='25px'; this.style.height='41px';">`,
                iconSize: style.iconSize || [24, 24],
                iconAnchor: style.iconAnchor || [12, 12]
            });
            
            // Criar o marcador com o divIcon
            const marker = L.marker(latlng, { icon: divIcon });
            
            
            // NOVO CÓDIGO: Adicionar label se for um ponto de encontro
if (isPontoEncontro) {
    console.log('Adicionando label para ponto de encontro');
    
    
    // Determinar o texto do label (PE ou outro identificador)
    let labelText = 'PE';
if (feature.properties.PE) {
    labelText = feature.properties.PE;
} else if (feature.properties.name && feature.properties.name.includes('PE-')) {
    // Usar o nome completo em vez de dividir
    labelText = feature.properties.name;
} else if (feature.properties.Name && feature.properties.Name.includes('PE-')) {
    labelText = feature.properties.Name;
} else if (feature.properties.NAME && feature.properties.NAME.includes('PE-')) {
    labelText = feature.properties.NAME;
} else if (feature.properties.id) {
    labelText = feature.properties.id;
} else if (feature.properties.ID) {
    labelText = feature.properties.ID;
} else if (feature.properties.numero) {
    labelText = feature.properties.numero;
}
    console.log('Texto do label:', labelText);
    
  
// Criar um elemento div para o label
const labelDiv = L.divIcon({
    className: 'pe-label',
    html: `<div class="pe-label-text">${labelText}</div>`,
    iconSize: [80, 20],  // Aumentado para acomodar textos mais longos
    iconAnchor: [38, 55]  // Centralizado horizontalmente e posicionado acima do marcador
});
    
    // Criar um marcador para o label
    const labelMarker = L.marker(latlng, { 
        icon: labelDiv, 
        zIndexOffset: 1000,  // Garantir que o label fique acima do marcador
        interactive: false   // O label não deve ser clicável
    });
    
    // Retornar um grupo de camadas contendo o marcador e o label
    return L.layerGroup([marker, labelMarker]);
}
// Adicionar label se for uma barragem
if (isBarragem && style.useLabel) {
    console.log('Adicionando label para barragem');
    
    // Determinar o texto do label procurando por atributos que começam com "Barragem" ou "Barramento"
    let labelText = null;
    
    // Procurar em todas as propriedades
    if (feature.properties) {
        for (const key in feature.properties) {
            const value = feature.properties[key];
            
            // Verificar se o valor é uma string e começa com "Barragem" ou "Barramento"
            if (typeof value === 'string' && 
                (value.startsWith('Barragem') || value.startsWith('Barramento'))) {
                labelText = value;
                console.log(`Encontrado label para barragem no atributo "${key}": ${value}`);
                break;
            }
        }
    }
    
    // Se não encontrou um valor específico, tentar usar nome/name
    if (!labelText) {
        if (feature.properties.nome) {
            labelText = feature.properties.nome;
        } else if (feature.properties.name) {
            labelText = feature.properties.name;
        } else if (feature.properties.Name) {
            labelText = feature.properties.Name;
        } else if (feature.properties.NAME) {
            labelText = feature.properties.NAME;
        } else {
            // Valor padrão se nenhum atributo adequado for encontrado
            labelText = 'Barragem';
        }
    }
    
    console.log('Texto final do label de barragem:', labelText);
    
    // Criar um elemento div para o label
    const labelDiv = L.divIcon({
        className: style.labelClass || 'barragem-label',
        html: `<div class="barragem-label-text">${labelText}</div>`,
        iconSize: [120, 20],  // Aumentado para acomodar textos mais longos
        iconAnchor: [80, 28]  // Centralizado horizontalmente e posicionado acima do marcador
    });
    
    // Criar um marcador para o label
    const labelMarker = L.marker(latlng, { 
        icon: labelDiv, 
        zIndexOffset: 1000,  // Garantir que o label fique acima do marcador
        interactive: false   // O label não deve ser clicável
    });
    
    // Retornar um grupo de camadas contendo o marcador e o label
    return L.layerGroup([marker, labelMarker]);
}

            
            // Retornar apenas o marcador se não for ponto de encontro
            return marker;
        } catch (error) {
            console.error('Erro ao criar ícone personalizado:', error);
            // Em caso de erro, usar o marcador padrão
            return L.marker(latlng);
        }
    } else {
        // Usar o marcador padrão do Leaflet
        return L.marker(latlng);
    }
},
    
            // Método para criar popups informativos
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    let popupContent = '<div class="feature-popup">';
                    
                    // Função auxiliar para encontrar uma propriedade case-insensitive
                    const findProperty = (propNames) => {
                        for (const propName of propNames) {
                            for (const key in feature.properties) {
                                if (key.toLowerCase() === propName.toLowerCase() && 
                                    feature.properties[key] !== null && 
                                    feature.properties[key] !== '') {
                                    return { key, value: feature.properties[key] };
                                }
                            }
                        }
                        return null;
                    };
                    
                    // Buscar propriedades para o título na ordem de prioridade
                    const titleProp = 
                        findProperty(['NomeEstabe']) || 
                        findProperty(['name', 'title']) || 
                        findProperty(['CLASSE', 'classe']) || 
                        findProperty(['statusentr']) || 
                        findProperty(['acesso']);
                    
                    // Adicionar o título se encontrou alguma propriedade
                    if (titleProp) {
                        popupContent += `<h3>${titleProp.value}</h3>`;
                        console.log(`Usando ${titleProp.key} como título: ${titleProp.value}`);
                    }
                    
                    // Informações de endereço - busca case-insensitive
                    const enderecoProp = findProperty(['Endereco', 'endereco']);
                    const numeroProp = findProperty(['nº_usual', 'numero', 'num']);
                    
                    if (enderecoProp) {
                        popupContent += `<p><strong>Endereço:</strong> ${enderecoProp.value}`;
                        if (numeroProp) {
                            popupContent += `, ${numeroProp.value}`;
                        }
                        popupContent += `</p>`;
                    }
                    
                    // Município - busca case-insensitive
                    const municipioProp = findProperty(['MUNICIPIO', 'municipio', 'cidade']);
                    if (municipioProp) {
                        popupContent += `<p><strong>Município:</strong> ${municipioProp.value}</p>`;
                    }
                    
                    // Tabela de propriedades
                    popupContent += '<table class="feature-properties">';
                    
                    // Lista de propriedades já mostradas (para não repetir)
                    const shownProps = new Set();
                    if (titleProp) shownProps.add(titleProp.key.toLowerCase());
                    if (enderecoProp) shownProps.add(enderecoProp.key.toLowerCase());
                    if (numeroProp) shownProps.add(numeroProp.key.toLowerCase());
                    if (municipioProp) shownProps.add(municipioProp.key.toLowerCase());
                    
                    // Lista de propriedades prioritárias (mostradas primeiro, na ordem)
                    const priorityProps = [
                        'classe', 'statusentr', 'acesso', 
                        'endereco', 'numero', 'complemento', 'bairro', 'municipio', 'uf'
                    ];
                    
                    // Primeiro mostrar as propriedades prioritárias (se não estiverem já mostradas)
                    for (const propName of priorityProps) {
                        for (const key in feature.properties) {
                            if (key.toLowerCase() === propName.toLowerCase() && 
                                !shownProps.has(key.toLowerCase()) && 
                                feature.properties[key] !== null && 
                                feature.properties[key] !== '') {
                                
                                // Formatar o nome da propriedade
                                const formattedKey = key.replace(/_/g, ' ')
                                                       .replace(/([A-Z])/g, ' $1')
                                                       .replace(/^./, str => str.toUpperCase());
                                
                                popupContent += `
                                    <tr>
                                        <th>${formattedKey}</th>
                                        <td>${feature.properties[key]}</td>
                                    </tr>
                                `;
                                
                                // Marcar como mostrada
                                shownProps.add(key.toLowerCase());
                            }
                        }
                    }
                    
                    // Depois mostrar as outras propriedades
                    for (const key in feature.properties) {
                        // Verificar se a propriedade já foi mostrada
                        if (shownProps.has(key.toLowerCase()) || 
                            feature.properties[key] === null || 
                            feature.properties[key] === '') {
                            continue;
                        }
                        
                        // Formatar o nome da propriedade
                        const formattedKey = key.replace(/_/g, ' ')
                                               .replace(/([A-Z])/g, ' $1')
                                               .replace(/^./, str => str.toUpperCase());
                        
                        popupContent += `
                            <tr>
                                <th>${formattedKey}</th>
                                <td>${feature.properties[key]}</td>
                            </tr>
                        `;
                        
                        // Marcar como mostrada
                        shownProps.add(key.toLowerCase());
                    }
                    
                    popupContent += '</table></div>';
                    
                    // Adicionar o popup à camada
                    layer.bindPopup(popupContent, {
                        maxWidth: 300,
                        className: 'inventory-popup'
                    });
                }
            }
        });
          // Verificar se é uma camada que usa marcadores SVG (como Rota de Fuga)
          if (style.useSvgMarker) {
            console.log('Detectada camada com marcadores SVG, processando linhas...');
            this.processSvgLines(layer, style);
        }
        
        // Adicionar ao grupo ou diretamente ao mapa
        if (groupName) {
            // Criar o grupo se não existir
            if (!this.layerManager.groups[groupName]) {
                this.layerManager.createGroup(groupName);
            }
            
            // Acessar o layerGroup dentro do objeto de grupo e adicionar a camada
            this.layerManager.groups[groupName].layerGroup.addLayer(layer);
            
            // Armazenar referência à camada
            const layerId = `geojson_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            this.layerManager.groups[groupName].layers[layerId] = {
                layer: layer,
                name: fileName.split('.')[0],
                type: 'geojson',
                visible: true,
                style: style // Armazenar o estilo para referência futura
            };
            
            // Atualizar a interface do gerenciador de camadas
            if (this.layerManager.refreshLayerList && typeof this.layerManager.refreshLayerList === 'function') {
                this.layerManager.refreshLayerList();
            }
        } else {
            // Adicionar diretamente ao mapa
            layer.addTo(this.map);
            
            // Adicionar ao controle de camadas
            this.layerManager.control.addOverlay(layer, fileName.split('.')[0]);
        }
        
       // Ajustar a visualização para mostrar a camada
if (layer) {
    try {
        // Criar um array para armazenar todos os pontos/limites
        const bounds = [];
        
        // Função para processar cada camada
        const processLayer = (l) => {
            if (l instanceof L.Marker) {
                // Se for um marcador, adicionar sua posição
                bounds.push(l.getLatLng());
            } else if (l instanceof L.LayerGroup || l instanceof L.FeatureGroup) {
                // Se for um grupo, processar cada camada dentro dele
                l.eachLayer(processLayer);
            } else if (typeof l.getBounds === 'function') {
                try {
                    // Se tiver getBounds, adicionar seus limites
                    const layerBounds = l.getBounds();
                    if (layerBounds.isValid()) {
                        bounds.push(layerBounds.getNorthEast());
                        bounds.push(layerBounds.getSouthWest());
                    }
                } catch (e) {
                    console.warn('Camada não tem limites válidos:', e);
                }
            }
        };
        
        // Processar a camada principal
        if (layer instanceof L.LayerGroup || layer instanceof L.FeatureGroup) {
            layer.eachLayer(processLayer);
        } else {
            processLayer(layer);
        }
        
        // Se encontramos pontos/limites, ajustar a visualização
        if (bounds.length > 0) {
            const mapBounds = L.latLngBounds(bounds);
            if (mapBounds.isValid()) {
                this.map.fitBounds(mapBounds, {
                    padding: [50, 50], // Adicionar padding para melhor visualização
                    maxZoom: 18        // Limitar o zoom máximo
                });
            }
        } else {
            console.warn('Não foi possível determinar os limites da camada');
        }
    } catch (e) {
        console.error('Erro ao ajustar a visualização do mapa:', e);
    }
}

console.log('Importação concluída com sucesso');
return layer;

    } catch (error) {
        console.error('Erro ao adicionar camada ao mapa:', error);
        alert(`Erro ao importar dados: ${error.message}`);
        return null;
    }
}


 // Fecha o método addLayerToMap()
 // Método auxiliar para adicionar a camada ao mapa ou grupo
addLayerToMapOrGroup(layer, fileName, groupName) {
    // Adicionar ao grupo ou diretamente ao mapa
    if (groupName) {
        // Criar o grupo se não existir
        if (!this.layerManager.groups[groupName]) {
            this.layerManager.createGroup(groupName);
        }
        
        // Acessar o layerGroup dentro do objeto de grupo e adicionar a camada
        this.layerManager.groups[groupName].layerGroup.addLayer(layer);
        
        // Armazenar referência à camada
        const layerId = `geojson_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.layerManager.groups[groupName].layers[layerId] = {
            layer: layer,
            name: fileName.split('.')[0],
            type: 'geojson',
            visible: true
        };
        
        // Atualizar a interface do gerenciador de camadas
        if (this.layerManager.refreshLayerList && typeof this.layerManager.refreshLayerList === 'function') {
            this.layerManager.refreshLayerList();
        }
    } else {
        // Adicionar diretamente ao mapa
        layer.addTo(this.map);
        
        // Adicionar ao controle de camadas
        this.layerManager.control.addOverlay(layer, fileName.split('.')[0]);
    }
    
    // Ajustar a visualização para mostrar a camada
    if (layer && typeof layer.getBounds === 'function') {
        try {
            this.map.fitBounds(layer.getBounds());
        } catch (e) {
            console.error('Erro ao ajustar a visualização do mapa:', e);
        }
    }
}

// Método para depuração de GeoJSON
debugGeoJSON(data, style) {
    console.log('==== DEBUG GEOJSON ====');
    console.log('Tipo de GeoJSON:', data.type);
    console.log('Número de features:', data.features ? data.features.length : 0);
    
    if (data.features && data.features.length > 0) {
        console.log('Tipos de geometria presentes:');
        const geometryTypes = {};
        
        data.features.forEach(feature => {
            const type = feature.geometry.type;
            geometryTypes[type] = (geometryTypes[type] || 0) + 1;
        });
        
        console.log(geometryTypes);
    }
    
    console.log('Estilo a ser aplicado:', style);
    console.log('==== FIM DEBUG GEOJSON ====');
}
} // Fecha a classe ImportTools

