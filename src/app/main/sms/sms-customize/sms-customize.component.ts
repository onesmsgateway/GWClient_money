import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { Pagination } from 'src/app/core/models/pagination';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Role } from 'src/app/core/models/role';
import { ActivatedRoute } from '@angular/router';
import { MainComponent } from '../../main.component';

@Component({
  selector: 'app-sms-customize',
  templateUrl: './sms-customize.component.html',
  styleUrls: ['./sms-customize.component.css']
})
export class SmsCustomizeComponent implements OnInit {
  @ViewChild('contentSMS', { static: false }) public contentSMS;
  @ViewChild('campaignName', { static: false }) public campaignName;
  @ViewChild('confirmSendSmsModal', { static: false }) public confirmSendSmsModal: ModalDirective;
  @ViewChild('confirmSendSmsContinuousModal', { static: false }) public confirmSendSmsContinuousModal: ModalDirective;
  @ViewChild('messageSendSmsModal', { static: false }) public messageSendSmsModal: ModalDirective;
  @ViewChild('uploadFile', { static: false }) public uploadFile;
  @ViewChild('showSMSTemplateModal', { static: false }) public showSMSTemplateModal: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  public listHeaderFile = [];
  public listDataFile = [];
  public listDataFileTam;
  public isShowTable = false;
  public smsContent: string = "";
  public fillNoiDung = [];
  public listContentSMS: any = [];
  public dataUploadFilePaging = [];
  public minDate: Date = new Date();
  public dataSMSTemp;
  public lstName: string = '';
  public accountId: string = '';
  public campaign: string = 'Tên chiến dịch';
  public ids: string = '';
  public lstChecked = [];
  public lstNameChecked: string = '';
  public phone;

  public isShowDateTime = false;
  public isShowSendSms = false;
  public timeSchedule: Date;

  public viewQuyTienCSKH = 0;
  public viewQuyTienQC = 0;

  public countVTL = 0;
  public countGPC = 0;
  public countVMS = 0;
  public countVNM = 0;
  public countGTEL = 0;
  public countSFONE = 0;
  public countDDMBLE = 0;
  public countTotal = 0;
  public isCheckSendVTL = true;
  public isCheckSendGPC = true;
  public isCheckSendVMS = true;
  public isCheckSendVNM = true;
  public isCheckSendGTEL = true;
  public isCheckSendSFONE = true;
  public isCheckSendDDMBLE = true;
  public isVirtual: Boolean = false;
  public isReportByEmail: Boolean = false;
  public isShowByType: Boolean = false;
  public reportByMail: boolean;
  public sendUnicode: boolean = false;
  public showSendUnicode: boolean = false;
  public showSendZalo: boolean = false;
  public showSelectTempZalo: boolean = false;

  public paginationImport: Pagination = new Pagination();

  public settingsFilterAccount = {};
  public dataAccount = [];
  public selectedAccountID = [];

  public selectedSenderName = [];
  public dataSender = [];
  public settingsFilterSender = {};

  public selectedSmsType = [];
  public dataSmsType = [];
  public settingsFilterSmsType = {};

  public settingsFilterPhoneList = {};
  public selectedPhoneList = [];
  public dataPhoneList = [];

  public settingsFilterTempZalo = {};
  public selectedItemComboboxTempZalo = [];
  public dataTempZalo = [];

  public numberChar: string = '0';
  public numberSMS: string = '0';
  public role: Role = new Role();
  public loading: boolean = false;
  public loadingUpload: boolean = false;
  public filePhoneList: string = "";
  public isAdmin: boolean = false;
  public showQuota: boolean = false;

  public messageSendSms = "";

  constructor(private dataService: DataService,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private mainComponent: MainComponent) {

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

    this.settingsFilterPhoneList = {
      text: this.utilityService.translate("global.choose_phone_list"),
      singleSelection: false,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data")
    };

    this.settingsFilterTempZalo = {
      text: this.utilityService.translate("template_zalo.selectZalo"),
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
    let is_admin = result.data[0].IS_ADMIN;
    let roleAccess = result.data[0].ROLE_ACCESS;
    if (roleAccess == 50 || roleAccess == 53 || is_admin == 1) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    this.bindDataAccount();
    this.bindDataSmsType();
  }

  //#region view Quy tin
  public async viewQuyTin(accountID) {
    if (accountID != undefined && accountID != "") {
      let quota_con_cskh = 0;
      let quota_con_qc = 0;

      let getQuotaCSKH: any = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountService?accountID=' +
        accountID + '&serviceName=CSKH');
      if (getQuotaCSKH.data.length > 0) {
        quota_con_cskh = getQuotaCSKH.data[0].AMT;
        this.authService.viewQuyTienCSKH = this.viewQuyTienCSKH = (quota_con_cskh != null && quota_con_cskh > 0) ? quota_con_cskh : 0;
        if (this.showQuota && accountID == this.authService.currentUserValue.ACCOUNT_ID) this.mainComponent.viewQuyTienCSKH = this.viewQuyTienCSKH;
      }
      else this.authService.viewQuyTienCSKH = this.viewQuyTienCSKH = 0;

      let getQuotaQC: any = await this.dataService.getAsync('/api/AccountCimast/GetAccountCimastByAccountService?accountID=' +
        accountID + '&serviceName=QC');
      if (getQuotaQC.data.length > 0) {
        quota_con_qc = getQuotaQC.data[0].AMT;
        this.authService.viewQuyTienQC = this.viewQuyTienQC = (quota_con_qc != null && quota_con_qc > 0) ? quota_con_qc : 0;
        if (this.showQuota && accountID == this.authService.currentUserValue.ACCOUNT_ID) this.mainComponent.viewQuyTienQC = this.viewQuyTienQC;
      }
      else this.authService.viewQuyTienQC = this.viewQuyTienQC = 0;
    }
    else {
      this.authService.viewQuyTienCSKH = this.viewQuyTienCSKH = 0;
      this.authService.viewQuyTienQC = this.viewQuyTienQC = 0;
    }
  }
  //#endregion

  //#region load data account
  public async bindDataAccount() {
    if (this.isAdmin) {
      let listAccount: any = await this.dataService.getAsync('/api/account');
      for (let index in listAccount.data) {
        this.dataAccount.push({ "id": listAccount.data[index].ACCOUNT_ID, "itemName": listAccount.data[index].USER_NAME });
      }
    }
    else {
      let listAccount = await this.dataService.getAsync('/api/account/GetLisAccountParentAndChild?account_id=' +
        this.authService.currentUserValue.ACCOUNT_ID);
      for (let index in listAccount.data) {
        this.dataAccount.push({ "id": listAccount.data[index].ACCOUNT_ID, "itemName": listAccount.data[index].USER_NAME });
      }
    }

    if (this.dataAccount.length == 1) {
      this.selectedAccountID.push({ "id": this.dataAccount[0].id, "itemName": this.dataAccount[0].itemName });
      this.viewQuyTin(this.selectedAccountID[0].id);
      if (this.selectedAccountID.length > 0 && this.selectedSmsType.length > 0) {
        this.bindDataSender(this.selectedAccountID[0].id, this.selectedSmsType[0].id);
      }
      this.bindDataPhoneList();
      this.showQuota = false;
    }
    else {
      this.selectedAccountID.push({ "id": 0, "itemName": this.utilityService.translate("global.choose_account") });
      this.showQuota = true;
    }
  }

  onItemSelect() {
    if (this.selectedAccountID.length > 0 && this.selectedSmsType.length > 0) {
      this.bindDataSender(this.selectedAccountID[0].id, this.selectedSmsType[0].id);
      this.viewQuyTin(this.selectedAccountID[0].id);
    }
    this.bindDataPhoneList();
    this.getDataTemplateZalo();
  }

  OnItemDeSelect() {
    this.bindDataPhoneList();
    this.getDataTemplateZalo();
    this.dataSender = []
    this.viewQuyTienCSKH = 0;
    this.viewQuyTienQC = 0;
  }
  //#endregion

  //#region load data sms type
  public async bindDataSmsType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataSmsType.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
    if (this.dataSmsType.length > 0)
      this.selectedSmsType.push({ "id": this.dataSmsType[0].id, "itemName": this.dataSmsType[0].itemName });
    if (this.selectedAccountID.length > 0 && this.selectedSmsType.length > 0) {
      this.bindDataSender(this.selectedAccountID[0].id, this.selectedSmsType[0].id);
    }
    else this.dataSender = [];
    if (this.selectedSmsType.length > 0 && this.selectedSmsType[0].id == "CSKH") this.showSendUnicode = true;
  }

  onItemSelectSmsType() {
    if (this.selectedSmsType.length > 0) {
      if (this.selectedSmsType[0].id == "CSKH") {
        this.isShowByType = false;
        this.showSendUnicode = true;
      }
      else {
        this.isShowByType = true;
        this.showSendUnicode = false;
      }
    }

    if (this.selectedAccountID.length > 0 && this.selectedSmsType.length > 0) {
      this.bindDataSender(this.selectedAccountID[0].id, this.selectedSmsType[0].id);
    }
    else this.dataSender = [];
  }
  //#endregion

  //#region load dataSender
  public async bindDataSender(accountID, smsType) {
    this.selectedSenderName = [];
    this.dataSender = [];
    if (accountID > 0 && smsType != "") {
      let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=' +
        accountID + "&smsType=" + smsType)
      for (let index in response.data) {
        this.dataSender.push({ "id": response.data[index].ID, "itemName": response.data[index].NAME });
      }
      if (this.dataSender.length == 1)
        this.selectedSenderName.push({ "id": this.dataSender[0].id, "itemName": this.dataSender[0].itemName });
    }
  }
  //#endregion

  //#region load list phone
  public async bindDataPhoneList() {
    this.dataPhoneList = [];
    this.selectedPhoneList = [];
    if (this.selectedAccountID.length > 0) {
      let response: any = await this.dataService.getAsync('/api/AccountPhoneList/GetPhoneListByAccountAndType?accountID=' +
        this.selectedAccountID[0].id + '&listType=Customize');
      for (let index in response.data) {
        this.dataPhoneList.push({ "id": response.data[index].ID, "itemName": response.data[index].LIST_NAME });
      }
    }
  }
  //#endregion

  async getPhoneList(event) {
    this.ids = '';
    let lstName = [];
    if (!this.lstChecked.includes(event.id)) {
      this.lstChecked.push(event.id);
      lstName.push(event.itemName);
    }
    else {
      let index = this.lstChecked.indexOf(event.id);
      if (index != -1)
        this.lstChecked.splice(index, 1);
    }
    this.ids = this.lstChecked.join(",");
    this.lstNameChecked = lstName.join(",");
    this.getPhone(this.ids);
  }

  async getPhone(lstId) {
    this.loadingUpload = true;
    this.listHeaderFile = [];
    this.listDataFile = [];
    this.dataUploadFilePaging = []
    this.fillNoiDung = [];
    let listTelco = ""
    if (this.isCheckSendVTL) listTelco += "VIETTEL,"
    if (this.isCheckSendGPC) listTelco += "GPC,"
    if (this.isCheckSendVMS) listTelco += "VMS,"
    if (this.isCheckSendVNM) listTelco += "VNM,"
    if (this.isCheckSendGTEL) listTelco += "GTEL,"
    if (this.isCheckSendSFONE) listTelco += "SFONE,"

    if (listTelco != "") listTelco = listTelco.substring(0, listTelco.length - 1)
    let response: any = await this.dataService.getAsync('/api/AccountPhoneListDetail/GetPhoneByListID?listID=' +
      lstId + '&listTelco=' + listTelco)
    if (response != null && response.err_code == 0) {

      this.isShowTable = true;
      this.isShowSendSms = true;
      this.listHeaderFile.push("PHONE");
      this.listHeaderFile.push("TELCO");

      let dataPhone = response.data
      this.listDataFile = dataPhone.listPhoneTelco

      this.countTotal = dataPhone.countTotal
      this.countVTL = dataPhone.countVIETTEL
      this.countGPC = dataPhone.countGPC
      this.countVMS = dataPhone.countVMS
      this.countVNM = dataPhone.countVNM
      this.countGTEL = dataPhone.countGTEL
      this.countSFONE = dataPhone.countSFONE
      this.countDDMBLE = dataPhone.countDDMBLE
      this.fillNoiDung = dataPhone.CONTENT;
      this.fillNoiDung = [];
      for (let i = 0; i < this.listDataFile.length; i++) {
        this.fillNoiDung.push({ NOI_DUNG: "" });
      }
      this.getDataImport(this.listDataFile);
    }
    this.loadingUpload = false;
  }

  async getDataSMSTemp() {
    this.dataSMSTemp = []
    let accountId = "";
    let senderId = "";
    if (this.selectedAccountID.length > 0) accountId = this.selectedAccountID[0].id;
    else this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("-68"));
    if (this.selectedSenderName.length > 0) senderId = this.selectedSenderName[0].id;
    let response: any = await this.dataService.getAsync('/api/smstemplate/GetSmsTempBySender?accountID=' + accountId + '&senderID=' + senderId)
    if (response)
      this.dataSMSTemp = response.data;
  }

  // upload file
  public async Upload() {
    this.loadingUpload = true;
    if (this.selectedAccountID.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-21"));
      return;
    }

    this.listHeaderFile = [];
    this.listDataFile = [];
    this.dataUploadFilePaging = []
    let file = this.uploadFile.nativeElement;
    if (file.files.length > 0) {
      let response: any = await this.dataService.importExcelAndSaveAsync(null, file.files, 2, this.campaignName.nativeElement.value,
        this.selectedAccountID[0].id, this.selectedAccountID[0].itemName)
      if (response != null && response.err_code == 0) {
        this.listHeaderFile = response.data.arr_fields;
        this.isShowTable = true;
        this.isShowSendSms = true;
        this.listDataFileTam = this.listDataFile = response.data.data;
        this.fillNoiDung = [];
        for (let i = 0; i < this.listDataFile.length; i++) {
          this.fillNoiDung.push({ NOI_DUNG: "" });
        }
        this.notificationService.displaySuccessMessage("Tải file thành công!");
        this.countTotal = response.data.telco[0];
        this.countVTL = response.data.telco[1];
        this.countGPC = response.data.telco[2];
        this.countVMS = response.data.telco[3];
        this.countVNM = response.data.telco[4];
        this.countGTEL = response.data.telco[5];
        this.getDataImport(response.data.data);
      }
      else {
        this.notificationService.displayErrorMessage("Có lỗi xảy ra!");
        this.uploadFile.nativeElement.value = "";
        this.loadingUpload = false;
        return;
      }
    }
    this.loadingUpload = false;
  }

  //clear textbox upload file
  clearData() {
    this.uploadFile.nativeElement.value = "";
  }

  //#region change send by telco
  onCheckSend(telco, isChecked) {
    if (telco == 'VIETTEL') {
      if (isChecked) this.isCheckSendVTL = true
      else this.isCheckSendVTL = false
    }
    if (telco == 'GPC') {
      if (isChecked) this.isCheckSendGPC = true
      else this.isCheckSendGPC = false
    }
    if (telco == 'VMS') {
      if (isChecked) this.isCheckSendVMS = true
      else this.isCheckSendVMS = false
    }
    if (telco == 'VNM') {
      if (isChecked) this.isCheckSendVNM = true
      else this.isCheckSendVNM = false
    }
    if (telco == 'GTEL') {
      if (isChecked) this.isCheckSendGTEL = true
      else this.isCheckSendGTEL = false
    }
    if (telco == 'SFONE') {
      if (isChecked) this.isCheckSendSFONE = true
      else this.isCheckSendSFONE = false
    }

    if (this.selectedPhoneList.length > 0) {
      this.getPhoneList(event);
    }
    else if (this.uploadFile.nativeElement.files.length > 0) {
      this.listDataFile = [];
      for (let i = 0; i < this.listDataFileTam.length; i++) {
        if (this.isCheckSendVTL && this.listDataFileTam[i].TELCO == "VIETTEL") {
          this.listDataFile.push(this.listDataFileTam[i]);
        }
        else if (this.isCheckSendGPC && this.listDataFileTam[i].TELCO == "GPC") {
          this.listDataFile.push(this.listDataFileTam[i]);
        }
        else if (this.isCheckSendVMS && this.listDataFileTam[i].TELCO == "VMS") {
          this.listDataFile.push(this.listDataFileTam[i]);
        }
        else if (this.isCheckSendVNM && this.listDataFileTam[i].TELCO == "VNM") {
          this.listDataFile.push(this.listDataFileTam[i]);
        }
        else if (this.isCheckSendGTEL && this.listDataFileTam[i].TELCO == "GTEL") {
          this.listDataFile.push(this.listDataFileTam[i]);
        }
      }
      this.countTotal = this.listDataFile.length;
      this.getDataImport(this.listDataFile);
    }
  }

  //#region tao noi dung tin nhan
  public async createContent(content) {
    let contentAfter = content;
    this.fillNoiDung = [];

    if (content == null || content == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-24"));
      return;
    }

    for (let i = 0; i < this.listDataFile.length; i++) {
      this.fillNoiDung.push({ NOI_DUNG: '' });
    }
    for (let i = 0; i < this.listDataFile.length; i++) {
      for (let k = 0; k <= this.listHeaderFile.length; k++) {
        let value = this.listDataFile[i][this.listHeaderFile[k]];
        if (value == null || value == "" || value == undefined) value = "";
        content = content.replace('[cot' + (k + 1) + ']', value);
      }
      this.fillNoiDung[i].NOI_DUNG = content.trim();
      content = contentAfter;
    }
  }

  getCot(index) {
    // var startPos = this.contentSMS.nativeElement.selectionStart;//get cursor position
    this.contentSMS.nativeElement.focus();
    let startString = this.contentSMS.nativeElement.value.substr(0, this.contentSMS.nativeElement.selectionStart);
    let endString = this.contentSMS.nativeElement.value.substr(this.contentSMS.nativeElement.selectionStart, this.contentSMS.nativeElement.value.length);
    this.smsContent = startString.trim() + " [cot" + index + "] " + endString.trim();
    this.contentSMS.nativeElement.focus();
  }
  //#endregion

  //#region send sms
  checkTimeSchedule(event) {
    if (event == 1) {
      this.isShowDateTime = true;
      this.minDate.setDate(this.minDate.getDate());
    }
    else {
      this.isShowDateTime = false;
    }
  }

  showConfirmSendSms() {
    this.loading = false;
    this.confirmSendSmsModal.show();
  }

  public async sendMessage() {
    this.loading = true;
    this.listContentSMS = [];
    let senderName = "";
    if (this.selectedSenderName.length > 0) {
      senderName = this.selectedSenderName[0].itemName;
    }
    let dataType = "";
    if (this.selectedSmsType.length > 0) dataType = this.selectedSmsType[0].id;
    else {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-20"));
      this.confirmSendSmsModal.hide();
      this.loading = false;
      return;
    }
    let timeNow = new Date();
    let scheduleTime = this.utilityService.formatDateToString(timeNow, "yyyyMMddHHmmss");

    let CODE_NAME = this.campaignName.nativeElement.value;
    if (CODE_NAME == "" || CODE_NAME == null || CODE_NAME == undefined) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-23"));
      this.campaignName.nativeElement.focus();
      this.confirmSendSmsModal.hide();
      this.loading = false;
      return;
    }
    if (this.smsContent == '' || this.smsContent == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-24"));
      this.confirmSendSmsModal.hide();
      return;
    }

    let IS_VIRTUAL = this.isVirtual == true ? 1 : 0;
    let TEMPLATE_ZALO_ID = "";
    let TEMPLATE_ZALO_CONTENT = "";
    if (this.showSelectTempZalo == true && this.selectedItemComboboxTempZalo.length > 0) {
      TEMPLATE_ZALO_ID = this.selectedItemComboboxTempZalo[0].id;
      TEMPLATE_ZALO_CONTENT = this.selectedItemComboboxTempZalo[0].itemName;
    }

    //#region hen gio gui
    let is_schedule = 0;
    if (this.isShowDateTime) {
      is_schedule = 1;
      let time = this.timeSchedule;
      if (time == null) {
        this.notificationService.displayWarnMessage("Input schedule time!");
        this.confirmSendSmsModal.hide();
        this.loading = false;
        return;
      }
      else {
        scheduleTime = this.utilityService.formatDateToString(time, "yyyyMMddHHmmss");
      }

      // check thoi gian hen gio nho hon thoi gian hien tai
      let currentTime = this.utilityService.formatDateToString(timeNow, "yyyyMMddHHmmss");
      if (currentTime > scheduleTime) {
        this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-90"));
        this.confirmSendSmsModal.hide();
        this.loading = false;
        return;
      }
    }
    //#endregion

    //#region check valid
    if (this.selectedAccountID.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-21"));
      this.confirmSendSmsModal.hide();
      this.loading = false;
      return;
    }
    let accountID = this.selectedAccountID[0].id;

    if (senderName == null || senderName == "") {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-44"));
      this.confirmSendSmsModal.hide();
      this.loading = false;
      return;
    }

    if (dataType == "QC") {
      let file = this.uploadFile.nativeElement;
      let telco = "";
      if (this.isCheckSendVTL) telco += "VIETTEL,";
      if (this.isCheckSendVMS) telco += "VMS,";
      if (this.isCheckSendGPC) telco += "GPC,";
      if (this.isCheckSendVNM) telco += "VNM,";
      if (this.isCheckSendSFONE) telco += "SFONE,";
      if (this.isCheckSendGTEL) telco += "GTEL,";
      if (telco != "") telco = telco.substring(0, telco.length - 1);
      if (file.files.length > 0) {
        let response: any = await this.dataService.SendSmsCustomizeQCAsync(file.files, accountID, dataType, senderName, this.smsContent, scheduleTime, IS_VIRTUAL,
          this.campaignName.nativeElement.value, telco, this.selectedSenderName[0].id, (this.sendUnicode == true ? 1 : 0));
        if (response.err_code == 0)
          this.messageSendSms = response.err_message;
        else
          this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("-115"));
        this.confirmSendSmsModal.hide();
        this.loading = false;
        return;
      }
    }
    else {
      //#endregion
      for (let i = 0; i < this.listDataFile.length; i++) {
        let noi_dung = this.fillNoiDung[i].NOI_DUNG;
        this.fillNoiDung.push({ NOI_DUNG: noi_dung });
        let phone = this.listDataFile[i][this.listHeaderFile[0]];
        if (noi_dung != "" && phone != "") {
          this.listContentSMS.push({
            PHONE: phone, SMS_CONTENT: noi_dung, SENDER_NAME: senderName, SCHEDULE_TIME: scheduleTime,
            ORDER_NAME: this.campaignName.nativeElement.value, ACCOUNT_ID: accountID, SMS_TYPE: dataType,
            IS_VIRTUAL: IS_VIRTUAL, REPORT_BY_EMAIL: this.isReportByEmail ? 1 : 0,
            SMS_TEMPLATE: this.smsContent, STATUS: (is_schedule == 0 && dataType == "CSKH") ? 2 : 0,
            CODE_NAME: this.campaignName.nativeElement.value,
            SENDER_ID: this.selectedSenderName[0].id, CONTENT_TYPE: (this.sendUnicode == true ? 1 : 0),
            TELCO: this.listDataFile[i]["TELCO"]
          });
        }
      }

      // check exists phone list
      if (this.listContentSMS.length == 0) {
        this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("180"));
        this.confirmSendSmsModal.hide();
        this.loading = false;
        return;
      }

      // check campaign > 50000 phone
      if (this.listContentSMS.length > 50000) {
        this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-109"));
        this.confirmSendSmsModal.hide();
        this.loading = false;
        return;
      }

      // get list file send sms
      if (this.selectedPhoneList != null && this.selectedPhoneList.length > 0)
        this.filePhoneList = this.selectedPhoneList[0].itemName + ",";
      if (this.filePhoneList != null && this.filePhoneList != "")
        this.filePhoneList += this.filePhoneList.substring(0, this.filePhoneList.length - 1);

      let file = this.uploadFile.nativeElement;
      if (this.showSelectTempZalo == false || this.selectedItemComboboxTempZalo.length == 0) {
        let insertSms = await this.dataService.postAsync('/api/sms/InsertListSMS?type=2&phoneList=' + this.filePhoneList, this.listContentSMS);
        if (insertSms.err_code == 0) {
          this.messageSendSms = insertSms.err_message;
        } 
        else if (insertSms != null && insertSms.err_code == -5) {
          this.messageSendSms = insertSms.err_message;
          this.notificationService.displayErrorMessage(insertSms.err_message);
        }
        else {
          this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
          this.loading = false;
          return;
        }
      }
      else {
        let telco = "";
        if (this.isCheckSendVTL) telco += "VIETTEL,";
        if (this.isCheckSendVMS) telco += "VMS,";
        if (this.isCheckSendGPC) telco += "GPC,";
        if (this.isCheckSendVNM) telco += "VNM,";
        if (this.isCheckSendSFONE) telco += "SFONE,";
        if (this.isCheckSendGTEL) telco += "GTEL,";
        telco = (telco != "") ? telco.substring(0, telco.length - 1) : "VIETTEL,VMS,GPC,VNM,SFONE,GTEL";

        let insertZalo = await this.dataService.postAsync("/api/FileExtention/SendSmsZalo?file=" + file.value + "&accountId=" + accountID + "&tempZaloId=" + TEMPLATE_ZALO_ID + "&tempZaloContent=" + TEMPLATE_ZALO_CONTENT + "&telcos=" + telco + "&phoneList=" + this.filePhoneList, this.listContentSMS);
        if (insertZalo.err_code == 0) {
          this.messageSendSms = insertZalo.err_message;
        }
        else if (insertZalo.err_code == -128) {
          this.notificationService.displayErrorMessage(insertZalo.err_message);
          this.confirmSendSmsModal.hide();
          this.loading = false;
          return;
        }
        else {
          this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
          this.confirmSendSmsModal.hide();
          this.loading = false;
          return;
        }
      }
    }
    this.loading = false;
    this.confirmSendSmsModal.hide();
    this.messageSendSmsModal.show();
    this.viewQuyTin(accountID);
  }

  showConfirmSendContinous() {
    this.messageSendSmsModal.hide();
    this.sendMessageContinuous();
  }

  confirmLeavePage() {
    this.confirmSendSmsContinuousModal.show();
  }

  sendMessageContinuous() {
    this.confirmSendSmsContinuousModal.hide();
    this.listHeaderFile = [];
    this.listDataFile = [];
    this.fillNoiDung = [];
    this.getDataImport();
    this.countVTL = 0;
    this.countGPC = 0;
    this.countVMS = 0;
    this.countVNM = 0;
    this.countGTEL = 0;
    this.countSFONE = 0;
    this.countDDMBLE = 0;
    this.countTotal = 0;
    //this.campaignName.nativeElement.value = "";
    this.uploadFile.nativeElement.value = "";
    this.contentSMS.nativeElement.value = "";
    this.selectedPhoneList = [];
    this.selectedSenderName = [];
    this.selectedItemComboboxTempZalo = [];
  }

  //#endregion

  async exportExcelTemplate() {
    let result: boolean = await this.dataService.getFileExtentionAsync("/api/FileExtention/ExportExcelTemplate", "SmsCustomize", "Template_SMS_Customize.xlsx");
    if (result) {
      this.notificationService.displaySuccessMessage("Xuất template thành công");
    }
    else {
      this.notificationService.displayErrorMessage("Xuất template lỗi");
    }
  }

  //#region pagging 
  changePageSizeImport(size) {
    this.paginationImport.pageSize = size;
    this.paginationImport.pageIndex = 1;
    this.getDataImport();

    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      this.paginationImport.pageIndex = 1;
    }, 1);
  }

  pageChangedImport(event: any): void {
    this.paginationImport.pageIndex = event.page;
    this.getDataImport();
  }

  getDataImport(data?: any) {
    if (this.paginationImport.pageSize != 'ALL') {
      this.dataUploadFilePaging = [];
      data = (data == null) ? this.listDataFile : data;
      this.paginationImport.totalRow = data.length;
      this.paginationImport.totalPage = this.utilityService.formatNumberTotalPage(this.paginationImport.totalRow / this.paginationImport.pageSize);
      let beginItem: number = (this.paginationImport.pageIndex - 1) * this.paginationImport.pageSize;
      let dataPaging: any = [];
      for (let index in data) {
        if (Number(index) >= beginItem && Number(index) < (beginItem + Number(this.paginationImport.pageSize))) {
          dataPaging.push(data[index]);
        }
      }
      this.dataUploadFilePaging = dataPaging;
    }
    else {
      this.dataUploadFilePaging = this.listDataFile;
    }
  }
  //#endregion

  async getDataTemplateZalo() {
    this.dataTempZalo = [];
    let accountId = this.selectedAccountID.length > 0 && this.selectedAccountID[0].id != "" ? this.selectedAccountID[0].id : "";
    let response: any = await this.dataService.getAsync("/api/TemplateZalo/GetTemplateZaloByAccount?account_id=" + accountId);
    if (response) {
      for (let inđex in response.data) {
        this.dataTempZalo.push({ "id": response.data[inđex].TEMPLATE_ID, "itemName": response.data[inđex].CONTENT });
      }
    }
  }

  // check send sms vietnamese
  async checkSendUnicode(event) {
    if (event) {
      this.sendUnicode = true;
      this.showSendZalo = true;
    }
    else {
      this.sendUnicode = false;
      this.showSendZalo = false;
      this.showSelectTempZalo = false;
    }
  }

  selectTempZalo() {
    this.smsContent = this.selectedItemComboboxTempZalo[0].itemName;
  }

  deSelectTempZalo() {

  }

  //#region change count sms
  countSMS(sms) {
    if (!this.sendUnicode) {
      this.smsContent = this.utilityService.removeSign4VietnameseString(this.utilityService.removeDiacritics(sms));
      let result = "";

      for (var i = 0, len = this.smsContent.length; i < len; i++) {
        if (this.smsContent.charCodeAt(i) == 160) {
          result += " ";
        }
        else if (this.smsContent.charCodeAt(i) <= 127) {
          result += this.smsContent[i];
        }
      }
      this.smsContent = result;
      var lengthsms = 0
      for (var k = 0; k < this.smsContent.length; k++) {
        if (this.smsContent.charAt(k) == '\\' || this.smsContent.charAt(k) == '^'
          || this.smsContent.charAt(k) == '{' || this.smsContent.charAt(k) == '}' || this.smsContent.charAt(k) == '['
          || this.smsContent.charAt(k) == ']' || this.smsContent.charAt(k) == '|') {
          lengthsms = lengthsms + 2;
        }
        else {
          lengthsms = lengthsms + 1;
        }
      }

      this.numberChar = lengthsms.toString();

      if (lengthsms == 0) {
        this.numberSMS = "0";
      }
      else if (lengthsms < 161) {
        this.numberSMS = "1";
      }
      else if (lengthsms < 307) {
        this.numberSMS = "2";
      }
      else if (lengthsms < 460) {
        this.numberSMS = "3";
      }
      else {
        this.numberSMS = "4";
      }
    }
    else {
      var lengthsms = 0
      for (var k = 0; k < this.smsContent.length; k++) {
        if (this.smsContent.charAt(k) == '\\' || this.smsContent.charAt(k) == '^'
          || this.smsContent.charAt(k) == '{' || this.smsContent.charAt(k) == '}' || this.smsContent.charAt(k) == '['
          || this.smsContent.charAt(k) == ']' || this.smsContent.charAt(k) == '|') {
          lengthsms = lengthsms + 2;
        }
        else {
          lengthsms = lengthsms + 1;
        }
      }

      this.numberChar = lengthsms.toString();

      if (lengthsms == 0) {
        this.numberSMS = "0";
      }
      else if (lengthsms <= 70) {
        this.numberSMS = "1";
      }
      else if (lengthsms <= 134) {
        this.numberSMS = "2";
      }
      else if (lengthsms <= 201) {
        this.numberSMS = "3";
      }
      else if (lengthsms <= 268) {
        this.numberSMS = "4";
      }
      else if (lengthsms <= 335) {
        this.numberSMS = "5";
      }
    }
  }
  //#endregion

  // get sms template
  confirmSMSTemp(content) {
    this.smsContent += content;
    this.showSMSTemplateModal.hide();
    this.countSMS(this.smsContent);
  }

  // show sms template
  confirmSMSTemplateModal() {
    if (this.selectedSenderName.length > 0) {
      this.getDataSMSTemp();
      this.showSMSTemplateModal.show();
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("-44"));
    }
  }

  isCheckSendZalo(event) {
    if (event) {
      this.showSelectTempZalo = true;
      this.getDataTemplateZalo();
    } else {
      this.showSelectTempZalo = false;
    }
  }

  // delete account phone list detail by list id
  async confirmDelete(phone) {
    let response: any = await this.dataService.deleteAsync('/api/accountphonelistdetail/DeletePhoneByLstId?lstId=' + this.ids + '&phone=' + phone)
    if (response.err_code == 0) {
      this.getPhone(this.ids);
      this.confirmDeleteModal.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("200"));
    }
    else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  public async exportPhoneList() {
    if (this.selectedPhoneList.length > 0) {
      let result: boolean = await this.dataService.getFileExtentionSmsCustomizeAsync("/api/FileExtention/ExportExcelSmsCustomize",
        this.selectedPhoneList[0].id, this.selectedPhoneList[0].itemName);
      if (result) {
        this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("120"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
      }
    }
    else this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("125"));
  }
}
