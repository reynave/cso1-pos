import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-printing-history',
  templateUrl: './printing-history.component.html',
  styleUrls: ['./printing-history.component.css']
})
export class PrintingHistoryComponent implements OnInit {
  @ViewChild('formRow') rows: ElementRef | any;
  id: string = "";
  note: string = "";
  items: any = [];
  itemsOrigin: any = [];
  callCursor: any;
  outputPrint: string = "";
  copy: number = 0;
  keyword : string = "";
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
    this.httpGet();
    this.setCursor();
  }

  httpGet() {
    this.http.get<any>(environment.api + "printing/index", {
      headers: this.configService.headers(),
    }).subscribe(
      data => {
        console.log(data);
        this.items = data['items'];
        this.itemsOrigin = data['items'];

      },
      error => {
        console.log(error);
      }
    )
  }


  back() {
    history.back();
  }

  onSearchChange() {
    console.log(this.keyword);
    if (!this.keyword) {
      this.items = this.itemsOrigin;

    } else {
      this.items = this.itemsOrigin.filter((item: { id: string; }) => {
        const matchItem = item.id.toLowerCase().includes(this.keyword.toLowerCase());
        return matchItem;
      });
    }
    
  }

  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
      // console.log( new Date().getSeconds())
    }, 300);
  }

}
