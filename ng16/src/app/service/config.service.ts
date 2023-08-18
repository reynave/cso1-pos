import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private tokenKey: string = "pos1.vsi.com";
  constructor(
    private http: HttpClient
  ) { }

  setToken(token: string): Observable<boolean> {
    try {
      localStorage.setItem(this.tokenKey, token);
      return of(true); // Mengembalikan Observable yang mengirimkan nilai boolean true
    } catch (error) {
      return of(false); // Mengembalikan Observable yang mengirimkan nilai boolean false jika terjadi kesalahan
    }
  }


  account() {
    const jwtObj = this.getToken().split(".");
    return JSON.parse(atob(jwtObj[1]));
  }

  getVarkioskUuid(){
    return 'varkioskUuid';
  }

  getToken(): any {
    return localStorage.getItem(this.tokenKey);
  }

  jti() {
    return this.account()['jti'];
  }
  headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': this.getToken(),
    });
  }

  removeToken(): Observable<boolean> {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('kioskUuid'); 
      return of(true); // Mengembalikan Observable yang mengirimkan nilai boolean true
    } catch (error) {
      return of(false); // Mengembalikan Observable yang mengirimkan nilai boolean false jika terjadi kesalahan
    }
  }

  kioskUuid(){
    return localStorage.getItem("kioskUuid");
  }
  getKioskUuid() {
    let kioskUuid = localStorage.getItem("kioskUuid");

    const body = {
      terminalId: localStorage.getItem("terminalId"),
      kioskUuid : kioskUuid,
    }
    return this.http.post<any>(environment.api+"KioskUuid/getId", body, {
      headers: this.headers(),
    })
    // kioskUuid = "123HAHAHA";
    // localStorage.setItem("kioskUuid",   kioskUuid );
  }

  setKioskUuid(kioskUuid: string): Observable<boolean> {
    try {
      localStorage.setItem("kioskUuid", kioskUuid);
      return of(true); // Mengembalikan Observable yang mengirimkan nilai boolean true
    } catch (error) {
      return of(false); // Mengembalikan Observable yang mengirimkan nilai boolean false jika terjadi kesalahan
    }
  }

}