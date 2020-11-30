import { Component, OnInit, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/core/models/pagination';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AppConst } from 'src/app/core/common/app.constants';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-sms-error',
  templateUrl: './sms-error.component.html',
  styleUrls: ['./sms-error.component.css']
})
export class SmsErrorComponent implements OnInit {
  @ViewChild('confirmSendRepeatModal', { static: false }) public confirmSendRepeatModal: ModalDirective;
  @ViewChild('btnSearch', { static: false }) public btnSearch;
  @ViewChild('btnExport', { static: false }) public btnExport;

  public dataSms;
  public smsContent: string = "";
  public phone: string = "";
  public fromDate: string = "";
  public toDate: string = "";
  public roleAccess = 0;
  public is_admin = 0;
  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();
  public viettel: boolean = false;
  public mobiphone: boolean = false;
  public vinaphone: boolean = false;
  public vietnameMobile: boolean = false;
  public gtel: boolean = false;
  public sfone: boolean = false;
  public countAll = 0;
  public countVTL = 0;
  public countGPC = 0;
  public countVMS = 0;
  public countVNM = 0;
  public countGtel = 0;
  public countSFone = 0;
  public accountId: string = "";
  public fromHome: boolean = false;
  public isAdmin: boolean = false;
  public changeDate: boolean = false;
  public loadingGrid: boolean = false;
  public loadingExport: boolean = false;

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
  public isCheckedSms: boolean = false;
  public arrIdCheckedSms: string[] = [];
  public arrCampainId: string[] = [];
  public arrIdSms: string = "";
  public ids: any;

  constructor(private authService: AuthService,
    private activatedRoute: ActivatedRoute,
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

    this.dataAccount.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.bindDataAccount();
    this.dataPartner.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.bindDataPartner();
    this.dataSmsType.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.bindDataSmsType();
    this.dataSmsStatus.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.bindDataSmsStatus();
    this.fromDate = (this.timeFrom == null) ? '' : this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    this.toDate = (this.timeTo == null) ? '' : this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
    if (this.activatedRoute.snapshot.queryParamMap.get('redirectTo') && this.activatedRoute.snapshot.queryParamMap.get('redirectTo') == 'smsErrByMonth') {
      this.fromHome = true;
      this.getsmsErrByMonth();
    } else {
      this.getListSms();
    }
    this.bindDataTypeSend();
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
        this.selectedAccountID.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
    }
    this.loadListSenderName();
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
    if (this.isAdmin) {
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' +
        (this.selectedAccountID.length > 0 ? this.selectedAccountID[0].id : "") + "&smsType=" + (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : ""));
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
    else {
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderNameByAccountLogin');
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
  }
  //#endregion

  //#region smsType
  public async bindDataSmsType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
  }

  onItemSelectSmsType() {
    this.loadListSenderName();
  }
  //#endregion

  //#region sms status
  public async bindDataSmsStatus() {
    this.dataSmsStatus = [];
    let response: any = await this.dataService.getAsync('/api/sms/GetSmsStatus');
    if (response) {
      for (let i in response.data) {
        this.dataSmsStatus.push({ "id": response.data[i].SENT_ERR_CODE, "itemName": response.data[i].SENT_ERR_CODE + "|UNDELIVERED" });
      }
    }
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
    if (this.fromHome && !this.isAdmin) {
      this.accountId = this.authService.currentUserValue.ACCOUNT_ID;
    }
    else if (this.isAdmin) {
      this.accountId = this.selectedAccountID != null && this.selectedAccountID.length > 0 && this.selectedAccountID[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccountID[0].id : "";
    }
    else {
      this.accountId = (this.selectedAccountID != null && this.selectedAccountID.length > 0) && this.selectedAccountID[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccountID[0].id : this.authService.currentUserValue.ACCOUNT_ID;
    }
    if (!this.changeDate && !this.fromHome) {
      this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
      this.toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
    }
    this.fromHome = false;
    let partnerCode = this.selectedPartnerID.length > 0 && this.selectedPartnerID[0].id != "" ? this.selectedPartnerID[0].id : "";
    let sentErrCode = this.selectedSmsStatus.length > 0 && this.selectedSmsStatus[0].id != "" ? this.selectedSmsStatus[0].id : "";
    let typeSend = this.selectedTypeSend.length > 0 && this.selectedTypeSend[0].id != "" ? this.selectedTypeSend[0].id : "";
    let sender = this.selectedSenderID.length > 0 ? this.selectedSenderID[0].itemName == this.utilityService.translate('global.all') ? "" : this.selectedSenderID[0].itemName : "";
    let response: any = await this.dataService.getAsync('/api/sms/GetSmsError?pageIndex=' + this.pagination.pageIndex +
      '&pageSize=' + this.pagination.pageSize + '&account_id=' + this.accountId +
      '&sender_name=' + sender.trim() + '&sms_content=' + this.smsContent + '&phone=' + this.phone +
      '&sms_type=' + (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : "") + '&viettel=' + (this.viettel == true ? "VIETTEL" : "") +
      '&vina=' + (this.vinaphone == true ? "GPC" : "") + '&mobi=' + (this.mobiphone == true ? "VMS" : "") +
      '&vnMobile=' + (this.vietnameMobile == true ? "VNM" : "") + '&gtel=' + (this.gtel == true ? "GTEL" : "") + '&sfone=' + (this.sfone == true ? "SFONE" : "") +
      '&ddMobile=&tu_ngay=' + this.fromDate + '&den_ngay=' + this.toDate +
      '&partner_code=' + partnerCode + '&sent_err_code=' + sentErrCode + "&via=" + typeSend);

    if (response != null && response.err_code == 0) {
      this.dataSms = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }

      //count sms bt telco
      if (response.pagination.TotalRows > 0) {
        let responseCountSms = await this.dataService.getAsync('/api/sms/CountSMSByTelco?account_id=' + this.accountId +
          '&sender_name=' + sender.trim() + '&sms_content=' + this.smsContent + '&phone=' + this.phone +
          '&sms_type=' + (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : "") + '&viettel=' + (this.viettel == true ? "VIETTEL" : "") +
          '&vina=' + (this.vinaphone == true ? "GPC" : "") + '&mobi=' + (this.mobiphone == true ? "VMS" : "") +
          '&vnMobile=' + (this.vietnameMobile == true ? "VNM" : "") + '&gtel=' + (this.gtel == true ? "GTEL" : "") + '&sfone=' + (this.sfone == true ? "SFONE" : "") +
          '&tu_ngay=' + this.fromDate + '&den_ngay=' + this.toDate +
          '&partner_code=' + (this.selectedPartnerID.length > 0 ? this.selectedPartnerID[0].id : "") +
          '&sent_err_code=' + (this.selectedSmsStatus.length > 0 ? this.selectedSmsStatus[0].id : ""));

        if (responseCountSms != null && responseCountSms.data != null && responseCountSms.data.length > 0) {
          this.countVTL = responseCountSms.data[0].VIETTEL;
          this.countGPC = responseCountSms.data[0].GPC;
          this.countVMS = responseCountSms.data[0].VMS;
          this.countVNM = responseCountSms.data[0].VNM;
          this.countGtel = responseCountSms.data[0].GTEL;
          this.countSFone = responseCountSms.data[0].SFONE;
          this.countAll = this.countVTL + this.countGPC + this.countVMS + this.countVNM + this.countGtel + this.countSFone;
        }
      } else {
        this.countVTL = 0;
        this.countGPC = 0;
        this.countVMS = 0;
        this.countVNM = 0;
        this.countGtel = 0;
        this.countAll = 0;
      }
    }
    this.loadingGrid = false;
    this.btnSearch.nativeElement.disabled = false;
  }

  //#region load data and paging
  public async getsmsErrByMonth() {
    let time = new Date();
    let lastDay = new Date(time.getFullYear(), time.getMonth() + 1, 0);
    this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMM") + "01";
    this.toDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMM") + this.utilityService.formatDateToString(lastDay, "dd");
    this.getListSms();
  }

  pageChanged(event: any): void {
    this.isCheckedSms = false;
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
    this.changeDate = true;
  }

  onChangeToDate(event) {
    this.changeDate = true;
    this.toDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
  }

  public async searchSms(form) {
    this.smsContent = form.smsContent.trim();
    this.fromDate = this.utilityService.formatDateToString(form.fromDate, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(form.toDate, "yyyyMMdd");
    this.phone = form.phone.trim();
    // if (this.fromDate > this.toDate) {
    //   this.notificationService.displayWarnMessage("Ngày tin nhắn chưa thỏa mãn");
    //   return;
    // }
    //this.getListSms();
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
    this.loadingExport = true;
    this.btnExport.nativeElement.disabled = true;
    let sender = this.selectedSenderID.length > 0 ? this.selectedSenderID[0].itemName == this.utilityService.translate('global.all') ? "" : this.selectedSenderID[0].itemName : "";
    let result: boolean = await this.dataService.getFileExtentionSmsErrorAsync('/api/FileExtention/ExportExcelSmsError', this.accountId
      , sender, this.smsContent, this.phone
      , (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : ""), (this.viettel == true ? "VIETTEL" : "")
      , (this.vinaphone == true ? "GPC" : ""), (this.mobiphone == true ? "VMS" : ""), (this.vietnameMobile == true ? "VNM" : "")
      , (this.gtel == true ? "GTEL" : ""), (this.sfone == true ? "SFONE" : ""), this.fromDate, this.toDate
      , (this.selectedPartnerID.length > 0 && this.selectedPartnerID[0].id != "" ? this.selectedPartnerID[0].id : "")
      , (this.selectedSmsStatus.length > 0 && this.selectedSmsStatus[0].id != "" ? this.selectedSmsStatus[0].id : "")
      ,(this.selectedTypeSend.length > 0 && this.selectedTypeSend[0].id != "" ? this.selectedTypeSend[0].id : "")
      , "SmsError");
    if (result) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
    }
    this.loadingExport = false;
    this.btnExport.nativeElement.disabled = false;
  }

  checkAllSms(isChecked) {
    this.isCheckedSms = isChecked;
    if (this.isCheckedSms) {
      for (let index in this.dataSms) {
        let id = this.dataSms[index].ID;
        let campaign_id = this.dataSms[index].CAMPAIGN_ID;
        const indexId: number = this.arrIdCheckedSms.indexOf(id);
        if (indexId === -1) {
          this.arrIdCheckedSms.push(id);
        }
        const indexCampainId: number = this.arrCampainId.indexOf(campaign_id);
        if (indexCampainId === -1) {
          this.arrCampainId.push(id);
        }
      }
    } else {
      this.arrIdCheckedSms = [];
      this.arrCampainId = [];
    }
  }

  checkRowSms(isChecked, id, campaign_id) {
    const index: number = this.arrIdCheckedSms.indexOf(id);
    const indexCampaign: number = this.arrCampainId.indexOf(campaign_id);
    if (index !== -1) {
      if (!isChecked) {
        this.arrIdCheckedSms.splice(index, 1);
      }
    }
    else if (isChecked) {
      this.arrIdCheckedSms.push(id);
    }

    if (indexCampaign !== -1) {
      if (!isChecked) {
        this.arrCampainId.splice(index, 1);
      }
    }
    else if (isChecked) {
      this.arrCampainId.push(campaign_id);
    }

    if (this.arrIdCheckedSms.length == 0) {
      this.isCheckedSms = false;
    }
  }

  confirmSendRepeat() {
    if (this.arrIdCheckedSms.length > 0) {
      this.arrIdSms = this.arrIdCheckedSms.join(", ");
      this.ids = this.arrIdCheckedSms.length;
      this.confirmSendRepeatModal.show();
    }
  }

  async sendRepeat() {
    let IDS = this.arrIdSms;
    let CAMPAIGN_IDS = this.arrCampainId.join(", ");
    let response: any = await this.dataService.putAsync('/api/sms/SendRepeatSms', { IDS, CAMPAIGN_IDS });
    if (response.err_code == 0) {
      this.arrIdCheckedSms = [];
      this.confirmSendRepeatModal.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
    }

  }
}
