import { LogoService } from '@app/core/service/logo-service/logo.service';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: []
})
export class LogoComponent implements OnInit, OnDestroy {
  logoSrc: string;
  @Input() logoClass: string = '';
  private subscription: Subscription;

  constructor(private logoService: LogoService) {
    this.subscription = this.logoService.logoSrc$.subscribe(src => {
      this.logoSrc = src;
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
