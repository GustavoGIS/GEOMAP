import BaseMap from './lib/base-map.js';
import MeasureTools from './lib/measure-tools.js';
import MarkerTools from './lib/marker-tools.js';
import LayerManager from './lib/layer-manager.js';
import Sidebar from './lib/sidebar/Sidebar.js';
import ImportTools from './lib/import-tools.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c GEOMAP 2.0 ', 'background: #4285F4; color: white; font-size: 24px; font-weight: bold; padding: 10px;');
    console.log('%c Desenvolvido por Gustavo Matida ', 'color: #34A853; font-size: 16px; font-weight: bold;');
    console.log('%c © 2025 - Todos os direitos reservados ', 'color: #5F6368; font-size: 12px;');
    console.log('%c                                                             ', 'color: #5F6368; font-size: 12px;');
    try {
        // Inicialização do mapa
        const map = new BaseMap('map');

        // Verificar se o controle de camadas existe
        console.log('Layer control:', map.layerControl);

        // Criar uma instância do LayerManager com o controle de camadas correto
        const layerManager = new LayerManager({
          map: map.map,
          layerControl: map.layerControl || L.control.layers({}, {}).addTo(map.map)
        });

        // Adicionar um grupo padrão para marcadores
        layerManager.createGroup('Marcadores');
        
        // Criar uma única instância do MarkerTools e passar o layerManager
        const markerTools = new MarkerTools(map.map, layerManager);
        
        // Criar uma única instância do MeasureTools
        const measureTools = new MeasureTools(map.map);
        
        // Sidebar e botões
        const sidebar = new Sidebar(map.map);
        
        // Botão de medição com toggle
        const measureButton = sidebar.addButton({
            icon: 'fas fa-ruler',
            tooltip: 'Ferramentas de Medição',
            onClick: (e) => {
                // Impedir que o evento de clique se propague para o documento
                e.stopPropagation();
                
                // Toggle do estado ativo do botão
                measureButton.toggleActive();
                
                // Toggle do popup
                measureTools.togglePopup(e.currentTarget);
            }
        });
        
        // Adicionar atributo data-tool para identificar o botão
        measureButton.element.setAttribute('data-tool', 'measure');

        // Botão de adicionar marcador
        const markerButton = sidebar.addButton({
            icon: 'fas fa-map-marker-alt',
            tooltip: 'Adicionar marcador',
            onClick: () => {
                console.log('Botão de marcador clicado');
                markerTools.startAddMarker();
            }
        });

        // Adicionar atributo data-tool para identificar o botão
        markerButton.element.setAttribute('data-tool', 'marker');
        
        // Botão de camadas com toggle
        const layerButton = sidebar.addButton({
            icon: 'fas fa-layer-group',
            tooltip: 'Camadas',
            onClick: (e) => {
                // Impedir que o evento de clique se propague para o documento
                e.stopPropagation();
                
                // Toggle do estado ativo do botão
                layerButton.toggleActive();
                
                // Toggle do painel de camadas
                const isActive = layerManager.toggleLayerPanel();
                
                // Atualizar estado do botão para corresponder ao estado do painel
                if (isActive) {
                    layerButton.setActive(true);
                } else {
                    layerButton.setActive(false);
                }
            }
        });
        
        // Adicionar atributo data-tool para identificar o botão
        layerButton.element.setAttribute('data-tool', 'layers');

        // Botão de selecionar feição
        sidebar.addButton({
            icon: 'fas fa-mouse-pointer',
            tooltip: 'Selecionar Feição',
            onClick: () => {
                console.log('Selecionar Feição - funcionalidade a ser implementada');
            }
        });

        // Botão de personalizar
        sidebar.addButton({
            icon: 'fas fa-palette',
            tooltip: 'Personalizar',
            onClick: () => {
                console.log('Personalizar - funcionalidade a ser implementada');
            }
        });

        const importTools = new ImportTools(map.map, layerManager);

// Modificar o botão de importar
sidebar.addButton({
    icon: 'fas fa-file-import',
    tooltip: 'Importar',
    onClick: () => {
        console.log('Iniciando importação');
        importTools.startImport();
    }
});

        // Botão de exportar
        sidebar.addButton({
            icon: 'fas fa-file-export',
            tooltip: 'Exportar',
            onClick: () => {
                console.log('Exportar - funcionalidade a ser implementada');
            }
        });

    } catch (error) {
        console.error("Erro na inicialização:", error);
        alert("Erro ao carregar mapa: " + error.message);
    }
});
