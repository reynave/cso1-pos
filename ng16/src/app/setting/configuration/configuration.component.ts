import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  items: any = [];
  note : string = "";
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) { }

  ngOnInit(): void {
    this.httpGet();
  }

  httpGet() {
    this.http.get<any>(environment.api + "configuration/index",{
      headers: this.configService.headers()
    }).subscribe(
      data=>{
        this.items = data['items'];
        console.log(data);
      },
      error=>{
        console.log(error);
      }
    )
  }

  onUpdate(){
    this.note = "Update...";
    this.http.post<any>(environment.api+"configuration/onUpdate",this.items,{
      headers : this.configService.headers()
    }).subscribe(
      data=>{
        this.note = "Update Success ";
        console.log(data);
      },
      error=>{
        this.note = "Error Save ";
        console.log(error);
      }
    )

  }
  back() {
    history.back();
  }
}
