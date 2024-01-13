import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';
declare var window: any;
@Injectable({
  providedIn: 'root'
})
export class PrintingService {
  api: string = environment.api;
  printerName: any;
  bill: any;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
  ) { }

  stringfix(txt: any, l: number = 0, pos: string = '') {
    let data = txt.toString();
    let len = data.length;
    let space = "";
    if (len < l) {
      for (var i = 0; i < l - len; i++) {
        space += " ";
      }
    }
    if (pos == 'f') {
      data = space + data;
    } else {
      data = data + space;
    }

    return data;
  }
  numberFormat(price: any) {
    // console.log("numberFormat", parseInt(price));
    let data = parseInt(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,").toString().replace(".00", "");
    // let data = price;

    return data;
  }
  settlement(data: any) {
    let message = "";
    let line = 40;
    message += data['template']['companyName'] + "\n";
    message += data['template']['companyAddress'] + "\n";
    message += data['template']['companyPhone'] + "\n";
    message += "────────────────────────────────────────────────"+ "\n"; 
    message += this.fixLeftRight("Pc : "+data['template']['outletId'],data['settlement']['input_date'],line);
    message += "\n";
    message += "Finantial Reports"+ "\n";
    message += "────────────────────────────────────────────────"+ "\n"; 
    message += "Gross Sales :"+ "\n";
    message += this.fixLeftRight(data['transaction']['total'],this.numberFormat(data['transaction']['amount']),line)+ "\n";

    message += "discount :"+ "\n";
    message += this.fixLeftRight(data['transaction']['totalDiscount'],this.numberFormat(data['transaction']['discount']),line)+ "\n";
   
    message += "Net Sales :"+ "\n";
     message += this.fixLeftRight(data['transaction']['total'],this.numberFormat(data['transaction']['finalPrice']),line)+ "\n";


    data['payment'].forEach((el: any) => {
      message += el['paymentTypeId'] + " " + (el['name'] !== null ?el['name'] : '') + " \n";
      message += this.fixLeftRight(el['total'],this.numberFormat(el['amount']),line)+ "\n";
    });
    message += "\n";
    message += "                    <=  END =>                  "+ "\n";
    console.log(data);
    return message;
  }
  fixLeftRight(str1 : string , str2 : string, line : number){
    let n = line - (str1.length + str2.length);
    let val = "";
    for(let i = 0 ; i< n ; i++){
      val +=  " ";
    }

    return str1+val+str2;
  }
  template(bill: any) {
    let items = bill['items'];
    let summary = bill['summary'];
    let totalCopy = bill['copy'];
    let detail = bill['detail'];
 let freeItem = bill['freeItem'];

    let message = "";
    //console.log(items);
    // console.log("123456789-123456789-123456789-123456789-12345678" + "\n");
    message += bill['template']['companyName'] + "\n";
    message += bill['template']['companyAddress'] + "\n";
    message += bill['template']['companyPhone'] + "\n";
    if (bill['copy'] > 0) {
      message += totalCopy + " X COPY STRUCK" + "\n";
      message += "BUKAN MERUPAKAN BUKTI PEMBAYARAN" + "\n";
    }

    message += "================================================" + "\n";
    items.forEach((el: any) => { 
      let isEdit = parseInt(el['totalPriceEdit']); 
      message += el['barcode'] + " " + el['shortDesc'] + ' ' + (isEdit > 0 ? '*' : '') + this.numberFormat(el['originPrice']) +
        ((el['promotionId'] == 'EXCHANGES' || el['promotionId'] == 'REFUND') ? el['promotionId'] : '') + "\n"; 
      if (el['memberDiscountAmount'] > 0) {
        message += "  DISC MEMBER " + this.numberFormat(el['memberDiscountAmount']) + "\n";
      }
      if (el['totalDiscount'] > 0) {
        message += "  DISC " + this.numberFormat(el['totalDiscount']) + "\n";
      }
      if (el['promotionDescription'] !==  null ) {
        message += "*"+el['promotionDescription'] + "* \n";
      }
      message += "  " +
        this.stringfix(el['qty'], 4) + "X" +
        this.stringfix(this.numberFormat(el['price']), 10, 'f') + " " + this.stringfix(" ", 14, 'f') +
        this.stringfix(this.numberFormat(el['totalPrice']), 15, 'f') +
        "\n";
    });

    freeItem.forEach((el: any) => { 
    
      message += el['barcode'] + " " + el['shortDesc'] + " X "+ this.stringfix(el['qty'], 4)+"\n";
      message += "*FREE ITEMS*                                  0\n";
      
    });
    message += "================================================" + "\n";

    message += "SUBTOTAL              :" + this.stringfix(this.numberFormat(summary['total']), 24, 'f') + "\n";
    message += "DISCOUNT              :" + this.stringfix(this.numberFormat(summary['discount']), 24, 'f') + "\n";
    message += "DISCOUNT MEMBER       :" + this.stringfix(this.numberFormat(summary['discountMember']), 24, 'f') + "\n";
    message += "VOUCHER               :" + this.stringfix(this.numberFormat(summary['voucher']), 24, 'f') + "\n";
    message += "TOTAL (SETELAH PAJAK) :" + this.stringfix(this.numberFormat(Number(summary['final']) < 0 ? 1 : summary['final']), 24, 'f') + "\n";
    //console.log("123456789-123456789-123456789-123456789-12345678"+"\n");
    message += "\n";
    message += "        BKP         PPN         DPP     NON BKP" + "\n";
    //          0           0           0           0
    message += this.stringfix(this.numberFormat(summary['bkp']), 11, 'f') + " " +
      this.stringfix(this.numberFormat(summary['ppn']), 11, 'f') + " " +
      this.stringfix(this.numberFormat(summary['dpp']), 11, 'f') + " " +
      this.stringfix(this.numberFormat(summary['nonBkp']), 11, 'f');
    message += "\n\n";
    if (detail['memberId']) {
      message += "MEMBER                : " + detail['member'] + "\n";
    }

    message += "BILL                  : " + bill['id'] + "\n";
    message += "DATE                  : " + bill['date'] + "\n";
    message += "UNIT / OUTLET ID      : " + bill['detail']['terminalId'] + "/" + bill['template']['outletId'] + " \n";
    message += "PAYMENT PAID METHOD " + "\n";

    bill['paymentMethod'].forEach((el: any) => {
      message += ` + ${el['label']} :  ${this.numberFormat(el['amount'])}` + "\n";
    });

    if (bill['balance'].length > 0) {
      message += "PEMBAYARAN CASH      : " + this.stringfix(this.numberFormat(bill['balance'][0]['caseIn']), 24, 'f') + "\n";
      message += "KEMBALI              : " + this.stringfix(this.numberFormat(bill['balance'][0]['caseOut']), 24, 'f') + "\n";

    }

    message += "\n";
    bill['promo_fixed'].forEach((el: any) => {
      if (el['detail']['shortDesc']) {
        message += el['detail']['shortDesc'] + "\n";
      }
    });


    message += bill['template']['footer'].replace("<br>", "\n") + "\n";
    message += "                                               " + "\n";

    //  console.log(message);
    return message;
  }


  templateValidationNota(bill: any) {
    let items = bill['items'];
    let detail = bill['detail'];

    let message = "";

    items.forEach((el: any) => {
      if (el['validationNota'] == '1') {


        message += "\n";
        let disc = (el['totalDiscount'] > 0 ? this.stringfix("(DISC " + this.numberFormat(el['totalDiscount']) + "", 14, 'f') + ")" : "");

        message += el['barcode'] + " " + el['shortDesc'] + ' ' + this.numberFormat(el['originPrice']) +
          ((el['promotionId'] == 'EXCHANGES' || el['promotionId'] == 'REFUND') ? el['promotionId'] : '') + "\n";
        if (disc != "") {
          message += "  " + disc + "\n";
        }
        if (el['memberDiscountAmount'] > 0) {
          message += "  DISC MEMBER " + this.numberFormat(el['memberDiscountAmount']) + "\n";
        }


        message += "  " +
          this.stringfix(el['qty'], 4) + "X" +
          this.stringfix(this.numberFormat(el['price']), 10, 'f') + " " + this.stringfix(" ", 14, 'f') +
          this.stringfix(this.numberFormat(el['totalPrice']), 15, 'f') +
          "\n";
        message += "\n";
        message += "________________________________________________";
        message += "\n";
        message += "\n";
      }
    });



    //  console.log(message);
    return message;
  }

  dotMetix() {
    console.log("print DOTMETIX()")
  }

  printDel(id: string) {
    let url = this.api + 'printing/detail?id=' + id;
    console.log(url);
    this.http.get<any>(url,
      { headers: this.configService.headers() }
    ).subscribe(
      data => {
        console.log(data);
        this.bill = data;
        if (data['printable'] == true) {
          let message = this.template(this.bill);
          console.log(message);
        }
      },
      e => {
        console.log(e);
      },
    );
  }
}