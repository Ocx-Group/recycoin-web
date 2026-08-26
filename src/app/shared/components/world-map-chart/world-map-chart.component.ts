import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';

import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

export interface CountryData {
  Title: string;
  Value: number;
  Lat: number;
  Lng: number;
}

@Component({
  selector: 'app-world-map-chart',
  templateUrl: './world-map-chart.component.html',
  styleUrls: ['./world-map-chart.component.scss'],
  standalone: true,
  imports: [NgxEchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideEchartsCore({
      echarts: () => import('echarts')
    })
  ]
})
export class WorldMapChartComponent implements OnInit, OnChanges {
  constructor(private cdr: ChangeDetectorRef) {}

  @Input() countries: CountryData[] = [];
  @Input() height: string = '400px';
  @Input() seriesName: string = 'Afiliados por País';

  public mapChartOption: EChartsOption = {};
  private mapLoaded = false;

  async ngOnInit() {
    await this.loadWorldMap();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mapLoaded && changes['countries']) {
      this.updateChart();
    }
  }

  private async loadWorldMap() {
    try {
      const worldJson = await fetch('assets/data/world.json').then(res => res.json());
      echarts.registerMap('world', worldJson);
      this.mapLoaded = true;
      // Llega despues de un await fetch: con OnPush hay que marcar.
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading world map:', error);
    }
  }

  private updateChart() {
    if (!this.countries || this.countries.length === 0) {
      return;
    }

    const scatterData = this.countries.map(item => ({
      name: item.Title,
      value: [item.Lng, item.Lat, item.Value],
      itemStyle: {
        color: '#4a90e2'
      }
    }));

    this.mapChartOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.data) {
            return `<strong>${params.data.name}</strong><br/>Cantidad: ${params.data.value[2]}`;
          }
          return params.name;
        }
      },
      geo: {
        map: 'world',
        roam: true,
        itemStyle: {
          areaColor: '#e0e0e0',
          borderColor: '#666666'
        },
        emphasis: {
          itemStyle: {
            areaColor: '#b8c5d6'
          }
        }
      },
      series: [
        {
          name: this.seriesName,
          type: 'scatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: (val: any) => {
            return Math.max(Math.sqrt(val[2]) * 2, 10);
          },
          label: {
            show: true,
            formatter: (params: any) => params.data.value[2],
            position: 'inside',
            color: '#ffffff',
            fontWeight: 'bold',
            textBorderColor: '#000000',
            textBorderWidth: 2
          },
          itemStyle: {
            color: '#4a90e2',
            borderColor: '#2c5aa0',
            borderWidth: 2
          },
          emphasis: {
            itemStyle: {
              color: '#5fb3f6',
              borderColor: '#2c5aa0'
            }
          }
        }
      ]
    };
  }
}

