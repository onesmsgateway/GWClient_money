import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/core/models/role';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-customer-mapping',
  templateUrl: './customer-mapping.component.html',
  styleUrls: ['./customer-mapping.component.css']
})
export class CustomerMappingComponent implements OnInit {

  public dataSenderCSKH = [];
  public dataSenderQC = [];
  public dataSenderName = [];
  public dataAccountParent = [];
  public dataAccountChild = [];
  public settingsFilterSender = {};
  public selectedItemComboboxSender = [];
  public settingsFilterAccountParent = {};
  public selectedItemComboboxAccountParent = [];
  public settingsFilterAccountChild = {};
  public selectedItemComboboxAccountChild = [];
  public selectedSmsType = [];
  public dataSmsType = [];
  public settingsFilterSmsType = {};
  public slBrandCSKH = [];
  public slBrandQC = [];
  public role: Role = new Role();
  public isAdmin: boolean = false;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private authService: AuthService) {

    this.activatedRoute.data.subscribe(data => {
      this.utilityService.getRole(data.MENU_CODE).then((response) => {
        if (response) this.role = response;
      })
    });

    this.settingsFilterAccountParent = {
      text: this.utilityService.translate("global.choose_account"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterAccountChild = {
      text: this.utilityService.translate("global.choose_account"),
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

    this.getDataAccountParent();
    this.bindDataSmsType();
  }

  //#region load account
  async getDataAccountParent() {
    if (this.isAdmin) {
      this.selectedItemComboboxAccountParent = [{ "id": 0, "itemName": this.utilityService.translate("global.choose_account") }];
      let response: any = await this.dataService.getAsync('/api/account')
      for (let index in response.data) {
        this.dataAccountParent.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
    else {
      let response = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in response.data) {
        this.dataAccountParent.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
      if (this.dataAccountParent.length == 1) {
        this.selectedItemComboboxAccountParent.push({ "id": this.dataAccountParent[0].id, "itemName": this.dataAccountParent[0].itemName });
      }
      else
        this.selectedItemComboboxAccountParent.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
    }
    if (this.selectedItemComboboxAccountParent.length > 0) {
      this.getDataAccountChild(this.selectedItemComboboxAccountParent[0].id);
      this.getDataSenderName(this.selectedItemComboboxAccountParent[0].id);
    }
  }

  onItemSelectAccountParent() {
    this.dataSenderCSKH = [];
    this.dataSenderQC = [];
    this.getDataAccountChild(this.selectedItemComboboxAccountParent[0].id);
    this.getDataSenderName(this.selectedItemComboboxAccountParent[0].id);
  }

  async getDataAccountChild(accountParent) {
    this.dataAccountChild = [];
    this.selectedItemComboboxAccountChild = [{ "id": 0, "itemName": this.utilityService.translate("global.choose_account") }];
    if (accountParent != null && accountParent > 0) {
      let response: any = await this.dataService.getAsync('/api/account/GetLisAccountChild?account_id=' + accountParent)
      for (let index in response.data) {
        this.dataAccountChild.push({ "id": response.data[index].ACCOUNT_ID, "itemName": response.data[index].USER_NAME });
      }
    }
  }

  onItemSelectAccountChild() {
    this.bindBrandCSKH();
    this.bindBrandQC();
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

  onItemSelecSmsType(){
    this.getDataSenderName(this.selectedItemComboboxAccountParent[0].id);
  }
  //#endregion

  //#region load brand CSKH
  public async bindBrandCSKH() {
    this.dataSenderCSKH = [];
    let accountId = this.selectedItemComboboxAccountChild.length > 0 && this.selectedItemComboboxAccountChild[0].id != 0 ? this.selectedItemComboboxAccountChild[0].id : 0;
    let response: any = await this.dataService.getAsync('/api/sendername/GetSenderByAccountAndType?accountID=' + accountId + "&smsType=CSKH");
    for (let i in response.data) {
      this.dataSenderCSKH.push({ "id": response.data[i].ID, "itemName": response.data[i].NAME });
    }
  }
  //#endregion

  //#region load brand QC
  public async bindBrandQC() {
    this.dataSenderQC = [];
    let accountId = this.selectedItemComboboxAccountChild.length > 0 && this.selectedItemComboboxAccountChild[0].id != 0 ? this.selectedItemComboboxAccountChild[0].id : 0;
    let response: any = await this.dataService.getAsync('/api/sendername/GetSenderByAccountAndType?accountID=' + accountId + "&smsType=QC");
    for (let i in response.data) {
      this.dataSenderQC.push({ "id": response.data[i].ID, "itemName": response.data[i].NAME });
    }
  }
  //#endregion

  // cap thuong hieu cho tai khoan
  async AddBrandName() {
    if (this.selectedItemComboboxAccountChild.length == 0 || this.selectedItemComboboxAccountChild[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-68"));
      return;
    }
    let account = this.selectedItemComboboxAccountChild[0].id;
    if (this.selectedSmsType.length == 0 || this.selectedSmsType[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-20"));
      return;
    }
    let smsType = this.selectedSmsType[0].id;
    if (this.selectedItemComboboxSender.length == 0 || this.selectedItemComboboxSender[0].id == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-22"));
      return;
    }
    let sender = this.selectedItemComboboxSender[0].id;
    let response: any = await this.dataService.postAsync('/api/partnersender/AddPartnerSenderByAccountParent?account_id=' + account + "&sender_id=" + sender + "&sms_type=" + smsType);
    if (response.err_code == 0) {
      if (smsType == "CSKH")
        this.bindBrandCSKH();
      else
        this.bindBrandQC();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("140"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  // thu hoi brand name CSKH
  async RevokeBrandNameCSKH() {
    let lstSender = "";
    if (this.slBrandCSKH.length > 0) {
      for (let i in this.slBrandCSKH) {
        lstSender += this.slBrandCSKH[i] + ",";
      }
      if (lstSender != "") lstSender = lstSender.substr(0, lstSender.length - 1);
      let account = this.selectedItemComboboxAccountChild[0].id;
      let response: any = await this.dataService.deleteAsync('/api/partnersender/DeletePartnerSenderByAccountSenderType?account_id=' + account + "&sender=" + lstSender + "&type=CSKH");
      if (response.err_code == 0) {
        this.bindBrandCSKH();
        this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("160"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
      }
    }
  }

  // thu hoi brand name QC
  async RevokeBrandNameQC() {
    let lstSender = "";
    if (this.slBrandQC.length > 0) {
      for (let i in this.slBrandQC) {
        lstSender += this.slBrandQC[i] + ",";
      }
      if (lstSender != "") lstSender = lstSender.substr(0, lstSender.length - 1);
      let account = this.selectedItemComboboxAccountChild[0].id;
      let response: any = await this.dataService.deleteAsync('/api/partnersender/DeletePartnerSenderByAccountSenderType?account_id=' + account + "&sender=" + lstSender + "&type=QC");
      if (response.err_code == 0) {
        this.bindBrandQC();
        this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("160"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
      }
    }
  }
}
