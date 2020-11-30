import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective, BsModalService } from 'ngx-bootstrap';
import { Pagination } from 'src/app/core/models/pagination';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/core/services/data.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Role } from 'src/app/core/models/role';
import { UtilityService } from 'src/app/core/services/utility.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sms-template',
  templateUrl: './sms-template.component.html',
  styleUrls: ['./sms-template.component.css']
})
export class SmsTemplateComponent implements OnInit {

  @ViewChild('showModalCreate', { static: false }) public showModalCreate: ModalDirective;
  @ViewChild('showModalUpdate', { static: false }) public showModalUpdate: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  public dataSMSTemp;
  public dataSenderName = [];
  public dataAccount = [];
  public dataSenderEdit = [];
  public pagination: Pagination = new Pagination();
  public id;
  public tempName;
  public accountEdit: string = '';
  public slSenderCreate: string = '';
  public slAccountCreate: string = '';
  public inTempName: string = '';
  public formEditSmsTemplate: FormGroup;
  public settingsFilterSender = {};
  public selectedItemComboboxSender = [];
  public selectedItemComboboxSenderCreate = [];
  public selectedItemComboboxSenderEdit = [];

  public settingsFilterAccount = {};
  public selectedItemComboboxAccount = [];
  public selectedItemComboboxAccountCreate = [];
  public selectedSmsTypeCreate = [];
  public selectedSmsTypeEdit = [];
  public selectedSmsType = [];
  public dataSmsType = [];
  public settingsFilterSmsType = {};
  public role: Role = new Role();
  public isAdmin: boolean = false;
  public accountID: any;

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

    this.settingsFilterSender = {
      text: this.utilityService.translate("global.choose_sender"),
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

    this.formEditSmsTemplate = new FormGroup({
      id: new FormControl(),
      accountEdit: new FormControl(),
      slSmsTypeEdit: new FormControl(),
      slSenderEdit: new FormControl(),
      tempName: new FormControl(),
      tempContent: new FormControl()
    });
  }

  ngOnInit() {
    this.getAccountLogin();
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
    this.bindDataSmsType();
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
    if (this.selectedItemComboboxAccount.length > 0) {
      this.getDataSenderName(this.selectedItemComboboxAccount[0].id);
    }
  }

  onItemSelectAccount() {
    this.getDataSenderName(this.selectedItemComboboxAccount[0].id);
  }

  onItemSelectAccountCreate() {
    this.getDataSenderName(this.selectedItemComboboxAccountCreate[0].id);
  }
  //#endregion

  //#region load sender
  async getDataSenderName(accountID) {
    this.selectedItemComboboxSender = [];
    this.dataSenderName = [];
    let smsType = this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : "";
    if (accountID > 0) {
      let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' +
        accountID + "&smsType=" + smsType)
      for (let index in response.data) {
        this.dataSenderName.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
      if (this.dataSenderName.length == 1)
        this.selectedItemComboboxSender.push({ "id": this.dataSenderName[0].id, "itemName": this.dataSenderName[0].itemName });
    }
  }

  async getDataSenderEdit(accountID, smsType) {
    this.dataSenderEdit = [];
    if (accountID > 0) {
      let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' +
        accountID + "&smsType=" + smsType)
      for (let index in response.data) {
        this.dataSenderEdit.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
    }
  }
  //#endregion

  //#region load sms type
  public async bindDataSmsType() {
    this.dataSmsType = [];
    this.selectedSmsType = [];
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
  }
  onItemSelectSmsType() {
    if (this.selectedItemComboboxAccount.length > 0) {
      this.getDataSenderName(this.selectedItemComboboxAccount[0].id);
    }
  }

  onItemSelectSmsTypeCreate() {
    if (this.selectedItemComboboxAccountCreate.length > 0) {
      this.getDataSenderName(this.selectedItemComboboxAccountCreate[0].id);
    }
  }

  onItemSelectSmsTypeEdit() {
    if (this.accountEdit != "") {
      this.getDataSenderEdit(this.accountEdit, this.selectedSmsTypeEdit[0].id);
      this.selectedItemComboboxSenderEdit = [];
    }
  }
  //#endregion

  //#region load data
  async getData() {
    let sender_id = "";
    if (this.isAdmin) {
      this.accountID = (this.selectedItemComboboxAccount.length > 0) ? this.selectedItemComboboxAccount[0].id : "";
      sender_id = this.selectedItemComboboxSender.length > 0 ? this.selectedItemComboboxSender[0].id : "";
    }
    else {
      this.accountID = (this.selectedItemComboboxAccount.length > 0) ? this.selectedItemComboboxAccount[0].id : this.authService.currentUserValue.ACCOUNT_ID;
      if (this.selectedItemComboboxSender.length > 0)
        sender_id = this.selectedItemComboboxSender[0].id;
      else if (this.selectedItemComboboxAccount.length > 0)
        sender_id = "";
      else
        sender_id = "0";
    }

    let response: any = await this.dataService.getAsync('/api/smstemplate/GetSmsTemplatePaging?pageIndex=' + this.pagination.pageIndex +
      "&pageSize=" + this.pagination.pageSize + "&accountID=" + this.accountID +
      "&senderId=" + sender_id + "&tempName=" + this.inTempName +
      "&smsType=" + (this.selectedSmsType.length > 0 ? this.selectedSmsType[0].id : ""))
    this.loadData(response);
  }

  loadData(response?: any) {
    if (response) {
      this.dataSMSTemp = response.data;
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
  async createSMSTemplate(item) {
    let smsTemp = item.value;
    let data = item.controls;
    if (this.selectedItemComboboxAccountCreate.length == 0 || this.selectedItemComboboxAccountCreate[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-68"));
      return;
    }
    let ACCOUNT_ID = data.slAccountCreate.value[0].id;
    if (this.selectedSmsType.length == 0 || this.selectedSmsType[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-24"));
      return;
    }
    let SMS_TYPE = data.slTypeCreate.value[0].id;
    if (this.selectedItemComboboxSenderCreate.length == 0 || this.selectedItemComboboxSenderCreate[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    let TEMPLATE_CONTENT = smsTemp.tempContent;
    let SENDER_ID = data.slSenderCreate.value[0].id;
    let SENDER_NAME = data.slSenderCreate.value[0].itemName;
    let TEMP_NAME = smsTemp.tempName;
    if (TEMP_NAME == "" || TEMP_NAME == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-65"));
      return;
    }
    let response: any = await this.dataService.postAsync('/api/smstemplate', {
      ACCOUNT_ID, SENDER_ID, SENDER_NAME, TEMP_NAME, SMS_TYPE, TEMPLATE_CONTENT
    })
    if (response.err_code == 0) {
      item.reset();
      this.selectedSmsType = [];
      this.selectedItemComboboxSender = [];
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
    let response: any = await this.dataService.getAsync('/api/smstemplate/' + id)
    if (response.err_code == 0) {
      let dataSmsTemp = response.data[0];
      this.getDataSenderEdit(dataSmsTemp.ACCOUNT_ID, dataSmsTemp.SMS_TYPE);
      this.formEditSmsTemplate = new FormGroup({
        id: new FormControl(id),
        accountEdit: new FormControl(dataSmsTemp.USER_NAME),
        slSmsTypeEdit: new FormControl([{ "id": dataSmsTemp.SMS_TYPE, "itemName": dataSmsTemp.SMS_TYPE }]),
        slSenderEdit: new FormControl([{ "id": dataSmsTemp.SENDER_ID, "itemName": dataSmsTemp.SENDER_NAME }]),
        tempName: new FormControl(dataSmsTemp.TEMP_NAME),
        tempContent: new FormControl(dataSmsTemp.TEMPLATE_CONTENT)
      });
      this.accountEdit = dataSmsTemp.ACCOUNT_ID;
      this.showModalUpdate.show();
    } else {
      this.notificationService.displayErrorMessage(response.err_message);
    }
  }

  // update tin mẫu
  async editSmsTemplate() {
    let formData = this.formEditSmsTemplate.controls;
    let ID = formData.id.value;
    if (formData.slSmsTypeEdit.value.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    let SMS_TYPE = formData.slSmsTypeEdit.value[0].id;
    if (formData.slSenderEdit.value == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    let SENDER_ID = formData.slSenderEdit.value[0].id;
    let SENDER_NAME = formData.slSenderEdit.value[0].itemName;
    let TEMP_NAME = formData.tempName.value;
    if (TEMP_NAME == "" || TEMP_NAME == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-65"));
      return;
    }
    let TEMPLATE_CONTENT = formData.tempContent.value;
    if (TEMPLATE_CONTENT == "" || TEMPLATE_CONTENT == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-24"));
      return;
    }
    let response: any = await this.dataService.putAsync('/api/smstemplate/' + ID, {
      SENDER_ID, SENDER_NAME, TEMP_NAME, SMS_TYPE, TEMPLATE_CONTENT
    })
    if (response.err_code == 0) {
      this.selectedItemComboboxSender = [];
      this.selectedSmsType = [];
      this.showModalUpdate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
      this.getData();
    } else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  showConfirmDelete(id, tempName) {
    this.id = id;
    this.tempName = tempName;
    this.confirmDeleteModal.show();
  }

  // delete
  async confirmDelete(id) {
    let response: any = await this.dataService.deleteAsync('/api/smstemplate/' + id + "?pageIndex=" + this.pagination.pageIndex + '&pageSize=' + this.pagination.pageSize)
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
