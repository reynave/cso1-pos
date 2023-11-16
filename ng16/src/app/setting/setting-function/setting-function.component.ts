import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-setting-function',
  templateUrl: './setting-function.component.html',
  styleUrls: ['./setting-function.component.css']
})
export class SettingFunctionComponent implements OnInit { 
 
  items : any = [];
  saveFunc: any = [];
  constructor(
    private http : HttpClient,
    private configService : ConfigService,
  ) { 
  }
  
  ngOnInit(): void {
    this.http.get<any>(environment.api+'func/index',{
      headers:this.configService.headers(),
    }).subscribe(
      data =>{
        this.items = data['items'];
        console.log(data);
      }
    )
  }
  back() {
    history.back()
  }

 

  save() {  
    const body = {
      items : this.items,
    }
    this.http.post<any>(environment.api+"func/saveFunc",body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
      },
      error =>{
        console.log(error);
      }
    )

  }
}
