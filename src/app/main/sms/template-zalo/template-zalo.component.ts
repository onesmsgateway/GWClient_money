import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { Pagination } from 'src/app/core/models/pagination';
import { Role } from 'src/app/core/models/role';
import { AuthService } from 'src/app/core/services/auth.service';
import { DataService } from 'src/app/core/services/data.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';

@Component({
  selector: 'app-template-zalo',
  templateUrl: './template-zalo.component.html',
  styleUrls: ['./template-zalo.component.css']
})
export class TemplateZaloComponent implements OnInit {

  @ViewChild('showModalCreate', { static: false }) public showModalCreate: ModalDirective;
  @ViewChild('showModalUpdate', { static: false }) public showModalUpdate: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  public dataTemp = [];
  public dataAccount = [];
  public dataTokenOA = [];
  public pagination: Pagination = new Pagination();
  public tempId;
  public id;
  public inTempID: string = '';
  public inTempName: string = '';
  public formEditTemplateZalo: FormGroup;
  public settingsFilterAccount = {};
  public selectedItemComboboxAccount = [];
  public selectedItemComboboxAccountCreate = [];
  public selectedItemComboboxAccountEdit = [];
  public settingsFilterTokenOA = {};
  public selectedItemComboboxTokenOA = [];
  public selectedItemComboboxTokenOACreate = [];
  public selectedItemComboboxTokenOAEdit = [];
  public role: Role = new Role();
  public isAdmin: boolean = false;

  constructor(
    private dataService: DataService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private authService: AuthService) {
    modalService.config.backdrop = 'static';

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

    this.settingsFilterTokenOA = {
      text: this.utilityService.translate("token_oa.choose_oa"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.formEditTemplateZalo = new FormGroup({
      id: new FormControl(),
      slAccountEdit: new FormControl(),
      slTokenOAEdit: new FormControl(),
      tempId: new FormControl(),
      param: new FormControl(),
      content: new FormControl(),
      note: new FormControl()
    });
  }

  ngOnInit() {
    this.dataAccount.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    this.getAccountLogin();
    this.getOA();
  }

  async getAccountLogin() {
    let result = await this.dataService.getAsync('/api/account/GetInfoAccountLogin');
    if (result != null) {
      let roleAccess = result.data[0].ROLE_ACCESS;
      let is_admin = result.data[0].IS_ADMIN;
      if (roleAccess == 50 || is_admin == 1 || roleAccess == 53) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    }

    this.getDataAccount();
    this.getData();
  }

  //#region load account
  async getDataAccount() {
    if (this.isAdmin) {
      this.selectedItemComboboxAccount = [{ "id": 0, "itemName": this.utilityService.translate("global.choose_account") }];
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
        this.selectedItemComboboxAccount.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
    }
  }
  //#endregion

  async getOA() {
    let result = await this.dataService.getAsync('/api/tokenOA/GetTokenOAFilter?name=');
    if (result != null) {
      for (let index in result.data) {
        this.dataTokenOA.push({ "id": result.data[index].ID, "itemName": result.data[index].NAME });
      }
    }
  }

  //#region load data
  async getData() {
    let accountID = "";
    if (this.isAdmin)
      accountID = this.selectedItemComboboxAccount.length > 0 && this.selectedItemComboboxAccount[0].id != "" ? this.selectedItemComboboxAccount[0].id : "";
    else
      accountID = this.selectedItemComboboxAccount.length > 0 && this.selectedItemComboboxAccount[0].id != "" ? this.selectedItemComboboxAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID;

    let response: any = await this.dataService.getAsync('/api/templatezalo/GetTemplateZaloPaging?pageIndex=' + this.pagination.pageIndex +
      "&pageSize=" + this.pagination.pageSize + "&account_id=" + accountID + "&template_id=" + this.inTempID + "&content=" + this.inTempName)
    this.loadData(response);
  }

  loadData(response?: any) {
    if (response) {
      this.dataTemp = response.data;
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
  //#endregion

  //#region create new
  async createTemplateZalo(item) {
    let smsTemp = item.value;
    let data = item.controls;
    if (this.selectedItemComboboxAccountCreate.length == 0 || this.selectedItemComboboxAccountCreate[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-68"));
      return;
    }
    if (this.selectedItemComboboxTokenOACreate.length == 0 || this.selectedItemComboboxTokenOACreate[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-126"));
      return;
    }
    let ACCOUNT_ID = data.slAccountCreate.value[0].id;
    let TOKEN_OA_ID = data.slTokenOACreate.value[0].id;
    let TEMPLATE_ID = smsTemp.tempId;
    let PARAM = smsTemp.param;
    let CONTENT = smsTemp.content;
    let NOTE = smsTemp.note;
    if (TEMPLATE_ID == "" || TEMPLATE_ID == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-123"));
      return;
    }
    if (CONTENT == "" || CONTENT == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-122"));
      return;
    }
    let response: any = await this.dataService.postAsync('/api/templatezalo', {
      ACCOUNT_ID, TEMPLATE_ID, TOKEN_OA_ID, PARAM, CONTENT, NOTE
    })
    if (response.err_code == 0) {
      item.reset();
      this.getData();
      this.showModalCreate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("100"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }
  //#endregion

  // show update modal
  async confirmUpdateModal(id) {
    let response: any = await this.dataService.getAsync('/api/templatezalo/' + id)
    if (response.err_code == 0) {
      let dataSmsTemp = response.data[0];
      this.formEditTemplateZalo = new FormGroup({
        id: new FormControl(id),
        slAccountEdit: new FormControl([{ "id": dataSmsTemp.ACCOUNT_ID, "itemName": dataSmsTemp.USER_NAME }]),
        slTokenOAEdit: new FormControl([{ "id": dataSmsTemp.TOKEN_OA_ID, "itemName": dataSmsTemp.NAME }]),
        tempId: new FormControl(dataSmsTemp.TEMPLATE_ID),
        param: new FormControl(dataSmsTemp.PARAM),
        content: new FormControl(dataSmsTemp.CONTENT),
        note: new FormControl(dataSmsTemp.NOTE)
      });
      this.showModalUpdate.show();
    } else {
      this.notificationService.displayErrorMessage(response.err_message);
    }
  }

  // update tin mẫu
  async editTemplateZalo() {
    let formData = this.formEditTemplateZalo.controls;
    let ID = formData.id.value;
    if (formData.slAccountEdit.value.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-63"));
      return;
    }
    if (formData.slTokenOAEdit.value.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-126"));
      return;
    }
    let ACCOUNT_ID = formData.slAccountEdit.value[0].id;
    let TOKEN_OA_ID = formData.slTokenOAEdit.value[0].id;
    let TEMPLATE_ID = formData.tempId.value;
    let PARAM = formData.param.value;
    let CONTENT = formData.content.value;
    let NOTE = formData.note.value;
    if (TEMPLATE_ID == "" || TEMPLATE_ID == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-123"));
      return;
    }
    if (CONTENT == "" || CONTENT == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-122"));
      return;
    }
    let response: any = await this.dataService.putAsync('/api/templatezalo/' + ID, {
      ACCOUNT_ID, TEMPLATE_ID, TOKEN_OA_ID, PARAM, CONTENT, NOTE
    })
    if (response.err_code == 0) {
      this.showModalUpdate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
      this.getData();
    } else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  showConfirmDelete(id, idTemp) {
    this.tempId = idTemp;
    this.id = id;
    this.confirmDeleteModal.show();
  }

  // delete
  async confirmDelete(id) {
    let response: any = await this.dataService.deleteAsync('/api/templatezalo/' + id)
    if (response.err_code == 0) {
      this.getData();
      this.confirmDeleteModal.hide();
      this.notificationService.displaySuccessMessage(response.err_message);
    }
    else {
      this.notificationService.displayErrorMessage(response.err_message);
    }
  }
}
