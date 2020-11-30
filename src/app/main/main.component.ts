import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { UtilityService } from '../core/services/utility.service';
import { User } from '../core/models/user';
import { AccountInfoComponent } from './home/account-info/account-info.component';
import { ChangePassComponent } from './home/change-pass/change-pass.component';
import { DataService } from '../core/services/data.service';
import { AppConst } from '../core/common/app.constants';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent {
  @ViewChild("componentAccountInfo", { static: false }) public componentAccountInfo: AccountInfoComponent;
  @ViewChild("componentChangePass", { static: false }) public componentChangePass: ChangePassComponent;

  public user: User = this.authService.currentUserValue;
  public dataMenu: any = [];
  public viewQuyTienCSKH = 0;
  public viewQuyTienQC = 0;
  public isAdmin: boolean = false;

  constructor(private authService: AuthService, private utilityService: UtilityService, private dataService: DataService) {
    this.loadMenuIndex();
    this.getAccountLogin();
  }

  logout(): void {
    this.authService.logout();
  }

  changeLanguage(lang) {
    this.utilityService.changeLanguageCurrent(lang);
    this.loadMenuIndex();
  }

  showModalAccountInfo() {
    this.componentAccountInfo.loadDataLog();
    this.componentAccountInfo.modalAccountInfo.show();
  }

  showModalChangePass() {
    this.componentChangePass.modalChangePass.show();
  }

  async loadMenuIndex(isChanged?: boolean) {
    let response: any = await this.dataService.getAsync("/api/menu/LoadMenuByUserAsync?language=" + localStorage.getItem(AppConst.CURRENT_LANG) || AppConst.LANGUAGE_VI);
    if (response && response.err_code == 0) {
      let menuParent: any = [];
      let menuChild: any = [];
      for (let index in response.data) {
        if (response.data[index].PARENT_ID == null) {
          menuParent.push(response.data[index]);
        }
      }
      this.dataMenu = menuParent;
      for (let index in menuParent) {
        menuChild = [];
        for (let i in response.data) {
          if (response.data[i].PARENT_ID == menuParent[index].ID)
            menuChild.push(response.data[i]);
        }
        this.dataMenu[index].menuChild = menuChild;
      }
    }
  }

  async getAccountLogin() {
    let result = await this.dataService.getAsync('/api/account/GetInfoAccountLogin');
    let roleAccess = result.data[0].ROLE_ACCESS;
    let is_admin = result.data[0].IS_ADMIN;
    if (roleAccess == 50 || is_admin == 1 || roleAccess == 53) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    this.viewQuyTin(false);
  }

  //#region view quy tin
  public async viewQuyTin(isSend: boolean) {
    if (!isSend) {
      let accountID = this.authService.currentUserValue.ACCOUNT_ID;
      if (accountID != undefined && accountID != "") {
        let money_remain_cskh = 0;
        let money_remain_qc = 0;

        let getMoneyCSKH: any = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountService?accountID=' +
          accountID + '&serviceName=CSKH');
        if (getMoneyCSKH.data.length > 0) {
          money_remain_cskh = getMoneyCSKH.data[0].AMT;
          this.viewQuyTienCSKH = this.authService.viewQuyTienCSKH = (money_remain_cskh != null && money_remain_cskh > 0) ? money_remain_cskh : 0;
        }
        else this.viewQuyTienCSKH = this.authService.viewQuyTienCSKH = 0;

        let getMoneyQC: any = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountService?accountID=' +
          accountID + '&serviceName=QC');
        if (getMoneyQC.data.length > 0) {
          money_remain_qc = getMoneyQC.data[0].AMT;
          this.viewQuyTienQC = this.authService.viewQuyTienQC = (money_remain_qc != null && money_remain_qc > 0) ? money_remain_qc : 0;
        }
        else this.viewQuyTienQC = this.authService.viewQuyTienQC = 0;
      }
      else {
        this.viewQuyTienCSKH = this.authService.viewQuyTienCSKH = 0;
        this.viewQuyTienQC = this.authService.viewQuyTienQC = 0;
      }
    }
    else {
      this.viewQuyTienCSKH = this.authService.viewQuyTienCSKH;
      this.viewQuyTienQC = this.authService.viewQuyTienQC
    }
  }
  //#endregion
}
