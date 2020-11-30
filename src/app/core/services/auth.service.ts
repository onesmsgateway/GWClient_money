import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { AppConst } from '../common/app.constants';
import { UrlConst } from '../common/url.constants';
import { DataService } from './data.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  public dataMenu: any = [];
  public viewQuyTienCSKH = 0;
  public viewQuyTienQC = 0;

  constructor(private dataService: DataService,
    private router: Router,
    private utilityService: UtilityService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(AppConst.CURRENT_USER)));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public async routerWebsite() {
    this.dataService.get("/api/auth/CheckSession?token=" + this.currentUserValue.TOKEN).subscribe((response): any => {
      if (response)
        if (!response.is_active) {
          this.logout();
          this.router.navigate([UrlConst.LOGIN]);
        }
    });
  }

  public async loginSystem(USER_NAME, PASSWORD, TIMEOUT) {
    let user: User = new User("", USER_NAME, PASSWORD, "", "", "", "SYSTEM", TIMEOUT);
    let response: any = await this.dataService.postAsync("/api/auth/LoginSystem", user);
    if (response && response.err_code == 0) {
      this.setLogin(<User>response.data);
    }
    return response;
  }

  private setLogin(user: User) {
    localStorage.setItem(AppConst.CURRENT_USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
    localStorage.setItem(AppConst.IS_LOGGED, "true");
    if (!localStorage.getItem(AppConst.CURRENT_LANG)) localStorage.setItem(AppConst.CURRENT_LANG, AppConst.LANGUAGE_VI);
    this.utilityService.setErrorCodeByLanguage(localStorage.getItem(AppConst.CURRENT_LANG));
    this.router.navigate([UrlConst.HOME]);
  }

  public logout(): void {
    //localStorage.clear();
    localStorage.removeItem(AppConst.CURRENT_USER);
    localStorage.removeItem(AppConst.ERROR_CODE);
    this.currentUserSubject.next(null);
    localStorage.setItem(AppConst.IS_LOGGED, "false");
    this.router.navigate([UrlConst.LOGIN]);
  }

  public async getMenuAccess(): Promise<any> {
    let response: any = await this.dataService.getAsync("/api/menu/LoadMenuByUserAsync?language=" + localStorage.getItem(AppConst.CURRENT_LANG));
    if (response && response.err_code == 0) {
      let arrPathMenu: string[] = [];
      for (let item in response.data)
        arrPathMenu.push(response.data[item].MENU_PATH);
      return arrPathMenu;
    }
  }
}