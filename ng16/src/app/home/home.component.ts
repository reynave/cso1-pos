import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  parking: any = [];
  parkingTotal: number = 0;
  env: any = environment;
  cashIn: number = 0;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
    private activeRouter : ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.httpGet();
    this.httpParking();
    this.sendReload();
  }

  httpGet() {
    this.http.get<any>(environment.api + "home/start", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.cashIn = data['cashIn'];
      },
      error => {
        console.log(error);
      }
    );
  }

  httpParking() {
    this.http.get<any>(environment.api + "parking/index", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.parkingTotal = data['parkingTotal'];
        this.parking = data['items'];
      },
      error => {
        console.log(error);
      }
    );
  }

  getKioskUuid() {
    const body = {
      terminalId: localStorage.getItem("terminalId"),
    }
    if (this.cashIn > 0) {
 
      this.http.post<any>(environment.api + "KioskUuid/getKioskUuid", body, {
        headers: this.configService.headers(),
      }).subscribe(
        data => {
          console.log(data);
          this.router.navigate(["cart"], { queryParams: { kioskUuid: data['id'] } });
          this.httpParking()
        },
        error => {
          console.log(error);
        }
      );
    }else{
      alert("Please input begining balance!");
      this.router.navigate(['./setting/balance/cashIn']);
    }
  }

  setCart(x: any) {
    console.log(x);
    this.configService.setKioskUuid(x.kioskUuid).subscribe(
      data => {
        console.log(data);
        this.router.navigate(['cart'], { queryParams: { kioskUuid: x.kioskUuid } });
      }
    )
  }

  sendReload() {
    const msg = {
      to: 'visitor',
      msg: 'welcome',
      action: 'home',
    }
    this.configService.sendMessage(msg);
    console.log("sendReload");
  }
}
