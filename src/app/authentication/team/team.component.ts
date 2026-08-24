import {Component} from '@angular/core';


@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.scss'],
    standalone: true,
    imports: []
})
export class TeamComponent {
  teamMembers = [
    {
      name: 'BOUAMAMA OUKKAL',
      role: 'DIRECTOR DE TECNOLOGIA',
      subRole: 'CREADOR – RECYCOIN',
      description: 'Empresario de origen árabe de gran trayectoria, Creador del Token RecyCoin, experto en Tokens de Gobernanza. Apasionado de los Mercados Financieros y Bienes Raíces.',
      linkedin: 'https://linkedin.com/in/bouamama-oukkal-b195a1304',
      image: 'assets/images/team/team2.jpeg',
    },
    {
      name: 'ALVARO RODRIGUEZ',
      role: 'FUNDADOR – RECYCOIN',
      subRole: 'CEO',
      description: 'Amante del Medio Ambiente y de los Negocios Sostenibles. Visionario del Proyecto Empresarial OCX Group, compañía madre de Token RecyCoin y proyecto EcoMadera Resort.',
      linkedin: 'https://linkedin.com/in/alvaro-rodriguez-vega-694394333',
      image: 'assets/images/team/team1.jpeg',
    }
  ];

  openNewTab(event: Event, url: string) {
    event.preventDefault();
    window.open(url, '_blank')
  }
}
