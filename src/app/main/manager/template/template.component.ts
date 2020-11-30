import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective, BsModalService } from 'ngx-bootstrap';
import { Pagination } from 'src/app/core/models/pagination';
import { FormGroup, FormControl } from '@angular/forms';
import { Role } from 'src/app/core/models/role';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  @ViewChild('showModalCreate', { static: false }) public showModalCreate: ModalDirective;
  @ViewChild('showModalUpdate', { static: false }) public showModalUpdate: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  public dataTemp = [];
  public dataSender = [];
  public dataSenderEdit = [];
  public pagination: Pagination = new Pagination();
  public content: string = "";
  public id;
  public formEditTemplate: FormGroup;
  public settingsFilterSender = {};
  public selectedItemComboboxSender = [];
  public selectedItemComboboxSenderCreate = [];
  public selectedItemComboboxSenderEdit = [];
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

    this.settingsFilterSender = {
      text: this.utilityService.translate("global.choose_sender"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.formEditTemplate = new FormGroup({
      id: new FormControl(),
      slSenderEdit: new FormControl(),
      tempType: new FormControl(),
      totalParam: new FormControl(),
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

    this.getDataSender();
    this.getData();
  }

  //#region load sender
  async getDataSender() {
    this.selectedItemComboboxSender = [];
    this.dataSender = [];
    this.dataSender.push({ "id": "", "itemName": this.utilityService.translate('global.all') });
    if (this.isAdmin) {
      let response = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=&smsType=CSKH');
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

  onItemSelectSender() {
    this.getData();
  }
  //#endregion

  //#region load data
  async getData() {
    let accountId = "";
    let sender_id = this.selectedItemComboboxSender.length > 0 && this.selectedItemComboboxSender[0].id != "" ? this.selectedItemComboboxSender[0].id : "";
    if (!this.isAdmin) {
      accountId = this.authService.currentUserValue.ACCOUNT_ID;
    }

    let response: any = await this.dataService.getAsync('/api/TemplateTelco/GetTemplateTelcoPaging?pageIndex=' + this.pagination.pageIndex +
      "&pageSize=" + this.pagination.pageSize + "&accountId=" + accountId + "&senderId=" + sender_id + "&content=" + this.content)
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
  async createTemplate(item) {
    let smsTemp = item.value;
    let data = item.controls;
    if (this.selectedItemComboboxSenderCreate.length == 0 || this.selectedItemComboboxSenderCreate[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    if (smsTemp.tempContent == null || smsTemp.tempContent == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-122"));
      return;
    }
    let SENDER_ID = data.slSenderCreate.value[0].id;
    let CONTENT = smsTemp.tempContent;
    let TEMPLATE_TYPE = smsTemp.tempType;
    let TOTALPARAM = smsTemp.totalParam;

    let response: any = await this.dataService.postAsync('/api/TemplateTelco', {
      SENDER_ID, CONTENT, TEMPLATE_TYPE, TOTALPARAM
    })
    if (response.err_code == 0) {
      item.reset();
      this.getData();
      this.showModalCreate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("100"));
    }
    else if(response.err_code == -19){
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("-19"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }
  //#endregion

  // show update modal
  async confirmUpdateModal(id) {
    let response: any = await this.dataService.getAsync('/api/TemplateTelco/' + id)
    if (response.err_code == 0) {
      let dataSmsTemp = response.data[0];
      this.formEditTemplate = new FormGroup({
        id: new FormControl(id),
        accountEdit: new FormControl(dataSmsTemp.USER_NAME),
        slSenderEdit: new FormControl([{ "id": dataSmsTemp.SENDER_ID, "itemName": dataSmsTemp.SENDER_NAME }]),
        tempType: new FormControl(dataSmsTemp.TEMPLATE_TYPE),
        totalParam: new FormControl(dataSmsTemp.TOTALPARAM),
        tempContent: new FormControl(dataSmsTemp.CONTENT)
      });
      this.showModalUpdate.show();
    } else {
      this.notificationService.displayErrorMessage(response.err_message);
    }
  }

  // update tin mẫu
  async editTemplate() {
    let formData = this.formEditTemplate.controls;
    let ID = formData.id.value;
    if (formData.slSenderEdit.value == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    let TEMPLATE_TYPE = formData.tempType.value;
    if (TEMPLATE_TYPE == null || TEMPLATE_TYPE == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-122"));
      return;
    }
    let SENDER_ID = formData.slSenderEdit.value[0].id;
    let CONTENT = formData.tempContent.value;
    let TOTALPARAM = formData.totalParam.value;
    
    let response: any = await this.dataService.putAsync('/api/TemplateTelco/' + ID, {
      SENDER_ID, CONTENT, TEMPLATE_TYPE, TOTALPARAM
    })
    if (response.err_code == 0) {
      this.showModalUpdate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
      this.getData();
    } else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  // delete
  async confirmDelete(id) {
    let response: any = await this.dataService.deleteAsync('/api/TemplateTelco/' + id)
    if (response.err_code == 0) {
      this.getData();
      this.confirmDeleteModal.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("200"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }
}
