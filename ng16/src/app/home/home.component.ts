import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  parking : any = [];
  constructor(
    private configService: ConfigService,
    private http: HttpClient, 
    private router : Router
  ) { }

  ngOnInit(): void {
      this.httpParking();
  }
  httpParking(){
    this.http.get<any>(environment.api + "parking/index", {
      headers: this.configService.headers(), 
    }).subscribe(
      data => {
        console.log(data); 
        this.parking = data['items'];
      },
      error => {
        console.log(error);
      }
    );
  }
  getKioskUuid(){
    const body = {
      terminalId : localStorage.getItem("terminalId"),
    }
    this.http.post<any>(environment.api + "KioskUuid/getKioskUuid", body, {
      headers: this.configService.headers(), 
    }).subscribe(
      data => {
        console.log(data); 
        this.router.navigate(["cart"],{queryParams:{kioskUuid:data['id']}});
        this.httpParking()
      },
      error => {
        console.log(error);
      }
    );
  }
  setCart(x : any){
    console.log(x);
    this.configService.setKioskUuid(x.kioskUuid).subscribe(
      data=>{
        console.log(data); 
        this.router.navigate(['cart'],{ queryParams: { kioskUuid : x.kioskUuid}});
      }
    )
  }
}
