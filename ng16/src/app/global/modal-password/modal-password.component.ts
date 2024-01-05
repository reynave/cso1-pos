import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/service/config.service';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-modal-password',
  templateUrl: './modal-password.component.html',
  styleUrls: ['./modal-password.component.css']
})
export class ModalPasswordComponent implements OnInit, OnDestroy {
  @ViewChild('formRow') rows: ElementRef | any;
  @Input() data: any;
  @Input() kioskUuid: any;

  @Output() newItemEvent = new EventEmitter<string>();
  loading: boolean = false;
  barcode: string = "";
  password: string = "";
  callCursor: any;
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public configService: ConfigService,
    public http: HttpClient
  ) { }
  ngOnInit(): void {
    this.setCursor();
  }
  setCursor() {
    this.callCursor = setInterval(() => {
      this.rows.nativeElement.focus();
    }, 300);
  }

  ngOnDestroy() {
    clearInterval(this.callCursor);
  }

  close() {
    this.modalService.dismissAll();
  }
  addNewItem(value: any) {
    this.newItemEvent.emit(value);
  }

  onSubmit() {
    const hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(this.password));
    const md5 = hash.toString(CryptoJS.enc.Hex);

    const body = {
      password: this.password,
      md5: md5,
    }
    console.log(body);
    this.addNewItem(body);
    this.modalService.dismissAll(); 
  }
}
