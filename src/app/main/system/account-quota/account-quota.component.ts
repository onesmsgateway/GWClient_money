import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalDirective, TabHeadingDirective } from 'ngx-bootstrap';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { Role } from 'src/app/core/models/role';
import { ActivatedRoute } from '@angular/router';
import { MainComponent } from '../../main.component';

@Component({
  selector: 'app-account-quota',
  templateUrl: './account-quota.component.html',
  styleUrls: ['./account-quota.component.css']
})
export class AccountQuotaComponent implements OnInit {
  @ViewChild('createAccountCimastTransModel', { static: false }) public createAccountCimastTransModel: ModalDirective;
  @ViewChild('viewAccountCimastTransModel', { static: false }) public viewAccountCimastTransModel: ModalDirective;
  @ViewChild('btnCreate', { static: false }) public btnCreate;

  public dataAccountCimast;

  public settingsFilterAccount = {};
  public dataAccount = [];
  public selectedAccount = [];

  public selectedSmsType = [];
  public dataSmsType = [];
  public settingsFilterSmsType = {};

  public selectedInputType = [];
  public dataInputType = [];
  public settingsFilterInputType = {};

  public isInputMoney: boolean = false;
  public changeAmt = 0;
  public changeSms = 0;
  public valueAmt = 0;
  public valueSms = 0;
  public moneypay = 0;
  public price_viettel = 0;
  public price_gpc = 0;
  public price_vms = 0;
  public price_vnm = 0;
  public price_gtel = 0;

  public accountViewQuota = 0;
  public serviceNameViewQuota = "";
  public dataQuotaHistory = [];

  public isAdmin: boolean = true;
  public description_reset: string = "";
  public role: Role = new Role();
  public loadingCreate: boolean = false;

  constructor(private authService: AuthService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private mainComponent: MainComponent) {

    this.activatedRoute.data.subscribe(data => {
      this.utilityService.getRole(data.MENU_CODE).then((response) => {
        if (response) this.role = response;
      })
    });

    this.settingsFilterAccount = {
      text: this.utilityService.translate("global.choose_account"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterSmsType = {
      text: this.utilityService.translate("global.choose_smstype"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterInputType = {
      text: this.utilityService.translate("global.choose_smstype"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };
  }

  ngOnInit() {
    this.bindDataAccount();
    this.bindDataSmsType();
  }

  //#region account
  public async bindDataAccount() {
    let result = await this.dataService.getAsync('/api/account/GetInfoAccountLogin');
    let is_admin = result.data[0].IS_ADMIN;
    let roleAccess = result.data[0].ROLE_ACCESS;
    if (roleAccess == 50 || roleAccess == 53 || is_admin == 1) {
      this.isAdmin = true;
      let response: any = await this.dataService.getAsync('/api/account');
      for (let index in response.data) {
        this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
    else {
      this.isAdmin = false;
      let response = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in response.data) {
        //this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
        if (this.authService.currentUserValue.ACCOUNT_ID != response.data[index].ACCOUNT_ID)
          this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
    this.getListAccountCimast();
  }

  onItemSelect() {
    this.getListAccountCimast();
  }

  OnItemDeSelect() {
    this.getListAccountCimast();
  }

  //#endregion

  //#region load loai dich vu
  public async bindDataSmsType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
    if (this.dataSmsType.length > 0) this.selectedSmsType.push({ "id": this.dataSmsType[0].id, "itemName": this.dataSmsType[0].itemName });
  }
  //#endregion

  //#region Load data
  public async getListAccountCimast() {
    if (this.selectedAccount.length > 0) {
      let response = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountID?accountID=' + this.selectedAccount[0].id);
      if (response.err_code == 0) {
        this.dataAccountCimast = response.data;
      }
    }
    else {
      this.dataAccountCimast = [];
    }
  }
  //#endregion

  //#region them giao dich tin
  openFormCapTin() {
    this.description_reset = "";
    this.valueAmt = 0;
    this.changeSms = 0;
    this.price_viettel = 0;
    this.price_gpc = 0;
    this.price_vms = 0;
    this.price_vnm = 0;
    this.price_gtel = 0;
    this.createAccountCimastTransModel.show();
  }

  public async createAccountCimastTrans(trans) {
    this.loadingCreate = true;
    this.btnCreate.nativeElement.disabled = true;
    let ACCOUNT_ID = trans.accountID.length > 0 ? trans.accountID[0].id : "";
    let SERVICENAME = trans.smsType.length > 0 ? trans.smsType[0].id : "";
    let AMT = trans.amt;
    let PRICE_VIETTEL = trans.price_viettel;
    let PRICE_GPC = trans.price_gpc;
    let PRICE_VMS = trans.price_vms;
    let PRICE_VNM = trans.price_vnm;
    let PRICE_GTEL = trans.price_gtel;
    let TYPE_BYE = 2;
    let dateNow: Date = new Date();
    let TX_DATE = this.utilityService.formatDateToString(dateNow, "yyyyMMdd");

    if (ACCOUNT_ID == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-68"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (SERVICENAME == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-61"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (AMT <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-80"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (PRICE_VIETTEL <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-128"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (PRICE_GPC <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-129"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (this.price_vms <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-130"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (PRICE_VNM <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-131"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    if (PRICE_GTEL <= 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-132"));
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }

    let amt_new = AMT;
    let DESCRIPTION = trans.description;
    let STATUS_TRAN = 0;
    if (!this.isAdmin) {
      if (SERVICENAME == "CSKH") {
        if (this.mainComponent.viewQuyTienCSKH < AMT) {
          this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-127"));
          this.loadingCreate = false;
          this.btnCreate.nativeElement.disabled = false;
          return;
        }
        if (this.mainComponent.viewQuyTienCSKH == 0 && AMT > 0) {
          this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-105"));
          this.loadingCreate = false;
          this.btnCreate.nativeElement.disabled = false;
          return;
        }
      } else if (SERVICENAME == "QC") {
        if (this.mainComponent.viewQuyTienQC < AMT) {
          this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-127"));
          this.loadingCreate = false;
          this.btnCreate.nativeElement.disabled = false;
          return;
        }
        if (this.mainComponent.viewQuyTienQC == 0 && AMT > 0) {
          this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-106"));
          this.loadingCreate = false;
          this.btnCreate.nativeElement.disabled = false;
          return;
        }
      }
    }

    let detail = await this.dataService.postAsync('/api/AccountCimastTran', {
      ACCOUNT_ID, TX_DATE, SERVICENAME, TYPE_BYE, AMT, DESCRIPTION, STATUS_TRAN, PRICE_VIETTEL, PRICE_GPC, PRICE_VMS, PRICE_VNM, PRICE_GTEL
    });
    if (detail.err_code == 0) {
      //#region udpate account_cimast
      let quotaAccount = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountService?accountID=' +
        ACCOUNT_ID + '&serviceName=' + SERVICENAME);
      if (quotaAccount.err_code == 0) {
        let quota = quotaAccount.data;
        if (quota.length > 0) {
          let AMT_old = quota[0].AMT;
          let AMT_IN_old = quota[0].IN_AMT;
          let amt_update = amt_new + AMT_old;
          let IN_AMT = amt_new + AMT_IN_old;
          let AMT_NEW = AMT;
          AMT = amt_update;
          let response = await this.dataService.putAsync('/api/AccountCimast/' + quota[0].CI_ID, {
            ACCOUNT_ID, TX_DATE, AMT, IN_AMT, SERVICENAME, AMT_NEW
          });
        }
        else {
          let IN_AMT = AMT;
          let OUT_AMT = 0;
          let response = await this.dataService.postAsync('/api/AccountCimast', {
            ACCOUNT_ID, TX_DATE, AMT, IN_AMT, OUT_AMT, SERVICENAME
          });
        }
      }
      //#endregion
      this.notificationService.displaySuccessMessage("Cấp tin thành công!");
      this.getListAccountCimast();
      this.mainComponent.viewQuyTin(false);
      this.createAccountCimastTransModel.hide();
    }
    else {
      this.notificationService.displayErrorMessage(detail.err_message);
      this.loadingCreate = false;
      this.btnCreate.nativeElement.disabled = false;
      return;
    }
    this.loadingCreate = false;
    this.btnCreate.nativeElement.disabled = false;
  }

  closeFormCreate() {
    this.getListAccountCimast();
    this.createAccountCimastTransModel.hide();
  }
  //#endregion

  //#region view lich su cap tin
  public async showConfirmViewHis(accountID, serviceName) {
    this.serviceNameViewQuota = serviceName;
    let response = await this.dataService.getAsync('/api/AccountCimastTran/GetByAccountService?accountID=' +
      accountID + '&serviceName=' + serviceName);
    if (response.err_code == 0) {
      this.dataQuotaHistory = response.data;
      if (this.dataQuotaHistory.length > 0)
        this.accountViewQuota = response.data[0].USER_NAME;
      else this.accountViewQuota = 0;
    }
    this.viewAccountCimastTransModel.show();
  }

  closeFormHis() {
    this.viewAccountCimastTransModel.hide();
  }
  //#endregion
}
