import { Component, OnInit, ViewChild } from '@angular/core';
import { AppConst } from 'src/app/core/common/app.constants';
import { DataService } from '../../../core/services/data.service';
import { Pagination } from '../../../core/models/pagination';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-account-cimast',
  templateUrl: './account-cimast.component.html',
  styleUrls: ['./account-cimast.component.css']
})
export class AccountCimastComponent implements OnInit {
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;
  @ViewChild('createAccountModal', { static: false }) public createAccountModal: ModalDirective;
  @ViewChild('editAccountModal', { static: false }) public editAccountModal: ModalDirective;
  @ViewChild('confirmDeleteMultiModal', { static: false }) public confirmDeleteMultiModal: ModalDirective;

  public formEditAccountCimast: FormGroup;
  public dataAccountCimast;
  public modalRef: BsModalRef;
  public pagination: Pagination = new Pagination();
  public userNameAcount;
  public accountCimastId;
  public idDelete: string[] = [];
  public fillterUserName: string = '';
  public arrIdDelete: string[] = [];
  public selectedItems1 = [];
  public selectedItems2 = [];
  public settingsSingle = {};
  public dataCombobox = [];
  public dataComboboxSearch = [];
  public selectedItemCombobox = [];
  public settingsFilter = {};
  public arrIdCheckedDelete: string[] = [];
  public isCheckedDelete: boolean = false;
  public accountid: number = 0;
  public amtfillter: number;
  public volfillter: number;
  public in_amtfillter: number;
  public out_amtfillter: number;
  public in_volfillter: number;
  public out_volfillter: number;
  public accountId: number;
  public tx_date: number;
  public amt: string = "";
  public vol: string = "";
  public in_amt: string = "";
  public out_amt: string = "";
  public in_vol: string = "";
  public out_vol: string = "";
  public isAdmin: boolean = false;


  constructor(
    private dataService: DataService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private authService: AuthService) {
    modalService.config.backdrop = 'static';

    this.formEditAccountCimast = new FormGroup({
      ciid: new FormControl(),
      accountId: new FormControl(),
      tx_date: new FormControl(),
      amt: new FormControl(),
      vol: new FormControl(),
      in_amt: new FormControl(),
      out_amt: new FormControl(),
      in_vol: new FormControl(),
      out_vol: new FormControl(),
      dlvr: new FormControl(),
      dlvrURL: new FormControl(),
      emailReport: new FormControl()
    });

    // this.selectedItems1 = [
    //   { "id": 1, "itemName": "Chọn tài khoản" }];
    // this.selectedItems2 = [
    //   { "id": 1, "itemName": "Chọn tài khoản" }];
    this.settingsSingle = {
      singleSelection: true
    };
    this.settingsFilter = {
      text: this.utilityService.translate("global.choose_account"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };
  }

  public async bindDataAccount() {
    if (this.isAdmin) {
      let response: any = await this.dataService.getAsync('/api/account');
      for (let index in response.data) {
        this.dataCombobox.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
    else {
      let response = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in response.data) {
        this.dataCombobox.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
      if (this.dataCombobox.length == 2)
        this.selectedItemCombobox.push({ "id": this.dataCombobox[1].id, "itemName": this.dataCombobox[1].itemName });
      else
        this.selectedItemCombobox.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
    }
  }

  public async bindDataToComboboxSearch() {
    let response: any = await this.dataService.getAsync('/api/account');
    for (let index in response.data) {
      this.dataComboboxSearch.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
    }
  }
  ngOnInit() {
    this.getAccountDetail();
    this.dataCombobox.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.bindDataAccount();
    this.bindDataToComboboxSearch();
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
    this.getDataAccountCimastFillter();
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems1);
  }

  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems2);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  onDeSelectAll(items: any) {
    console.log(items);
  }


  setPageIndex(pageNo: number): void {
    this.pagination.pageIndex = pageNo;
    this.getDataAccountCimastFillter();
  }
  pageChanged(event: any): void {
    this.isCheckedDelete = false;
    this.arrIdCheckedDelete = [];
    this.setPageIndex(event.page);
  }

  changePageSize(size) {
    this.pagination.pageSize = size;
    this.pagination.pageIndex = 1;
    this.getDataAccountCimastFillter();
  }

  public async exportExcelaccountCimast() {
    let result: boolean = await this.dataService.getFileExtentionAsync("/api/FileExtention/ExportExcel", "AccountCimast");
    if (result) {
      this.notificationService.displaySuccessMessage("Export thành công");
    }
    else {
      this.notificationService.displayErrorMessage("Export file lỗi");
    }
  }

  SearchAccountCimast(fillter) {
    if (fillter.comboboxAccountSearch.length == 0) {
      this.notificationService.displayErrorMessage("Bạn phải chọn tài khoản tìm kiếm");
      return;
    }
    if (this.isAdmin)
      this.accountid = fillter.comboboxAccountSearch.length > 0 && fillter.comboboxAccountSearch[0].itemName != this.utilityService.translate('global.all') ? fillter.comboboxAccountSearch[0].id : "";
    else
      this.accountid = fillter.comboboxAccountSearch.length > 0 && fillter.comboboxAccountSearch[0].itemName != this.utilityService.translate('global.all') ? fillter.comboboxAccountSearch[0].id : this.authService.currentUserValue.ACCOUNT_ID;
    this.getDataAccountCimastFillter();
  }

  async getDataAccountCimastFillter() {
    if (this.isAdmin)
    this.accountid = this.selectedItemCombobox.length > 0 && this.selectedItemCombobox[0].itemName != this.utilityService.translate('global.all') ? this.selectedItemCombobox[0].id : "";
  else
    this.accountid = this.selectedItemCombobox.length > 0 && this.selectedItemCombobox[0].itemName != this.utilityService.translate('global.all') ? this.selectedItemCombobox[0].id : this.authService.currentUserValue.ACCOUNT_ID;

    let response: any = await this.dataService.getAsync('/api/accountcimast/GetAccountCimastFillterAndPaging?pageIndex=' + this.pagination.pageIndex
      + '&pageSize=' + this.pagination.pageSize + '&accountid=' + this.accountid + '&amt=' + this.amt + '&vol=' + this.vol + '&in_amt=' + this.in_amt
      + '&out_amt=' + this.out_amt + '&in_vol=' + this.in_vol + '&out_vol=' + this.out_vol);

    if (response.data.length == 0) { this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("103")); }
    if (response.err_code == 0) {
      this.loadData(response);
      this.arrIdDelete = [];
    }
    else { }
    if (response.err_code == 103) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("103"));
    }
    else { }
  }

  loadData(response?: any) {
    if (response) {
      this.dataAccountCimast = response.data;
      if ('pagination' in response) {
        this.pagination.pageSize = response.pagination.PageSize;
        this.pagination.totalRow = response.pagination.TotalRows;
      }
    }
  }

  confirmDeleteMultiAccount() {
    if (this.arrIdCheckedDelete.length > 0) {
      this.userNameAcount = this.arrIdCheckedDelete.join(",");
      this.confirmDeleteMultiModal.show();
    }
  }

  createaccountCimast(accountcimast) {
    let ACCOUNT_ID = accountcimast.ACCOUNT_ID;
    let TX_DATE = accountcimast.TX_DATE;
    let AMT = accountcimast.AMT;
    let VOL = accountcimast.VOL;
    let IN_AMT = accountcimast.IN_AMT;
    let OUT_AMT = accountcimast.OUT_AMT;
    let IN_VOL = accountcimast.IN_VOL;
    let OUT_VOL = accountcimast.OUT_VOL;

    this.dataService.post('/api/accountcimast', { ACCOUNT_ID, TX_DATE, AMT, VOL, IN_AMT, OUT_AMT, IN_VOL, OUT_VOL })
      .subscribe((response: any) => {
        if (response.err_code == 0) {
          this.getDataAccountCimastFillter();
          this.createAccountModal.hide();
          this.notificationService.displaySuccessMessage("Thêm mới thành công");
        }
        else {
          this.notificationService.displayErrorMessage("Thêm mới thất bại");
        }
      }, error => {
        console.log(error);
        this.notificationService.displayErrorMessage("Thêm mới thất bại");
      });
  }

  showConfirmEditAccount(ciid) {
    this.dataService.get('/api/accountcimast/' + ciid)
      .subscribe((response: any) => {
        if (response.err_code == 0) {
          let dataAccountCimast = response.data[0];
          this.formEditAccountCimast = new FormGroup({
            ciid: new FormControl(ciid),
            accountId: new FormControl(dataAccountCimast.ACCOUNT_ID),
            tx_date: new FormControl(dataAccountCimast.TX_DATE),
            amt: new FormControl(dataAccountCimast.AMT)

          });
          this.editAccountModal.show();
        } else {
          this.notificationService.displayErrorMessage(response.err_message);
        }
      })
  }

  editAccountCimast() {
    let formData = this.formEditAccountCimast.controls;
    let ACCOUNT_ID = formData.accountId.value;
    let USER_NAME = formData.userName.value;

    this.dataService.put('/api/accountcimast/' + ACCOUNT_ID, { USER_NAME })
      .subscribe((response: any) => {
        if (response.err_code == 0) {

        } else {
          this.notificationService.displayErrorMessage(response.err_message);
        }
      });
  }



}
