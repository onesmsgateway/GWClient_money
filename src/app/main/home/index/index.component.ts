import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { Pagination } from 'src/app/core/models/pagination';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})

export class IndexComponent implements OnInit {

  public smsErr = 0;
  public newCustomer = 0;
  public accountExpiredQuota = 0;
  public senderExpired = 0;
  // public currentDate = this.utilityService.formatDateToString(new Date, "dd/MM/yyyy");
  public currentDate = "01/09/2019";

  types: string[] = ["line", "stackedline"];

  public grossProductData: any = [];
  public month_now;
  public month_old1;
  public month_old2;

  public grossSmsTelco: any = [];
  public grossSmsGroupSender: any = [];

  public dataSmsMonth: any = [];

  valueText: string;
  public totalSenderExpired = 0;
  public totalSmsWaitApprove = 0;
  public thisAccount;
  public isAdmin: boolean = false;
  public isAdminBranch: boolean = false;
  public isCustomer: boolean = false;

  public settingsFilterSender = {};
  public selectedSenderID = [];
  public dataSender = [];
  public dataSmsByPhone = [];

  public phone = "";
  public pagination: Pagination = new Pagination();

  constructor(private dataService: DataService,
    private authService: AuthService,
    private utilityService: UtilityService) {
    this.settingsFilterSender = {
      text: this.utilityService.translate("global.choose_sender"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };
  }

  ngOnInit() {
    this.getAccountLogin();
  }

  // bind data account
  //#region account
  async getAccountLogin() {
    let result = await this.dataService.getAsync('/api/account/GetInfoAccountLogin');
    let is_admin = result.data[0].IS_ADMIN;
    let roleAccess = result.data[0].ROLE_ACCESS;
    if (roleAccess == 50 || roleAccess == 53 || is_admin == 1) {
      this.isAdmin = true;
      this.isAdminBranch = false;
      this.isCustomer = false;
    }
    else if (roleAccess == 53) {
      this.isAdmin = false;
      this.isAdminBranch = true;
      this.isCustomer = false;
    }
    else {
      this.isAdmin = false;
      this.isAdminBranch = false;
      this.isCustomer = true;
    }

    this.loadListSenderName();
    this.getSmsWaitApprove();
    this.getSMSError();
    this.getSenderExpired();
    this.getAccountExpiredQuota();
    this.getAccountNew();
    this.getSmsPartner();
    this.getSmsTelco();
    this.getSmsGroupSender();
    this.getSmsByMonth();
  }

  //#region sender
  async loadListSenderName() {
    this.dataSender = [];
    this.selectedSenderID = [];
    let response = await this.dataService.getAsync('/api/SenderName/GetSenderNameByAccountLogin');
    for (let index in response.data) {
      this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
    }
  }
  //#endregion

  //#region load sms list by phone
  public async searchSms(form) {
    this.phone = form.phone.trim();
    this.getListSms();
  }

  async getListSms() {
    this.dataSmsByPhone = [];
    // if (this.phone != undefined && this.phone != null && this.phone != ""){
    let response = await this.dataService.getAsync('/api/sms/FindSmsByPhone?pageIndex=' + this.pagination.pageIndex +
      '&pageSize=' + this.pagination.pageSize + '&phone=' + this.phone +
      '&sender_name=' + (this.selectedSenderID.length > 0 ? this.selectedSenderID[0].itemName : "") +
      '&tu_ngay=&den_ngay=');
    this.loadData(response);
    // }
  }

  loadData(response?: any) {
    if (response) {
      this.dataSmsByPhone = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
  }
  //#endregion

  //#region paging
  setPageIndex(pageNo: number): void {
    this.pagination.pageIndex = pageNo;
    this.getListSms();
  }

  pageChanged(event: any): void {
    this.setPageIndex(event.page);
  }

  changePageSize(size) {
    this.pagination.pageSize = size;
    this.pagination.pageIndex = 1;
    this.getListSms();
  }
  //#endregion

  customizeLabel(arg) {
    return arg.valueText + " (" + arg.percentText + ")";
  }

  customizeLabelPieChart(point) {
    return point.argumentText + ": " + point.valueText + "%";
  }

  onPointClick(e) {
    e.target.select();
  }

  temperatureCustomizeText() {
    return this.valueText + " SMS";
  }

  precipitationCustomizeText() {
    return this.valueText + " SMS";
  }

  /**
   * async getSenderExpired
   */
  public async getSenderExpired() {
    let response = await this.dataService.getAsync('/api/SenderName/GetSenderExpiredTime/');
    if (response)
      this.totalSenderExpired = response.pagination.TotalRows;
  }

  // get tin can duyet
  public async getSmsWaitApprove() {
    if (this.isAdmin) {
      let response = await this.dataService.getAsync('/api/CampaignDetail/GetSmsWaitApprove?accountID=');
      let result = response.data;
      this.totalSmsWaitApprove = 0;
      if (result != undefined && result != null) {
        if (result.length > 0)
          this.totalSmsWaitApprove = (result[0].TOTAL_CAMPAIGN != undefined && result[0].TOTAL_CAMPAIGN != null && result[0].TOTAL_CAMPAIGN != "") ? result[0].TOTAL_CAMPAIGN : 0;
      }
    }
    else {
      let response = await this.dataService.getAsync('/api/CampaignDetail/GetSmsWaitApprove?accountID=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      let result = response.data;
      this.totalSmsWaitApprove = 0;
      if (result != undefined && result != null) {
        if (result.length > 0)
          this.totalSmsWaitApprove = (result[0].TOTAL_CAMPAIGN != undefined && result[0].TOTAL_CAMPAIGN != null && result[0].TOTAL_CAMPAIGN != "") ? result[0].TOTAL_CAMPAIGN : 0;
      }
    }
  }

  // get tin nhan loi
  async getSMSError() {
    let time = new Date();
    let lastDay = new Date(time.getFullYear(), time.getMonth() + 1, 0);
    let fromDate = this.utilityService.formatDateToString(time, "yyyyMM") + "01";
    let toDate = this.utilityService.formatDateToString(time, "yyyyMM") + this.utilityService.formatDateToString(lastDay, "dd");
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/sms/GetSmsError?pageIndex=1&pageSize=9999999&account_id=&sender_name=&sms_content=&phone=&sms_type=&viettel=&vina=&mobi=&vnMobile=&gtel=&sfone=&tu_ngay=' + fromDate + '&den_ngay=' + toDate + '&partner_code=&receive_result=');
      if (response) {
        this.smsErr = response.pagination.TotalSms;
      }
    } else {
      let response: any = await this.dataService.getAsync('/api/sms/GetSmsError?pageIndex=1&pageSize=9999999&account_id=' + this.authService.currentUserValue.ACCOUNT_ID + '&sender_name=&sms_content=&phone=&sms_type=&viettel=&vina=&mobi=&vnMobile=&gtel=&sfone=&tu_ngay=' + fromDate + '&den_ngay=' + toDate + '&partner_code=&receive_result=');
      if (response) {
        this.smsErr = response.pagination.TotalSms;
      }
    }

  }

  // get khach moi
  async getAccountNew() {
    let response: any = await this.dataService.getAsync('/api/account/GetAccountNew?pageIndex=1&pageSize=1');
    if (response) {
      this.newCustomer = response.pagination.TotalRows;
    }
  }

  // get tai khoan sap het quota
  async getAccountExpiredQuota() {
    let response: any = await this.dataService.getAsync('/api/account/GetAccountExpiredQuota?pageIndex=1&pageSize=1');
    if (response) {
      this.accountExpiredQuota = response.pagination.TotalRows;
    }
  }

  //#region bieu do so sanh san luong sms 3 thang gan nhat giua cac doi tac
  public async getSmsPartner() {
    let response: any = await this.dataService.getAsync('/api/sms/StatisticSmsPartner');
    let result = response.data;
    if (result != null && result.length > 0) {
      for (let i in result) {
        this.grossProductData.push({
          state: result[i].PARTNER_NAME, year2017: result[i].SUM_MONTH_OLD2,
          year2018: result[i].SUM_MONTH_OLD1, year2019: result[i].SUM_MONTH_NOW
        });
      }
      this.month_now = result[0].MONTH_NOW;
      this.month_old1 = result[0].MONTH_OLD1;
      this.month_old2 = result[0].MONTH_OLD2;
    }
  }
  //#endregion

  //#region bieu do so sanh san luong sms 3 thang gan nhat giua cac nha mang
  public async getSmsTelco() {
    let response: any = await this.dataService.getAsync('/api/sms/StatisticSmsTelco');
    let result = response.data;
    for (let i in result) {
      this.grossSmsTelco.push({
        state: result[i].TELCO, monthOld2: result[i].SUM_MONTH_OLD2,
        monthOld1: result[i].SUM_MONTH_OLD1, monthNow: result[i].SUM_MONTH_NOW
      });
    }
  }
  //#endregion

  //#region bieu do san luong tin theo nhom thuong hieu
  public async getSmsGroupSender() {
    let response: any = await this.dataService.getAsync('/api/sms/StatisticSmsGroupSenderTelco');
    let result = response.data;
    for (let i in result) {
      this.grossSmsGroupSender.push({
        state: result[i].CODE, viettel: result[i].SUM_VIETTEL, gpc: result[i].SUM_GPC,
        vms: result[i].SUM_VMS, vnm: result[i].SUM_VNM, gtel: result[i].SUM_GTEL
      });
    }
  }
  //#endregion

  //#region bieu do thong ke tin nhan theo thang
  public async getSmsByMonth() {
    let response: any = await this.dataService.getAsync('/api/sms/GetSmsByMonth');
    let result = response.data;
    for (let i in result) {
      this.dataSmsMonth.push({
        month: result[i].MONTH,
        sumCSKH: result[i].COUNT_SMS_CSKH,
        sumQC: result[i].COUNT_SMS_QC
      });
    }
  }
  //#endregion
}
