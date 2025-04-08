export default class BaseMap {
    constructor(containerId) {
        // Verificação extra do container
        if (!document.getElementById(containerId)) {
            throw new Error(`Container #${containerId} não encontrado!`);
        }

        // Inicialização do mapa com maxZoom aumentado
        this.map = L.map(containerId, {
            center: [-14.235, -51.925],
            zoom: 4,
            zoomControl: false,
            scaleControl: false,
            maxZoom: 24  // Aumentar o zoom máximo permitido (valor padrão é geralmente 18 ou 19)
        });

        // Camadas base com maxZoom aumentado
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 24  // Aumentar o zoom máximo para esta camada
        });
        
        const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 24  // Aumentar o zoom máximo para esta camada
        });
        
        const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap',
            maxZoom: 24  // Aumentar o zoom máximo para esta camada
        });
        
        // Adiciona a camada de satélite como padrão
        satellite.addTo(this.map);

        // Controle de camadas
        this.layerControl = L.control.layers({
            "Mapa": osm,
            "Satélite": satellite,
            "Relevo": terrain
        }, null, { position: 'bottomright' }).addTo(this.map);

        // Controle de escala (apenas em km)
        L.control.scale({ 
            position: 'bottomleft',
            imperial: false, // Desativa milhas (mostra apenas km)
            metric: true,    // Ativa km (opcional, já é true por padrão)
            maxWidth: 200    // Largura máxima da escala
        }).addTo(this.map);

        // Controle de zoom personalizado
        L.control.zoom({ position: 'topleft' }).addTo(this.map)



    }
}
