import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';
import { CartComponent } from './cart/cart.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { ReloginComponent } from './login/relogin/relogin.component';
import { HeaderComponent } from './global/header/header.component';
import { SetupComponent } from './setup/setup.component';
import { ParkingComponent } from './parking/parking.component';
import { Widget1Component } from './global/widget1/widget1.component';
import { ItemsComponent } from './items/items.component';
import { CartDetailComponent } from './cart/cart-detail/cart-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { PrintingComponent } from './printing/printing.component';
import { SettingComponent } from './setting/setting.component';
import { PrintingHistoryComponent } from './printing/printing-history/printing-history.component';
import { SettlementComponent } from './setting/settlement/settlement.component';
import { SettlementPrintComponent } from './setting/settlement-print/settlement-print.component';
import { BalanceCashInComponent } from './setting/balance-cash-in/balance-cash-in.component';
import { SettlementHistoryComponent } from './setting/settlement-history/settlement-history.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { VisitorComponent } from './visitor/visitor.component';
import { ThemesComponent } from './themes/themes.component';
import { NgxCurrencyDirective , provideEnvironmentNgxCurrency, NgxCurrencyInputMode } from 'ngx-currency';
import { SettingFunctionComponent } from './setting/setting-function/setting-function.component';
import { ItemTebusMurahComponent } from './cart/item-tebus-murah/item-tebus-murah.component';
import { RefundComponent } from './refund/refund.component';
import { RefundTicketHistoryComponent } from './refund/refund-ticket-history/refund-ticket-history.component';
import { CartUpdatePriceComponent } from './cart/cart-update-price/cart-update-price.component';
import { KeyNumComponent } from './global/key-num/key-num.component';

const config: SocketIoConfig = { url: environment.socket_url, options: { transports: ['websocket'] } };
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CartComponent,
    NotFoundComponent,
    HomeComponent,
    ReloginComponent,
    HeaderComponent,
    SetupComponent,
    ParkingComponent,
    Widget1Component,
    ItemsComponent,
    CartDetailComponent,
    PaymentComponent,
    PrintingComponent,
    SettingComponent,
    PrintingHistoryComponent,
    SettlementComponent,
    SettlementPrintComponent,
    BalanceCashInComponent,
    SettlementHistoryComponent,
    VisitorComponent,
    ThemesComponent,
    SettingFunctionComponent,
    ItemTebusMurahComponent,
    RefundComponent,
    RefundTicketHistoryComponent,
    CartUpdatePriceComponent,
    KeyNumComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SocketIoModule.forRoot(config),
    NgxCurrencyDirective
  ],
  providers: [
    provideEnvironmentNgxCurrency({
      align: "right",
      allowNegative: true,
      allowZero: true,
      decimal: ",",
      precision: 0,
      prefix: "",
      suffix: "",
      thousands: ".",
      nullable: true,
      min: null,
      max: null,
      inputMode: NgxCurrencyInputMode.Financial,
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
