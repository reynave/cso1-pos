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
  logs : any;
  loading : boolean = false;
  history : any = [];
  constructor(
    private http:HttpClient,
    private configService : ConfigService,
  ){}


  ngOnInit(): void {
      this.httpGet();
  }

  httpGet(){
    this.http.get<any>(environment.api+'bulkInsert').subscribe(
      data=>{
        this.loading = false;
        console.log(data);
        this.history = data['items'];
      },
      error=>{
        this.loading = false;
        console.log(error);
      }
    )
  }

  onSyncItem(){
    this.loading = true;
    this.http.get<any>(environment.api+"bulkInsert/items").subscribe(
      data=>{
        this.loading = false;
        console.log(data);
        this.logs = data;
        this.httpGet();
      },
      error=>{
        this.loading = false;
        this.logs = error.message;
        console.log(error);
        this.httpGet();
      }
    )
  
  }

  back(){
    history.back();
  }
}
