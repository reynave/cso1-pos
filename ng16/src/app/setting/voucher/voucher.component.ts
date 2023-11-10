import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css']
})
export class VoucherComponent  implements OnInit{
  items : any = [];
  constructor(
    private http: HttpClient,
    private configService : ConfigService,
  ){}
  ngOnInit() {
      this.httpGet();
  }
  back(){
    history.back();
  }
  httpGet(){
    this.http.get<any>(environment.api+"voucher/index",{
      headers:this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        this.items = data['items']
      }
    );
  }
}
