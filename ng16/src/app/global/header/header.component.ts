import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  @Input() item = ''; // decorate the property with @Input()
  
  account : any = []
  terminalId : any;
  kioskUuid : any;
  constructor(
    private configService : ConfigService,
    private router: Router,
  ){}
  ngOnInit() {
    this.account = this.configService.account();
    this.kioskUuid = localStorage.getItem("kioskUuid");
    if( this.configService.account()['exp'] < Math.floor(new Date().getTime()/1000.0)){
      console.log('logout');
      this.configService.removeToken().subscribe(
        ()=>{
          this.router.navigate(['relogin']);
        }
      )
    }

    if(localStorage.getItem("terminalId") == undefined || localStorage.getItem("terminalId") == "") {
      this.router.navigate(['setup']);
    }else{  this.terminalId = localStorage.getItem("terminalId");  }

  }

  logout(){
    if(confirm("Logout this POS ?")){
      this.configService.removeToken().subscribe(
        ()=>{
          this.router.navigate(['relogin']);
        }
      )
    }
  }

}
