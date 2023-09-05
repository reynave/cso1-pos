import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.css']
})
export class ParkingComponent implements OnInit {
  loading : boolean = false;
  items : any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.httpGet();
  }

  httpGet(){
    this.http.get<any>(environment.api + "parking/index", {
      headers: this.configService.headers(), 
    }).subscribe(
      data => {
        console.log(data); 
        this.items = data['items'];
      },
      error => {
        console.log(error);
      }
    );
  }

  setCart(x : any){
    console.log(x); 
  }

  back(){
    history.back();
  }
}
