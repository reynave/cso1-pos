import { Component } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {

  constructor(
    private configService : ConfigService,
    private http : HttpClient,
    private router : Router
  ){}

  back(){
    history.back();
  }

  endOfDay(){ 
    const body = {
      terminalId: localStorage.getItem("terminalId")
    }
    this.http.post<any>(environment.api+"home/endOfday", body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
      },
      error=>{
        console.log(error);
      }
    )

    if(confirm("END OF DAY this POS ?")){
      this.configService.removeToken().subscribe(
        ()=>{
          this.router.navigate(['relogin']);
        }
      )
    } 
  }
}
