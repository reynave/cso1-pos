import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settlement-print',
  templateUrl: './settlement-print.component.html',
  styleUrls: ['./settlement-print.component.css']
})
export class SettlementPrintComponent implements OnInit {
  item: any = [];
  id: string = "";
  balance : any = [];

  cso1_transaction : any = [];
  cso2_settlement : any = [];
  cso2_balance : any = [];
   
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.httpGet();
  }
  httpGet() {
    this.http.get<any>(environment.api + "settlement/print", {
      headers: this.configService.headers(),
      params: {
        id: this.id,
      }
    }).subscribe(
      data => {
        console.log(data);
        this.cso1_transaction = data['cso1_transaction'];
        this.cso2_settlement = data['cso2_settlement'];
        this.cso2_balance = data['cso2_balance']; 
      },
      error => {
        console.log(error);
      }
    )
  }

}
