import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Pagination } from '../../../core/models/pagination';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../core/services/notification.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-account-cimast-tran',
  templateUrl: './account-cimast-tran.component.html',
  styleUrls: ['./account-cimast-tran.component.css']
})

export class AccountCimastTranComponent implements OnInit {
  @ViewChild('editDescriptionModal', { static: false }) public editDescriptionModal: ModalDirective;
  @ViewChild('btnExport', { static: false }) public btnExport;

  public dataAccountCimastTran;
  public dataAccount = [];
  public formEditAccountCimastTran: FormGroup;
  public pagination: Pagination = new Pagination();
  public selectedAccount = [];
  public settingsFilterAccount = {};
  public timeFrom: Date = new Date();
  public timeTo: Date = new Date();
  public description: string = "";
  public dataServices = [];
  public selectedServices = [];
  public settingsFilterService = {};
  public isAdmin: boolean = false;
  public loadingReport: boolean = false;

  constructor(
    private dataService: DataService,
    private utilityService: UtilityService,
    private notificationService: NotificationService,
    private authService: AuthService) {

    this.settingsFilterService = {
      text: this.utilityService.translate('global.choose_servicetype'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };
    this.settingsFilterAccount = {
      text: this.utilityService.translate('global.choose_account'),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate('global.search'),
      noDataLabel: this.utilityService.translate('global.no_data'),
      showCheckbox: false
    };

    this.formEditAccountCimastTran = new FormGroup({
      id: new FormControl(),
      description: new FormControl()
    });
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
      this.isAdmin = true;
    }
    else {
      this.isAdmin = false;
    }
    this.bindDataAccount();
    this.bindDataService();
    this.getDataAccountCimastTran();
  }

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
      if (this.dataAccount.length == 1)
        this.selectedAccount.push({ "id": this.dataAccount[0].id, "itemName": this.dataAccount[0].itemName });
      else
        this.selectedAccount.push({ "id": "", "itemName": this.utilityService.translate("global.choose_account") });
    }
  }

  setPageIndex(pageNo: number): void {
    this.pagination.pageIndex = pageNo;
    this.getDataAccountCimastTran();
  }

  pageChanged(event: any): void {
    this.setPageIndex(event.page);
  }

  changePageSize(size) {
    this.pagination.pageSize = size;
    this.pagination.pageIndex = 1;
    this.getDataAccountCimastTran();
  }

  public async bindDataService() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataServices.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
  }

  async getDataAccountCimastTran() {
    let accountid = "";
    if (this.isAdmin)
      accountid = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : "";
    else
      accountid = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID;
    let service = this.selectedServices.length > 0 && this.selectedServices[0].id != "" ? this.selectedServices[0].id : "";
    let fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    let toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");

    let response: any = await this.dataService.getAsync('/api/accountcimasttran/GetAccountCimastTranPaging?pageIndex=' + this.pagination.pageIndex
      + '&pageSize=' + this.pagination.pageSize + '&accountId=' + accountid + '&fromDate=' + fromDate + '&toDate=' + toDate + '&serviceName=' + service + '&description=' + this.description);
    this.loadData(response);
  }

  loadData(response?: any) {
    if (response) {
      this.dataAccountCimastTran = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
  }

  showConfirmEditAccount(tranid) {
    this.dataService.get('/api/accountcimasttran/' + tranid)
      .subscribe((response: any) => {
        if (response.err_code == 0) {
          let dataAccountCimast = response.data[0];
          this.formEditAccountCimastTran = new FormGroup({
            id: new FormControl(tranid),
            description: new FormControl(dataAccountCimast.DESCRIPTION)
          });
          this.editDescriptionModal.show();
        } else {
          this.notificationService.displayErrorMessage(response.err_message);
        }
      })
  }

  editAccountCimastTran() {
    let formData = this.formEditAccountCimastTran.controls;
    let TRAN_ID = formData.id.value;
    let DESCRIPTION = formData.description.value;
    this.dataService.put('/api/accountcimasttran/' + TRAN_ID, { DESCRIPTION })
      .subscribe((response: any) => {
        if (response.err_code == 0) {
          this.getDataAccountCimastTran();
          this.editDescriptionModal.hide();
          this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
        } else {
          this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
        }
      }, error => {
        console.log(error);
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
      });
  }

  public async exportExcelaccountCimastTran() {
    let result: boolean = await this.dataService.getFileExtentionAsync("/api/FileExtention/ExportExcel", "AccountCimastTran");
    if (result) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
    }
  }

  public async exportExcel() {
    this.loadingReport = true;
    this.btnExport.nativeElement.disabled = true;
    let accountid = "";
    if (this.isAdmin)
      accountid = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : "";
    else
      accountid = this.selectedAccount.length > 0 && this.selectedAccount[0].id != "" ? this.selectedAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID;
    let service = this.selectedServices.length > 0 && this.selectedServices[0].id != "" ? this.selectedServices[0].id : "";
    let fromDate = this.utilityService.formatDateToString(this.timeFrom, "yyyyMMdd");
    let toDate = this.utilityService.formatDateToString(this.timeTo, "yyyyMMdd");
    let des = this.description;

    let listParameter = "accountID=" + accountid + ",serviceName=" + service + ",fromDate=" + fromDate + ",toDate=" + toDate + ",description=" + des;
    let result: boolean = await this.dataService.getFileExtentionParameterAsync("/api/FileExtention/ExportExcelParameter", "AccountCimastTran",
    listParameter, "AccountCimastTran");
    if (result) {
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
    }
    this.loadingReport = false;
    this.btnExport.nativeElement.disabled = false;
  }
}
