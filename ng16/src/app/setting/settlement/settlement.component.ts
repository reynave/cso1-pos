import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router'; 

@Component({
  selector: 'app-settlement',
  templateUrl: './settlement.component.html',
  styleUrls: ['./settlement.component.css']
})
export class SettlementComponent implements OnInit {
  items :any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute, 
    private router : Router,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
      this.httpGet();
  }

  httpGet(){
    this.http.get<any>(environment.api+"settlement/index",{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        this.items = data['items'];
      },
      error=>{
        console.log(error);
      }
    )
  }

  onSetSettlement(){
    const body = {
      terminalId : localStorage.getItem("terminalId"),
    }
    const host: string =  location.origin;
    this.http.post<any>(environment.api+"settlement/onSetSettlement", body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data); 
        this.httpGet();  
        window.open(host+'/#/setting/settlement/print?id='+data['id'], '_blank'); 
      },
      error=>{
        console.log(error);
      }
    )
  }

  back(){
    history.back();
  }

}
