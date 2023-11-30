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
import { PrintingComponent } from './printing/printing.component';
import { SettingComponent } from './setting/setting.component';
import { PrintingHistoryComponent } from './printing/printing-history/printing-history.component';
import { SettlementComponent } from './setting/settlement/settlement.component';
import { SettlementPrintComponent } from './setting/settlement-print/settlement-print.component';
import { BalanceCashInComponent } from './setting/balance-cash-in/balance-cash-in.component';
import { SettlementHistoryComponent } from './setting/settlement-history/settlement-history.component';
import { VisitorComponent } from './visitor/visitor.component';
import { ThemesComponent } from './themes/themes.component';
import { SettingFunctionComponent } from './setting/setting-function/setting-function.component';
import { RefundComponent } from './refund/refund.component';
import { RefundTicketHistoryComponent } from './refund/refund-ticket-history/refund-ticket-history.component';
import { VoucherComponent } from './setting/voucher/voucher.component';
import { PrintfComponent } from './printing/printf/printf.component';
import { SyncComponent } from './setting/sync/sync.component';
import { ConfigurationComponent } from './setting/configuration/configuration.component';

const routes: Routes = [
  { path: "", component: HomeComponent, data: { active: "home" },  canActivate:[authGuard]  }, 
  { path: "home", component: HomeComponent, data: { active: "home" },  canActivate:[authGuard]  }, 

  { path: "visitor", component: VisitorComponent, data: { active: "" },  canActivate:[]  }, 
  { path: "login", component: LoginComponent, data: { active: "" },  canActivate:[]  }, 
  { path: "relogin", component: ReloginComponent, data: { active: "" },  canActivate:[]  }, 

  { path: "cart", component: CartComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setup", component: SetupComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "parking", component: ParkingComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "refund", component: RefundComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "refund/ticketHistory", component: RefundTicketHistoryComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  
  { path: "payment", component: PaymentComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "printing", component: PrintingComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "printf", component: PrintfComponent, data: { active: "" },  canActivate:[authGuard]  }, 

  { path: "printing/history", component: PrintingHistoryComponent, data: { active: "" },  canActivate:[authGuard]  }, 

  { path: "setting", component: SettingComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/sync", component: SyncComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/configuration", component: ConfigurationComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  
  { path: "setting/settlement", component: SettlementComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/settlement/print", component: SettlementPrintComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/settlement/history", component: SettlementHistoryComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/function", component: SettingFunctionComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "setting/voucher", component: VoucherComponent, data: { active: "" },  canActivate:[authGuard]  }, 
 
  { path: "setting/balance/cashIn", component: BalanceCashInComponent, data: { active: "" },  canActivate:[authGuard]  }, 
  { path: "themes", component: ThemesComponent, data: { active: "" }  }, 
 
  { path: "**", component: NotFoundComponent, data: { active: "404" },  canActivate:[]  }, 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
