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
        this.item = data['item'];
      },
      error => {
        console.log(error);
      }
    )
  }

}
