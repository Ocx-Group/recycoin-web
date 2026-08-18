import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, NgClass, CommonModule} from "@angular/common";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {WalletService} from "../../core/service/wallet-service/wallet.service";

interface CommissionData {
  affiliateId: string;
  affiliateName: string;
  amount: number;
  percentage: number;
  amountToPay: number;
  status: string;
  paymentDate?: string;
}

@Component({
  selector: 'app-calculated-commissions',
  templateUrl: './calculated-commissions.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    NgClass,
    NgbPagination
  ]
})
export class CalculatedCommissionsComponent implements OnInit {
  // Campos de filtro
  commissionType: string = 'residual'; // 'residual' o 'pasivo'
  selectedMonth: number;
  selectedYear: number;
  availableYears: number[] = [];
  calculationMode: string = 'simulate'; // 'simulate' o 'final'
  startDate: string;
  endDate: string;

  // Control de carga y datos
  isLoading: boolean = false;
  showTable: boolean = false;
  commissionsData: CommissionData[] = [];

  // Paginación
  page: number = 1;
  pageSize: number = 10;

  months: { value: number, label: string }[] = [
    {value: 1, label: 'Enero'},
    {value: 2, label: 'Febrero'},
    {value: 3, label: 'Marzo'},
    {value: 4, label: 'Abril'},
    {value: 5, label: 'Mayo'},
    {value: 6, label: 'Junio'},
    {value: 7, label: 'Julio'},
    {value: 8, label: 'Agosto'},
    {value: 9, label: 'Septiembre'},
    {value: 10, label: 'Octubre'},
    {value: 11, label: 'Noviembre'},
    {value: 12, label: 'Diciembre'}
  ];

  constructor(private walletService: WalletService) {
    // Inicializar con el mes anterior
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    this.selectedMonth = lastMonth.getMonth() + 1;
    this.selectedYear = lastMonth.getFullYear();

    // Generar años disponibles (por ejemplo, últimos 5 años hasta el actual)
    const currentYear = today.getFullYear();
    for (let i = 0; i < 5; i++) {
      this.availableYears.push(currentYear - i);
    }
  }

  ngOnInit() {
    this.updateDateRange();
  }

  onMonthChange() {
    this.updateDateRange();
  }

  onYearChange() {
    this.updateDateRange();
  }

  updateDateRange() {
    const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0);

    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isMonthDisabled(monthValue: number): boolean {
    // Eliminar las restricciones - permitir seleccionar cualquier mes
    return false;
  }

  consultCommissions() {
    this.isLoading = true;
    this.showTable = false;

    // Simular llamada al backend
    setTimeout(() => {
      // Datos de ejemplo (aquí deberías llamar al servicio real)
      this.commissionsData = this.generateMockData();
      this.isLoading = false;
      this.showTable = true;
    }, 1500);
  }

  generateMockData(): CommissionData[] {
    // Datos de ejemplo
    const data: CommissionData[] = [];
    for (let i = 1; i <= 25; i++) {
      data.push({
        affiliateId: `AF${1000 + i}`,
        affiliateName: `Usuario ${i}`,
        amount: Math.random() * 1000 + 100,
        percentage: this.calculationMode === 'simulate' ? 100 : 4,
        amountToPay: 0,
        status: this.calculationMode === 'simulate' ? 'Simulado' : 'Calculado',
        paymentDate: this.calculationMode === 'final' ? this.endDate : undefined
      });
      data[i - 1].amountToPay = data[i - 1].amount * (data[i - 1].percentage / 100);
    }
    return data;
  }

  getTotalAmount(): number {
    return this.commissionsData.reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalToPay(): number {
    return this.commissionsData.reduce((sum, item) => sum + item.amountToPay, 0);
  }

  exportToExcel() {
    Swal.fire({
      title: 'Exportar',
      text: 'Función de exportación en desarrollo',
      icon: 'info'
    }).then();
  }
}
