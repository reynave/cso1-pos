import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router'; 

@Component({
  selector: 'app-promo-fixed',
  templateUrl: './promo-fixed.component.html',
  styleUrls: ['./promo-fixed.component.css']
})
export class PromoFixedComponent implements OnInit {
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
    this.http.get<any>(environment.api+"promoFixed/index",{
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

  back(){
    history.back();
  }

  fnCheck(x:any){
    console.log(x);
    if(x.status == '1'){
      x.status  = '0';
    }
    else if(x.status == '0'){
      x.status  = '1';
    }
    
    const body = {
      item : x, 
    }
    this.http.post<any>(environment.api+"PromoFixed/fnCheck", body,{
      headers : this.configService.headers()
    }).subscribe(
      data=>{
        console.log(data);
      },
      error=>{
        console.log(error)
      }
    )
  }

  note : string = "";
  fnSave(){
    this.note = '';
    const body = {
      items : this.items, 
    }
    this.http.post<any>(environment.api+"PromoFixed/fnSave", body,{
      headers : this.configService.headers()
    }).subscribe(
      data=>{
        this.note = 'Update Done.';
        console.log(data);
      },
      error=>{
        console.log(error)
      }
    )
  }
}
