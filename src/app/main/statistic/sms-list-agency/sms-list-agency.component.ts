import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Pagination } from 'src/app/core/models/pagination';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-sms-list-agency',
  templateUrl: './sms-list-agency.component.html',
  styleUrls: ['./sms-list-agency.component.css']
})
export class SmsListAgencyComponent implements OnInit {

  @ViewChild('confirmSendReportModal', { static: false }) public confirmSendReportModal: ModalDirective;
  @ViewChild('btnSearch', { static: false }) public btnSearch;
  @ViewChild('btnExport', { static: false }) public btnExport;
  @ViewChild('btnReport', { static: false }) public btnReport;

  public dataSms;
  public smsContent: string = "";
  public phone: string = "";
  public mailReceiveReport: string = "";

  public fromDate: string = "";
  public toDate: string = "";
  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();

  public isCheckVTL = false;
  public stringVTL = "VIETTEL";
  public isCheckGPC = false;
  public stringGPC = "GPC";
  public isCheckVNM = false;
  public stringVNM = "VNM";
  public isCheckVMS = false;
  public stringVMS = "VMS";
  public isCheckGTEL = false;
  public stringGTEL = "GTEL";
  public isCheckSFONE = false;
  public stringSFONE = "SFONE";
  public isCheckDD = false;
  public stringDD = "DDMBLE";
  public isCntBrandName = false;
  public isCntDate = false;
  public isshowDetailSms = false;
  public isShowCount = false;
  public countAll = 0;
  public countVTL = 0;
  public countGPC = 0;
  public countVMS = 0;
  public countVNM = 0;
  public countGtel = 0;

  public settingsFilterAccount = {};
  public dataAccount = [];
  public selectedAccountID = [];

  public settingsFilterSender = {};
  public dataSender = [];
  public selectedSenderID = [];

  public settingsFilterPartner = {};
  public dataPartner = [];
  public selectedPartnerID = [];

  public selectedSmsType = [];
  public dataSmsType = [];
  public settingsFilterSmsType = {};

  public selectedSmsStatus = [];
  public dataSmsStatus = [];
  public settingsFilterSmsStatus = {};

  public settingsFilterTypeSend = {};
  public dataTypeSend = [];
  public selectedTypeSend = [];

  public pagination: Pagination = new Pagination();
  public viewSumSms = "";

  public isShowPartner = false;
  public isAdmin = false;
  public loading: boolean = false;
  public loadingGrid: boolean = false;
  public loadingReport: boolean = false;

  constructor(private authService: AuthService,
    private dataService: DataService,
    private utilityService: UtilityService,
    private notificationService: NotificationService) {

    this.settingsFilterAccount = {
      text: this.utilityService.translate("global.choose_account"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterSender = {
      text: this.utilityService.translate("global.choose_sender"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterPartner = {
      text: this.utilityService.translate("global.choose_port"),
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

    this.settingsFilterSmsStatus = {
      text: this.utilityService.translate("global.choose_status"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterTypeSend = {
      text: this.utilityService.translate("global.type_send"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };
  }

  ngOnInit() {
    this.dataAccount.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.getAccountDetail();
  }

  async getAccountDetail() {
    let response = await this.dataService.getAccountDetail();
    let is_admin = response.data[0].IS_ADMIN;
    let roleAccess = response.data[0].ROLE_ACCESS;
    if (roleAccess == 50 || roleAccess == 53 || is_admin == 1) {
      this.isShowPartner = true;
      this.isAdmin = true;
    }
    else {
      this.isShowPartner = false;
      this.isAdmin = false;
    }
    this.bindDataAccount();
    this.bindDataPartner();
    this.bindDataSmsType();
    this.bindDataSmsStatus();
    this.getListSms();
    this.bindDataTypeSend();
    this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
  }

  //#region account
  public async bindDataAccount() {
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/account');
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
      if (this.dataAccount.length == 2)
        this.selectedAccountID.push({ "id": this.dataAccount[1].id, "itemName": this.dataAccount[1].itemName });
      else
        this.selectedAccountID.push({ "id": "", "itemName": this.utilityService.translate("global.choose_account") });
    }
    this.loadListSenderName();
    // this.getListSms();
  }

  onItemSelect() {
    this.loadListSenderName();
  }

  OnItemDeSelect() {
    this.selectedAccountID = [];
    this.loadListSenderName();
  }

  //#endregion

  //#region sender
  async loadListSenderName() {
    this.dataSender = [];
    this.dataSender.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.selectedSenderID = [];
    let account = "";
    let type = this.selectedSmsType.length > 0 && this.selectedSmsType[0].id != "" ? this.selectedSmsType[0].id : "";
    if (this.isAdmin) {
      account = (this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : "");
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' + account + "&smsType=" + type);
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
    else {
      account = (this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : this.authService.currentUserValue.ACCOUNT_ID);
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderParentAndChild?accountID=' + account + "&smsType=" + type);
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
  }
  //#endregion

  //#region partner
  public async bindDataPartner() {
    let response = await this.dataService.getAsync('/api/Partner');
    for (let i in response.data) {
      this.dataPartner.push({ "id": response.data[i].PARTNER_CODE, "itemName": response.data[i].PARTNER_NAME });
    }
    // this.getListSms();
  }
  //#endregion

  //#region smsType
  public async bindDataSmsType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
    // this.getListSms();
  }

  onItemSelectSmsType() {
    this.loadListSenderName();
  }
  //#endregion

  //#region sms status
  public bindDataSmsStatus() {
    this.dataSmsStatus = [];
    this.dataSmsStatus.push({ "id": "1", "itemName": "Thành công" });
    this.dataSmsStatus.push({ "id": "0", "itemName": "Thất bại" });
    this.dataSmsStatus.push({ "id": "2", "itemName": "Chưa có trạng thái" });
  }
  //#endregion

  //#region type send
  public bindDataTypeSend() {
    this.dataTypeSend = [];
    this.dataTypeSend.push({ "id": "", "itemName": this.utilityService.translate("global.all") });
    this.dataTypeSend.push({ "id": "SMS_CLIENT", "itemName": this.utilityService.translate("sms_list.sms_client") });
    this.dataTypeSend.push({ "id": "SMS_API", "itemName": this.utilityService.translate("sms_list.sms_api") });
    this.dataTypeSend.push({ "id": "SMS_BIRTHDAY", "itemName": this.utilityService.translate("sms_list.sms_birthday") });
    this.dataTypeSend.push({ "id": "SMS_SMPP", "itemName": this.utilityService.translate("sms_list.sms_smpp") });
    this.dataTypeSend.push({ "id": "SMS_DATA", "itemName": this.utilityService.translate("sms_list.sms_data") });
  }
  //#endregion

  //#region load data and paging
  public async getListSms() {
    this.loadingGrid = true;
    this.btnSearch.nativeElement.disabled = true;
    if(this.isCntBrandName || this.isCntDate){
      this.isshowDetailSms = false;
      this.isShowCount = true;
    }else{
      this.isshowDetailSms = true;
      this.isShowCount = false;
    }
    this.dataSms = [];
    this.viewSumSms = "Tổng số tin: 0";
    let account_id = "";
    if (this.isAdmin)
      account_id = this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : "";
    else
      account_id = this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : this.authService.currentUserValue.ACCOUNT_ID;
    let countBrand = this.isCntBrandName ? 1 : 0;
    let countDate = this.isCntDate ? 1 : 0;
    let status = this.selectedSmsStatus.length > 0 && this.selectedSmsStatus[0].id != "" ? this.selectedSmsStatus[0].id : "";
    let typeSend = this.selectedTypeSend.length > 0 && this.selectedTypeSend[0].id != "" ? this.selectedTypeSend[0].id : "";
    let response = await this.dataService.getAsync('/api/sms/GetListFillterPaging?pageIndex=' + this.pagination.pageIndex +
      '&pageSize=' + this.pagination.pageSize + '&account_id=' + account_id +
      '&sender_id=' + (this.selectedSenderID.length > 0 ? this.selectedSenderID[0].id : "") + '&sms_content=' + this.smsContent + '&phone=' + this.phone +
      '&sms_type=' + (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : "") + '&viettel=' + (this.isCheckVTL == true ? this.stringVTL : "") + 
      '&vina=' + (this.isCheckGPC == true ? this.stringGPC : "") + '&mobi=' + (this.isCheckVMS == true ? this.stringVMS : "") + 
      '&vnMobile=' + (this.isCheckVNM == true ? this.stringVNM : "") + '&gtel=' + (this.isCheckGTEL == true ? this.stringGTEL : "") + 
      '&sfone=' + (this.isCheckSFONE == true ? this.stringSFONE : "") + '&ddMobile=' + (this.isCheckDD == true ? this.stringDD : "") + 
      '&tu_ngay=' + this.fromDate + '&den_ngay=' + this.toDate + '&partner_code=' + (this.selectedPartnerID.length > 0 ? this.selectedPartnerID[0].id : "") +
      '&sms_status=' + status + '&via=' + typeSend + '&cntBrand=' + countBrand + '&cntDate=' + countDate);
    if (response.err_code == 0) {
      this.dataSms = response.data;
      if (response.pagination.TotalRows > 0) {
        this.countVTL = this.dataSms[0].SUM_VIETTEL;
        this.countGPC = this.dataSms[0].SUM_GPC;
        this.countVMS = this.dataSms[0].SUM_VMS;
        this.countVNM = this.dataSms[0].SUM_VNM;
        this.countGtel = this.dataSms[0].SUM_GTEL;
        this.countAll = this.countVTL + this.countGPC + this.countVMS + this.countVNM + this.countGtel;
      } else {
        this.countVTL = 0;
        this.countGPC = 0;
        this.countVMS = 0;
        this.countVNM = 0;
        this.countGtel = 0;
        this.countAll = 0;
      }
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
    this.loadingGrid = false;
    this.btnSearch.nativeElement.disabled = false;
  }

  pageChanged(event: any): void {
    this.setPageIndex(event.page);
  }
  setPageIndex(pageNo: number): void {
    this.pagination.pageIndex = pageNo;
    this.getListSms();
  }
  changePageSize(size) {
    this.pagination.pageSize = size;
    this.pagination.pageIndex = 1;
    this.getListSms();
  }
  //#endregion

  //#region search
  onChangeFromDate(event) {
    this.fromDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
    if (this.fromDate > this.toDate) {
      this.notificationService.displayWarnMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
  }

  onChangeToDate(event) {
    console.log(event);
    this.toDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
    if (this.fromDate > this.toDate) {
      this.notificationService.displaySuccessMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
  }

  public async searchSms(form) {
    this.smsContent = form.smsContent.trim();
    this.fromDate = this.utilityService.formatDateToString(form.fromDate, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(form.toDate, "yyyyMMdd");
    this.phone = form.phone.trim();
    if (this.fromDate > this.toDate) {
      this.notificationService.displayWarnMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
    this.getListSms();
  }
  //#endregion

  public convertStringDate(text: string): string {
    let value = "";
    let nam = "", thang = "", ngay = "";
    let gio = "", phut = "", giay = "";
    if (text != "" && text != null && text != undefined) {
      nam = text.substring(0, 4);
      thang = text.substring(4, 6);
      ngay = text.substring(6, 8);
      gio = text.substring(8, 10);
      phut = text.substring(10, 12);
      giay = text.substring(12, 14);
      value = ngay + "/" + thang + "/" + nam + " " + gio + ":" + phut + ":" + giay;
    }
    return value;
  }

  public async exportExcel() {
    this.loadingReport = true;
    this.btnExport.nativeElement.disabled = true;
    let accountID = "0";
    if (this.isAdmin)
      accountID = this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : "";
    else accountID = this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : this.authService.currentUserValue.ACCOUNT_ID;

    let result: boolean = await this.dataService.getFileExtentionSmsStatisticAsync("/api/FileExtention/ExportExcelSmsStatistic",
      accountID,
      this.selectedSenderID.length > 0 ? this.selectedSenderID[0].id : "",
      this.smsContent,
      this.phone,
      this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : "",
      this.stringVTL,
      this.stringGPC,
      this.stringVMS,
      this.stringVNM, this.stringGTEL, this.stringSFONE, this.stringDD, this.fromDate, this.toDate,
      this.selectedPartnerID.length > 0 && this.selectedPartnerID[0].id != "" ? this.selectedPartnerID[0].id : "",
      this.selectedSmsStatus.length > 0 && this.selectedSmsStatus[0].id != "" ? this.selectedSmsStatus[0].id : "",
      this.selectedTypeSend.length > 0 && this.selectedTypeSend[0].id != "" ? this.selectedTypeSend[0].id : "",
      this.isAdmin == true ? 1 : 0,
      this.isCntBrandName ? 1 : 0,
      this.isCntDate ? 1 : 0
      , "SmsList");
    if (result) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
    }
    this.loadingReport = false;
    this.btnExport.nativeElement.disabled = false;
  }

  //confirm show modal send mail report
  async confirmShowSendMailReport() {
    // check account
    if (this.selectedAccountID.length == 0 || this.selectedAccountID[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-21"));
      return;
    }
    let accountId = this.selectedAccountID[0].id;

    // check sender
    if (this.selectedSenderID.length == 0 || this.selectedSenderID[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }

    // check type
    if (this.selectedSmsType.length == 0 || this.selectedSmsType[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-104"));
      return;
    }

    // check phone content
    if (this.dataSms == null || this.dataSms.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("103"));
      return;
    }

    let resultAcc = await this.dataService.getAsync('/api/account/' + accountId);
    if (resultAcc && (resultAcc.data[0].EMAIL == null || resultAcc.data[0].EMAIL == "")) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-107"));
      this.confirmSendReportModal.hide();
      return;
    }
    this.mailReceiveReport = resultAcc.data[0].EMAIL;
    this.confirmSendReportModal.show();
  }

  async sendReport() {
    this.btnReport.nativeElement.disabled = true;
    this.loadingReport = true;
    this.loading = true;
    let accountId = this.selectedAccountID[0].id;
    let senderId = this.selectedSenderID[0].id;
    let smsType = this.selectedSmsType[0].id;
    let partner = this.selectedPartnerID.length > 0 ? this.selectedPartnerID[0].id : "";
    let status = this.selectedSmsStatus.length > 0 ? this.selectedSmsStatus[0].id : "";

    let result = await this.dataService.postAsync("/api/FileExtention/SendReportSms?account_id=" + accountId + '&sender_id=' + senderId +
      '&sms_content=' + this.smsContent + '&phone=' + this.phone + '&sms_type=' + smsType +
      '&viettel=' + this.stringVTL + '&vina=' + this.stringGPC + '&mobi=' + this.stringVMS +
      '&vnMobile=' + this.stringVNM + '&gtel=' + this.stringGTEL + '&sfone=' + this.stringSFONE +
      '&ddMobile=' + this.stringDD + '&from_date=' + this.fromDate + '&to_date=' + this.toDate +
      '&partner_code=' + partner + '&sms_status=' + status);
    if (result != null && result.err_code == 0) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("150"));
    }
    else if (result.err_code == -12) {
      this.notificationService.displaySuccessMessage("Kiểm tra lại setting mail gửi (sercurity)");
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
    this.loading = false;
    this.loadingReport = false;
    this.btnReport.nativeElement.disabled = false;
    this.confirmSendReportModal.hide();
  }
}
