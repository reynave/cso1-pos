import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router'; 
import { EdcDetailComponent } from './edc-detail/edc-detail.component';
// export class Hero {

//   constructor( 
//     public com: string,
//     public power: string, 
//   ) {  } 
// }
@Component({
  selector: 'app-edc',
  templateUrl: './edc.component.html',
  styleUrls: ['./edc.component.css']
})
export class EdcComponent implements OnInit {
  items :any = []; 
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute, 
    private router : Router,
  ) {
  }
  ngOnInit(): void {
      this.httpGet();
  }

  httpGet(){
    this.http.get<any>(environment.api+"edc/index",{
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
  open(item: any){
    const modalRef = this.modalService.open(EdcDetailComponent,{size:'lg'});
		modalRef.componentInstance.item = item;
  }
}
