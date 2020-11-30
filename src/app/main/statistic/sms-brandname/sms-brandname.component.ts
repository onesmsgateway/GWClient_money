import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Pagination } from 'src/app/core/models/pagination';
import { UtilityService } from 'src/app/core/services/utility.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Role } from 'src/app/core/models/role';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sms-brandname',
  templateUrl: './sms-brandname.component.html',
  styleUrls: ['./sms-brandname.component.css']
})
export class SmsBrandnameComponent implements OnInit {

  public fromDate: string = "";
  public toDate: string = "";

  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();

  public dataSms;
  public dataSmsNew;
  public dataComboboxSearch = [];

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

  public role: Role = new Role();
  public isAdmin: boolean = false;

  constructor(private dataService: DataService,
    private utilityService: UtilityService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService) {

    this.activatedRoute.data.subscribe(data => {
      this.utilityService.getRole(data.MENU_CODE).then((response) => {
        if (response) this.role = response;
      })
    });

    this.settingsFilterAccount = {
      text: "Chọn tài khoản",
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: "Tìm kiếm",
      noDataLabel: "Không có dữ liệu"
    };
    this.dataAccount.push({ "id": "", "itemName": "Tất cả" });

    this.settingsFilterSender = {
      text: "Chọn thương hiệu",
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: "Tìm kiếm",
      noDataLabel: "Không có dữ liệu"
    };

    this.settingsFilterPartner = {
      text: "Chọn cổng",
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: "Tìm kiếm",
      noDataLabel: "Không có dữ liệu"
    };
    this.dataPartner.push({ "id": "", "itemName": "Tất cả" });
    this.bindDataPartner();

    this.settingsFilterSmsType = {
      text: "Chọn loại tin nhắn",
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: "Tìm kiếm",
      noDataLabel: "Không có dữ liệu"
    };
    this.dataSmsType.push({ "id": "", "itemName": "Tất cả" });
    this.bindDataSmsType();
  }

  ngOnInit() {
    this.getAccountDetail();
    this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
    this.getListSms();
  }

  async getAccountDetail() {
    let response = await this.dataService.getAccountDetail();
    if (response != null) {
      if (response.data[0].ROLE_ACCESS == 50 || response.data[0].IS_ADMIN == 1 || response.data[0].ROLE_ACCESS == 53)
        this.isAdmin = true;
      else
        this.isAdmin = false;
    }
    this.bindDataAccount();
  }

  //#region account
  public async bindDataAccount() {
    if (this.isAdmin) {
      this.selectedAccountID = [{ "id": 0, "itemName": this.utilityService.translate("global.choose_account") }];
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
        this.selectedAccountID.push({ "id": this.dataAccount[0].id, "itemName": this.dataAccount[0].itemName });
      }
      else
        this.selectedAccountID.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
    }
    this.loadListSenderName();
    // if (this.selectedAccountID.length > 0) {
    //   this.getDataSenderName(this.selectedItemComboboxAccount[0].id);
    // }
    // 
  }

  onItemSelect() {
    this.loadListSenderName();
    this.getListSms();
  }

  OnItemDeSelect() {
    this.selectedAccountID = [];
    this.loadListSenderName();
    this.getListSms();
  }

  //#endregion

  //#region sender
  async loadListSenderName() {
    this.dataSender = [];
    this.selectedSenderID = [];
    this.dataSender.push({ "id": "", "itemName": "Tất cả" });
    let accountId = this.selectedAccountID.length != 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].itemName == "Tất cả" ? "" : this.selectedAccountID[0].id : "";
    let response = await this.dataService.getAsync('/api/SenderName/GetSenderNameByAccountID?account_id=' + accountId);
    for (let index in response.data) {
      this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
    }
  }

  onItemSelectSender() {
    this.getListSms();
  }

  OnItemDeSelectSender() {
    this.getListSms();
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

  onItemSelectPartner() {
    this.getListSms();
  }

  OnItemDeSelectPartner() {
    this.selectedPartnerID = [];
    this.getListSms();
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
    this.getListSms();
  }

  OnItemDeSelectSmsType() {
    this.getListSms();
  }
  //#endregion

  //#region change date time
  onChangeFromDate(event) {
    if (this.fromDate > this.toDate) {
      this.notificationService.displayWarnMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
    this.fromDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
    this.getListSms();
  }

  onChangeToDate(event) {
    this.toDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
    if (this.fromDate > this.toDate) {
      this.notificationService.displayWarnMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
    this.toDate = this.utilityService.formatDateToString(event, "yyyyMMdd");
    this.getListSms();
  }
  //#endregion

  async searchSms(form) {
    this.fromDate = this.utilityService.formatDateToString(form.fromDate, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(form.toDate, "yyyyMMdd");
    if (this.fromDate > this.toDate) {
      this.notificationService.displaySuccessMessage("Ngày tin nhắn chưa thỏa mãn");
      return;
    }
    this.getListSms();
  }

  //#region load data
  async getListSms() {
    this.dataSmsNew = [];
    let accountId = this.selectedAccountID.length != 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].itemName == "Tất cả" ? "" : this.selectedAccountID[0].id : "";
    let senderName = this.selectedSenderID.length != 0 && this.selectedSenderID[0].itemName != "" ? this.selectedSenderID[0].itemName == "Tất cả" ? "" : this.selectedSenderID[0].itemName : "";
    let smsType = this.selectedSmsType.length != 0 && this.selectedSmsType[0].id != "" ? this.selectedSmsType[0].itemName == "Tất cả" ? "" : this.selectedSmsType[0].id : "";
    let partnerId = this.selectedPartnerID.length != 0 && this.selectedPartnerID[0].id != "" ? this.selectedPartnerID[0].itemName == "Tất cả" ? "" : this.selectedPartnerID[0].id : "";
    let response = await this.dataService.getAsync('/api/sms/StatisticSmsBySendername?account_id=' + accountId + '&sender_name=' + senderName +
      '&sms_type=' + smsType + '&tu_ngay=' + this.fromDate + '&den_ngay=' + this.toDate + '&partner_code=' + partnerId + '&telco=' + '');
    if (response.err_code == 0) {
      this.dataSmsNew = response.data;
    }
  }
  //#endregion

  //#region export excel
  async exportExcel() {
    if (this.dataSmsNew.length > 0) {
      let abc = JSON.stringify(this.dataSmsNew)
      let result: boolean = await this.dataService.getFileExtentionSmsByBrandnameAsync("/api/FileExtention/ExportExcelSmsByBrandname",
        abc, "ListSmsByBrandname");
      if (result) {
        this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
      }
    }
    else this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
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

}
