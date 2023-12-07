import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../service/config.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CashierService } from '../service/cashier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit{
  isEndOfday: boolean = false;
  settlement : number = 100;
  ver : string = environment.ver.toString();
  prod : string = environment.production ? "Prod":"Dev";
  printerName : string = "";
  constructor(
    private configService: ConfigService,
    private cashier: CashierService,
    private modalService: NgbModal,
    private http: HttpClient,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.http.get<any>(environment.api+"settlement/index",{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        this.printerName = data['printerName'];
        this.settlement = data['total'];
        if(this.settlement <= 0){
          this.isEndOfday = true;
        }
      },
      error=>{
        console.log(error);
      }
    )
  }

  testPrint(){
    let date = new Date();
    const body = {
      outputPrint : date+" TEST PRINTING "+this.printerName,
      printerName : this.printerName,
    }
    console.log(body);
    this.http.post<any>(environment.api+"printing/test", body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
      },
      error=>{
        alert("ERROR : "+error.error.message);
        console.log(error);
      }
    )
  }
  note: string = "";
  fnSavePrinterName(){ 
    this.note = "";
    const body = { 
      printerName : this.printerName,
    }
    console.log(body);
    this.http.post<any>(environment.api+"printing/fnSavePrinterName", body,{
      headers : this.configService.headers(),
    }).subscribe(
      data=>{
        console.log(data);
        this.note = "Save success. ";
      },
      error=>{
        alert("ERROR : "+error.error.message);
        console.log(error);
      }
    )
  }
  back() {
    history.back();
  }

  endOfDay() {
    if (this.isEndOfday == true) {
      if (confirm("END OF DAY this POS ?")) {
        const body = {
          terminalId: localStorage.getItem("terminalId")
        }
        this.http.post<any>(environment.api + "EndOfDay/index", body, {
          headers: this.configService.headers(),
        }).subscribe(
          data => {
            console.log(data);
            this.cashier.openCashDrawer();
            this.configService.removeToken().subscribe(
              () => {
                this.router.navigate(['relogin']);
              }
            )
          },
          error => {
            console.log(error);
          }
        )
      }
    }else{
      alert("Tidak bisa End Of Day, masih ada data yang belum di Settlement");
    }
  }

  open(content: any) {
    this.note = "";
		this.modalService.open(content, { size: 'md' });
	}
}
