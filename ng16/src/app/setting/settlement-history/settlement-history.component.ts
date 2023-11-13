import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settlement-history',
  templateUrl: './settlement-history.component.html',
  styleUrls: ['./settlement-history.component.css']
})
export class SettlementHistoryComponent implements OnInit {
  items: any = []; 
  api : string = environment.api;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit() { 
    this.httpGet();
  }
  httpGet() {
    this.http.get<any>(environment.api + "settlement/history", {
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

  back(){
    history.back();
  }


  
}
