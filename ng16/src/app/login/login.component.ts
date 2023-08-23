import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../service/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy { 
  @ViewChild('formRow') rows: ElementRef | any;
  cashierId : any  =  "";
  

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router, 
  ) { }
  ngOnInit(): void {
   
    if( this.configService.getToken() != null ){
       this.router.navigate(['home'])
    } 

    console.log( this.configService.getToken() )
    this.callHttpServer();
  }
  callServer: any;
  callHttpServer() {
    this.callServer = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }
  ngOnDestroy() {
    clearInterval(this.callServer);
  //  this._docSub.unsubscribe();
  }
  note : string = "";
  scanner(){
    this.note="";
    console.log(this.cashierId);
    const body = {
      id : this.cashierId,
    }
    this.http.post<any>(environment.api+"login/auth", body).subscribe(
      data=>{
        console.log(data);
        if(data['error'] === false){
          this.configService.setToken(data['jwtToken']).subscribe(
            ()=>{
              this.router.navigate(['home']);
            }
          )
        }else{
          this.cashierId= "";
          this.note = data['note'];
        }
      },
      error=>{
        console.log(error);
      }
    )
  }
}
