import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-balance-cash-in',
  templateUrl: './balance-cash-in.component.html',
  styleUrls: ['./balance-cash-in.component.css']
})
export class BalanceCashInComponent implements OnInit {
  items: any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
    this.httpGet();
  }

  httpGet() {
    this.http.get<any>(environment.api + "balance/index", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.items = data['items'];
      },
      error => {
        console.log(error);
      }
    )
  }
  cashIn: number = 0;
  onCashIn() {
    if (this.cashIn > 0) {


      const body = {
        cashIn: this.cashIn,
        terminalId : localStorage.getItem("terminalId"),
      }

      this.http.post<any>(environment.api + "balance/onCashIn", body, {
        headers: this.configService.headers(),
      }).subscribe(
        data => {
          console.log(data);
          this.httpGet();
          this.cashIn = 0;
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  back(){
    history.back();
  }
}
