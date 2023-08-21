import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/service/config.service';

@Component({
  selector: 'app-relogin',
  templateUrl: './relogin.component.html',
  styleUrls: ['./relogin.component.css']
})
export class ReloginComponent {
  constructor(
    private configService: ConfigService, 
    private router: Router, 
  ) { }
  goToLogin(){
    this.configService.removeToken().subscribe(
      ()=>{
        this.router.navigate(['login']);
      }
    )
  
  }
}
