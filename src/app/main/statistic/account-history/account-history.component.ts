import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective, BsModalService } from 'ngx-bootstrap';
import { Pagination } from 'src/app/core/models/pagination';
import { DataService } from 'src/app/core/services/data.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.css']
})
export class AccountHistoryComponent implements OnInit {

  public dataAccountHistory = [];
  public dataAccount = [];
  public dataSenderName = [];
  public dataSmsType = [];
  public dataTypeSend = [];
  public settingsFilterAccount = {};
  public selectedAccount = [];
  public settingsFilterSender = {};
  public selectedSender = [];
  public settingsFilterSmsType = {};
  public selectedSmsType = [];
  public settingsFilterTypeSend = {};
  public selectedTypeSend = [];
  public content: string = '';
  public ip: string = '';
  public fromDate: string = "";
  public toDate: string = "";
  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();
  public pagination: Pagination = new Pagination();
  public isAdmin: boolean = false;
  public loadingGrid: boolean = false;


  constructor(
    private dataService: DataService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private authService: AuthService) {
    modalService.config.backdrop = 'static';

    this.settingsFilterAccount = {
      text: this.utilityService.translate('account_history.choose_account'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterSender = {
      text: this.utilityService.translate('account_history.choose_sender'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterSmsType = {
      text: this.utilityService.translate('account_history.choose_sms_type'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.settingsFilterTypeSend = {
      text: this.utilityService.translate('account_history.choose_type_send'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.dataTypeSend.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.dataTypeSend.push({ "id": "Gửi bình thường", "itemName": this.utilityService.translate('account_history.normal') });
    this.dataTypeSend.push({ "id": "Gửi  danh sách số điện thoại", "itemName": this.utilityService.translate('account_history.list_phone') });
    this.dataTypeSend.push({ "id": "Gửi tùy biến", "itemName": this.utilityService.translate('account_history.customize') });
  }

  ngOnInit() {
    this.dataAccount.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.dataSmsType.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.getAccountDetail();
    this.fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    this.toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
  }

  async getAccountDetail() {
    let response = await this.dataService.getAccountDetail();
    let is_admin = response.data[0].IS_ADMIN;
    let roleAccess = response.data[0].ROLE_ACCESS;
    if (roleAccess == 50 || roleAccess == 53 || is_admin == 1) {
      this.isAdmin = true;
    }
    else {
      this.isAdmin = false;
    }
    this.getDataAccount();
    this.bindDataSmsType();
    this.getData();
  }

  //#region load data account
  async getDataAccount() {
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/account');
      for (let index in response.data) {
        this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
      this.getDataSenderName("", "");
    }
    else {
      let response = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in response.data) {
        this.dataAccount.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
      if (this.dataAccount.length == 1)
        this.selectedAccount.push({ "id": this.dataAccount[0].id, "itemName": this.dataAccount[0].itemName });
      else
        this.selectedAccount.push({ "id": "", "itemName": this.utilityService.translate("global.choose_account") });
      this.getDataSenderName(this.authService.currentUserValue.ACCOUNT_ID, "");
    }
  }

  onSelectAccountOrType() {
    if (this.isAdmin) {
      if (this.selectedAccount.length > 0 && this.selectedSmsType.length > 0)
        this.getDataSenderName(this.selectedAccount[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccount[0].id : "", this.selectedSmsType[0].itemName != this.utilityService.translate('global.all') ? this.selectedSmsType[0].id : "");
      else if (this.selectedAccount.length == 0 && this.selectedSmsType.length > 0)
        this.getDataSenderName("", this.selectedSmsType[0].itemName != this.utilityService.translate('global.all') ? this.selectedSmsType[0].id : "");
      else if (this.selectedAccount.length > 0 && this.selectedSmsType.length == 0)
        this.getDataSenderName(this.selectedAccount[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccount[0].id : "", "");
    } else {
      if (this.selectedAccount.length > 0 && this.selectedSmsType.length > 0)
        this.getDataSenderName(this.selectedAccount[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID, this.selectedSmsType[0].itemName != this.utilityService.translate('global.all') ? this.selectedSmsType[0].id : "");
      else if (this.selectedAccount.length == 0 && this.selectedSmsType.length > 0)
        this.getDataSenderName("", this.selectedSmsType[0].itemName != this.utilityService.translate('global.all') ? this.selectedSmsType[0].id : "");
      else if (this.selectedAccount.length > 0 && this.selectedSmsType.length == 0)
        this.getDataSenderName(this.selectedAccount[0].itemName != this.utilityService.translate('global.all') ? this.selectedAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID, "");
    }
  }

  onDeSelectAccountOrType() {
    this.selectedSender = [];
    this.dataSenderName = [];
  }
  //#endregion

  //get sender name
  async getDataSenderName(accountID, smsType) {
    this.selectedSender = [];
    this.dataSenderName = [];
    this.dataSenderName.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' +
        accountID + "&smsType=" + smsType)
      for (let index in response.data) {
        this.dataSenderName.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    } else {
      let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderParentAndChild?accountID=' +
        accountID + "&smsType=" + smsType)
      for (let index in response.data) {
        this.dataSenderName.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
  }

  //#region load sms type
  public async bindDataSmsType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
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

  async getData() {
    this.loadingGrid = true;
    let accountId = "";
    if (this.isAdmin)
      accountId = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : "";
    else
      accountId = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : 0;

    let senderName = this.selectedSender.length > 0 ? this.selectedSender[0].itemName == this.utilityService.translate('global.all') ? "" : this.selectedSender[0].itemName : "";
    let smsType = this.selectedSmsType.length > 0 ? this.selectedSmsType[0].itemName == this.utilityService.translate('global.all') ? "" : this.selectedSmsType[0].id : "";
    let typeSend = this.selectedTypeSend.length > 0 ? this.selectedTypeSend[0].itemName == this.utilityService.translate('global.all') ? "" : this.selectedTypeSend[0].id : "";
    let from_date = this.fromDate != "" ? this.fromDate : this.timeFrom != null ? this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd") : "";
    let to_date = this.toDate != "" ? this.toDate : this.timeTo != null ? this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd") : "";
    let response: any = await this.dataService.getAsync('/api/AccountHistory/GetAccountHistoryPaging?pageIndex=' + this.pagination.pageIndex
      + '&pageSize=' + this.pagination.pageSize + '&account_id=' + accountId + '&sender_name=' + senderName + '&content=' + this.content
      + '&type_sms=' + smsType + '&type_send=' + typeSend + '&ip=' + this.ip + '&begin_date=' + from_date + '&end_date=' + to_date);

    if (response.err_code == 0) {
      this.loadData(response);
    }
    else { }
    if (response.err_code == 103) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("103"));
    }
    this.loadingGrid = false;
  }

  loadData(response?: any) {
    if (response) {
      this.dataAccountHistory = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
  }

  setPageIndex(pageNo: number): void {
    this.pagination.pageIndex = pageNo;
    this.getData();
  }
  pageChanged(event: any): void {
    this.setPageIndex(event.page);
  }

  changePageSize(size) {
    this.pagination.pageSize = size;
    this.pagination.pageIndex = 1;
    this.getData();
  }
}
