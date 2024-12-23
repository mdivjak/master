import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-gpx';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit{
  @Input() gpxContent!: string;
  private map!: L.Map;

  constructor() {}

  async ngOnInit() {}
  
  ngAfterViewInit(): void {
    this.initializeMap();
    this.loadGpxContent(this.gpxContent);
  }

  initializeMap(): void {
    this.map = L.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  loadGpxContent(gpxContent: string): void {
    const gpxLayer = new L.GPX(gpxContent, {
      async: true,
      marker_options: undefined
    }).on('loaded', (e: any) => {
      this.map.fitBounds(e.target.getBounds());
    }).addTo(this.map);
  }
}
