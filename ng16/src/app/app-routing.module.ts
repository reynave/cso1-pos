import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authGuard } from './service/auth.guard';
import { CartComponent } from './cart/cart.component';
import { ReloginComponent } from './login/relogin/relogin.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SetupComponent } from './setup/setup.component';
import { ParkingComponent } from './parking/parking.component';
import { PaymentComponent } from './payment/payment.component';

const routes: Routes = [
  { path: "", component: HomeComponent, data: { active: "home" },  canActivate:[authGuard]  }, 
  { path: "home", component: HomeComponent, data: { active: "home" },  canActivate:[authGuard]  }, 
 
  { path: "login", component: LoginComponent, data: { active: "" },  canActivate:[]  }, 
  { path: "relogin", component: ReloginComponent, data: { active: "" },  canActivate:[]  }, 
  { path: "cart", component: CartComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setup", component: SetupComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "parking", component: ParkingComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "payment", component: PaymentComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  
  { path: "**", component: NotFoundComponent, data: { active: "404" },  canActivate:[]  }, 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
