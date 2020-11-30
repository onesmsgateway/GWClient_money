import { Component, OnInit, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/core/models/pagination';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})

export class GeneralComponent implements OnInit {

  @ViewChild('updateQuotaQCModal', { static: false }) public updateQuotaQCModal: ModalDirective;
  @ViewChild('btnSearch', { static: false }) public btnSearch;

  public dataGeneral = [];
  public dataAccount = [];
  public settingsFilterAccount = {};
  public selectedItemComboboxAccount = [];
  public dataSender = [];
  public settingsFilterSender = {};
  public selectedItemComboboxSender = [];
  public dataPartner = [];
  public settingsFilterPartner = {};
  public selectedItemComboboxPartner = [];
  public dataType = [];
  public settingsFilterType = {};
  public selectedItemComboboxType = [];
  public fromDate: string = "";
  public toDate: string = "";
  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();
  public senderName: string = "";
  public slAccount: any = "";
  public partnerName: string = "";
  public type: string = "";
  public telco: string = "";
  public note: string = "";

  public roleAccess = 0;
  public is_admin = 0;
  public isAdmin: boolean = false;
  public showPort: boolean = false;
  public viettel: boolean = false;
  public mobiphone: boolean = false;
  public vinaphone: boolean = false;
  public vietnameMobile: boolean = false;
  public gtel: boolean = false;
  public sfone: boolean = false;
  public loadingGrid: boolean = false;
  public pagination: Pagination = new Pagination();

  constructor(private authService: AuthService,
    private dataService: DataService,
    private utilityService: UtilityService,
    private notificationService: NotificationService) {

    this.settingsFilterAccount = {
      text: this.utilityService.translate('global.choose_account'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterSender = {
      text: this.utilityService.translate('global.choose_sender'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterPartner = {
      text: this.utilityService.translate('global.choose_port'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterType = {
      text: this.utilityService.translate('global.choose_smstype'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };
  }

  ngOnInit() {
    this.dataAccount.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.dataSender.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.dataPartner.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.dataType.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.getInfoAccountLogin();
  }

  async getInfoAccountLogin() {
    let result = await this.dataService.getAsync('/api/account/GetInfoAccountLogin');
    this.roleAccess = result.data[0].ROLE_ACCESS;
    this.is_admin = result.data[0].IS_ADMIN;
    if (this.roleAccess == 50 || this.roleAccess == 53 || this.is_admin == 1) {
      this.isAdmin = true;
      if (this.roleAccess == 50 || this.is_admin == 1)
        this.showPort = true;
    }
    else {
      this.showPort = false;
      this.isAdmin = false;
    }
    this.getDataAccount();
    this.bindDataPartner();
    this.bindDataType();
    this.getData();
    this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
  }

  //#region load data general
  async getData() {
    this.loadingGrid = true;
    this.btnSearch.nativeElement.disabled = true;
    this.slAccount = this.selectedItemComboboxAccount.length > 0 && this.selectedItemComboboxAccount[0].id != "" ? this.selectedItemComboboxAccount[0].id : "";
    this.senderName = this.selectedItemComboboxSender.length > 0 && this.selectedItemComboboxSender[0].id != "" ? this.selectedItemComboboxSender[0].itemName : "";
    this.partnerName = "";
    if (this.is_admin == 1 && this.selectedItemComboboxPartner.length > 0 && this.selectedItemComboboxPartner[0].id != "")
      this.partnerName = this.selectedItemComboboxPartner[0].itemName;
    let from_date = this.fromDate != "" ? this.fromDate : this.timeFrom != null ? this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd") : "";
    let to_date = this.toDate != "" ? this.toDate : this.timeTo != null ? this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd") : "";
    this.type = this.selectedItemComboboxType.length > 0 && this.selectedItemComboboxType[0].id != "" ? this.selectedItemComboboxType[0].id : "";
    this.telco = (this.viettel == true ? "viettel," : "") + (this.mobiphone == true ? "vms," : "") +
      (this.vinaphone == true ? "gpc," : "") + (this.vietnameMobile == true ? "vnm," : "") + (this.gtel == true ? "gtel," : "") +
      (this.sfone == true ? "sfone" : "");
    let response: any = await this.dataService.getAsync('/api/Sms/StatisticSmsGeneral?accountId=' + this.slAccount + "&senderName=" + this.senderName + "&partnerName=" + this.partnerName +
      "&fromDate=" + from_date + "&toDate=" + to_date + "&smsType=" + this.type + "&telco=" + this.telco)
    this.loadData(response);
    this.loadingGrid = false;
    this.btnSearch.nativeElement.disabled = false;
  }
  //#endregion

  loadData(response?: any) {
    if (response) {
      this.dataGeneral = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
  }

  init(grid) {
    //some initialization work
    grid.columns.forEach(col => {
      if (col.binding == 'TELCO' || col.binding == 'PARTNER_NAME' || col.binding == 'TOTAL_SMS_SUCCESS' || col.binding == 'TOTAL_SMS_FAIL'
        || col.binding == 'TOTAL_SMS') {
        return;
      }
      col.allowMerging = true;
    });
  }

  //#region load data account
  async getDataAccount() {
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/account')
      for (let index in response.data) {
        this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
    else {
      let response = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in response.data) {
        this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
      if (this.dataAccount.length == 1) {
        this.selectedItemComboboxAccount.push({ "id": this.dataAccount[0].id, "itemName": this.dataAccount[0].itemName });
      }
      else
        this.selectedItemComboboxAccount.push({ "id": this.authService.currentUserValue.ACCOUNT_ID, "itemName": this.utilityService.translate("global.choose_account") });
    }
    this.bindDataSender();
  }

  changeAccount() {
    if (this.selectedItemComboboxAccount.length > 0) {
      this.bindDataSender();
    }
    else {
      this.selectedItemComboboxAccount = [];
      this.dataSender = [];
    }
  }
  //#endregion

  //#region sender
  async bindDataSender() {
    this.dataSender = [];
    this.dataSender.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.selectedItemComboboxSender = [];
    let type = this.selectedItemComboboxType.length > 0 && this.selectedItemComboboxType[0].id != "" ? this.selectedItemComboboxType[0].id : "";
    let account = "";
    if (this.isAdmin) {
      account = (this.selectedItemComboboxAccount.length > 0 && this.selectedItemComboboxAccount[0].id != "" ? this.selectedItemComboboxAccount[0].id : "");
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' + account + "&smsType=" + type);
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
    else {
      account = (this.selectedItemComboboxAccount.length > 0 && this.selectedItemComboboxAccount[0].id != "" ? this.selectedItemComboboxAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID);
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderParentAndChild?accountID=' + account + "&smsType=" + type);
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
    if (this.selectedItemComboboxSender.length == 1)
      this.selectedItemComboboxSender.push({ "id": this.dataSender[0].id, "itemName": this.dataSender[0].itemName });
  }
  //#endregion

  //#region partner
  public async bindDataPartner() {
    let response = await this.dataService.getAsync('/api/Partner');
    for (let i in response.data) {
      this.dataPartner.push({ "id": response.data[i].PARTNER_CODE, "itemName": response.data[i].PARTNER_NAME });
    }
    if (this.dataPartner.length == 1)
      this.selectedItemComboboxPartner.push({ "id": this.dataPartner[0].id, "itemName": this.dataPartner[0].itemName });
  }
  //#endregion

  //#region smsType
  public async bindDataType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
  }

  onItemSelectSmsType() {
    this.bindDataSender();
  }
  //#endregion

  //#region search
  onChangeFromDate(event) {
    this.fromDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
  }
  onChangeToDate(event) {
    this.toDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
  }

  //#endregion

  public async exportGeneral() {
    let result: boolean = await this.dataService.ExportStatisticGeneral('/api/FileExtention/ExportStatisticGeneral', this.slAccount, this.senderName, this.partnerName
      , this.fromDate, this.toDate, this.type, this.telco, "ExportStatisticGeneral");
    if (result) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
    }
  }

  async UpdateQuotaQC() {
    let senderName = this.selectedItemComboboxSender.length != 0 && this.selectedItemComboboxSender[0].itemName != "" ? this.selectedItemComboboxSender[0].itemName == "Tất cả" ? "" : this.selectedItemComboboxSender[0].itemName : "";
    let partnerName = "";
    if (this.roleAccess == 50 && this.selectedItemComboboxPartner.length != 0 && this.selectedItemComboboxPartner[0].itemName != "" && this.selectedItemComboboxPartner[0].itemName != "Tất cả")
      partnerName = this.selectedItemComboboxPartner[0].itemName;
    this.fromDate = this.timeFrom != null ? this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd") : "";
    this.toDate = this.timeTo != null ? this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd") : "";
    let telco = (this.viettel == true ? "viettel," : "") + (this.mobiphone == true ? "vms," : "") +
      (this.vinaphone == true ? "gpc," : "") + (this.vietnameMobile == true ? "vnm," : "") + (this.gtel == true ? "gtel," : "") +
      (this.sfone == true ? "sfone" : "");

    let response: any = await this.dataService.getAsync('/api/sms/UpdateQuotaQC?senderName=' + senderName + '&partnerName=' + partnerName
      + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate + '&telco=' + telco);
    if (response.err_code == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("300"));
      return;
    }
    else if (response.err_code == -1) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("110"));
      return;
    }
  }
}