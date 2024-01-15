import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit {
  logs: any;
  loading: boolean = false;
  history: any = [];

  runTime: any;
  t : number = 0;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) { }


  ngOnInit(): void {
    this.httpGet();
  }

  httpGet() {
    clearInterval(this.runTime);
    this.http.get<any>(environment.api + 'bulkInsert').subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.history = data['items'];
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    )
  }
  onSyncMember() {
    this.loading = true;
    this.logs = [];
    this.timer();
    this.http.get<any>(environment.api + "bulkInsert/member").subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.logs = data;
        this.httpPost(data);
      },
      error => {
        this.loading = false;
        this.logs = error.message;
        console.log(error);
        this.httpGet();
      }
    )

  }

  onSyncItem() {
    this.loading = true;
    this.logs = [];
    this.timer();
    this.http.get<any>(environment.api + "bulkInsert/items").subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.logs = data;
        this.httpPost(data);
      },
      error => {
        this.loading = false;
        this.logs = error.message;
        console.log(error);
        this.httpGet();
      }
    )

  }
 
  onSyncBarcode() {
    this.loading = true;
    this.logs = [];
    this.timer();
    this.http.get<any>(environment.api + "bulkInsert/barcode").subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.logs = data;
        this.httpPost(data);
      },
      error => {
        this.loading = false;
        this.logs = error.message;
        console.log(error);
        this.httpGet();
      }
    )

  }

  onSyncVoucher() {
    this.loading = true;

    this.http.get<any>(environment.api + "bulkInsert/onSyncVoucher").subscribe(
      data => {
        this.loading = false;
        console.log(data);
        // this.logs = data;
        //  this.httpGet();
      },
      error => {
        //  this.loading = false;
        this.logs = error.message;
        console.log(error);
        // this.httpGet();
      }
    )

  }

  onSyncPromo() {
    this.loading = true;
    this.logs = [];
    this.timer();
    this.http.get<any>(environment.api + "bulkInsert/promo").subscribe(
      data => {
        this.loading = false;
        console.log(data);
        this.logs = data;
        this.httpPost(data);
      },
      error => {
        this.loading = false;
        this.logs = error.message;
        console.log(error);
        this.httpGet();
      }
    )

  }


  httpPost(data:any){ 
    const body = {
      data : data,
      t : this.t,
    }
    console.log(body);
    this.http.post<any>(environment.api + "bulkInsert/updateTimer",body, {
      headers : this.configService.headers(),
    }).subscribe(
      data => { 
        console.log(data);
        this.httpGet();
      },
      error => { 
        console.log(error);
        this.httpGet();
      }
    )
  }

  back() {
    history.back();
  }



  timer(){ 
    this.t= 0;
    this.runTime = setInterval(() => { 
       this.t++;
    }, 1000); 
   
  }
}
