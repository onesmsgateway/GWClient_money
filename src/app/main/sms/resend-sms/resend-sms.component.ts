import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Time } from '@angular/common';

@Component({
  selector: 'app-resend-sms',
  templateUrl: './resend-sms.component.html',
  styleUrls: ['./resend-sms.component.css']
})
export class ResendSmsComponent implements OnInit {

  @ViewChild('confirmSendSMSModal', { static: false }) public confirmSendSMSModal;

  public dataCampaignDetail = [];
  public dataSender = [];
  public dataCampaign = [];
  public dataTypeFrom = [];
  public dataTypeTo = [];
  public dataPartner = [];
  public settingsFilterSender = {};
  public selectedItemComboboxSender = [];
  public settingsFilterCampaign = {};
  public selectedItemComboboxCampaign = [];
  public settingsFilterType = {};
  public selectedItemComboboxTypeFrom = [];
  public selectedItemComboboxTypeTo = [];
  public settingsFilterPartner = {};
  public selectedItemComboboxPartner = [];
  public dateSend: string = "";
  public dateFrom: Date;
  public dateTo: Date;
  public minDate: Date;
  public dateResent: string;
  public timeSend: string = "";
  public smsContent: string = "";
  public loadingGrid: boolean = false;
  public isCheckVTL: boolean = false;
  public isCheckVMS: boolean = false;
  public isCheckGPC: boolean = false;
  public isCheckVNM: boolean = false;
  public isCheckGTEL: boolean = false;
  public isCheckSFONE: boolean = false;
  public loading: boolean = false;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private authService: AuthService) {

    this.settingsFilterSender = {
      text: this.utilityService.translate("global.choose_sender"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterType = {
      text: this.utilityService.translate("global.choose_smstype"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterCampaign = {
      text: this.utilityService.translate("global.choose_campaign"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };

    this.settingsFilterPartner = {
      text: this.utilityService.translate("global.choose_port"),
      singleSelection: true,
      enableSearchFilter: true,
      enableFilterSelectAll: true,
      searchPlaceholderText: this.utilityService.translate("global.search"),
      noDataLabel: this.utilityService.translate("global.no_data"),
      showCheckbox: false
    };
    this.dateSend = this.utilityService.formatDateToString(this.dateFrom, "yyyyMMdd");
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }

  ngOnInit() {
    this.bindDataType();
    this.bindDataSender();
    this.bindDataPartner();
  }

  //#region load sms type
  public async bindDataType() {
    let response: any = await this.dataService.getAsync('/api/sysvar/GetSysvarByGroup?var_group=SMS_TYPE');
    for (let i in response.data) {
      this.dataTypeFrom.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
      this.dataTypeTo.push({ "id": response.data[i].VAR_VALUE, "itemName": response.data[i].VAR_NAME });
    }
  }

  onItemSelectType() {
    this.bindDataSender();
  }
  //#endregion

  //#region load port
  public async bindDataPartner() {
    let response = await this.dataService.getAsync('/api/Partner');
    for (let i in response.data) {
      this.dataPartner.push({ "id": response.data[i].PARTNER_CODE, "itemName": response.data[i].PARTNER_NAME });
    }
  }
  //#endregion

  //#region load sender
  async bindDataSender() {
    this.selectedItemComboboxSender = [];
    this.dataSender = [];
    let smsType = this.selectedItemComboboxTypeFrom.length > 0 ? this.selectedItemComboboxTypeFrom[0].id : "";
    let response: any = await this.dataService.getAsync('/api/SenderName/GetSenderByAccountAndType?accountID=&smsType=' + smsType)
    for (let index in response.data) {
      this.dataSender.push({ "id": response.data[index].NAME, "itemName": response.data[index].NAME });
    }
    if (this.dataSender.length == 1)
      this.selectedItemComboboxSender.push({ "id": this.dataSender[0].id, "itemName": this.dataSender[0].itemName });
  }

  onItemSelectSender() {
    this.bindDataCampaign();
  }

  onItemDeSelectSender() {
    this.dataCampaign = [];
    this.dataCampaignDetail = [];
  }
  //#endregion

  // choose date
  onChangeFromDate(event) {
    if (event)
      this.dateSend = this.utilityService.formatDateToString(event, "yyyyMMdd");
    else
      this.dateSend = "";
    this.bindDataCampaign();
  }

  //#region load campaign
  public async bindDataCampaign() {
    this.dataCampaign = [];
    this.dataCampaignDetail = [];
    this.selectedItemComboboxCampaign = [];
    let senderName = this.selectedItemComboboxSender.length > 0 ? this.selectedItemComboboxSender[0].id : "";
    let smsType = this.selectedItemComboboxTypeFrom.length > 0 ? this.selectedItemComboboxTypeFrom[0].id : "";

    let response = await this.dataService.getAsync('/api/Campaign/GetCampaignBySenderDateType?senderName=' + senderName + "&date=" + this.dateSend + "&type=" + smsType);
    for (let i in response.data) {
      this.dataCampaign.push({
        "id": response.data[i].ID, "itemName": "Thương hiệu: " + response.data[i].SENDER_NAME + " - Loại tin: " + response.data[i].SMS_TYPE + " - Thời gian gửi: "
          + response.data[i].TIMESCHEDULE + " - Tổng tin: " + response.data[i].COUNT_SMS
      });
    }
    if (this.dataCampaign.length == 1) {
      this.selectedItemComboboxCampaign.push({ "id": this.dataCampaign[0].id, "itemName": this.dataCampaign[0].itemName });
      this.loadGrid();
    }
  }

  onItemSelectCampaign() {
    this.loadGrid();
  }
  //#endregion load campaign

  //#region load grid
  async loadGrid() {
    let campaignId = this.selectedItemComboboxCampaign.length > 0 ? this.selectedItemComboboxCampaign[0].id : 0;
    let response = await this.dataService.getAsync('/api/Campaign/' + campaignId);
    this.dataCampaignDetail = response.data;
  }
  //#endregion

  // gui lai
  async ReSendSms() {
    this.loading = true;
    if (this.selectedItemComboboxCampaign.length == 0) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-110"));
      this.confirmSendSMSModal.hide();
      return;
    }
    let CAMPAIGN_ID = this.selectedItemComboboxCampaign[0].id;
    let SMS_TYPE = this.selectedItemComboboxTypeTo.length > 0 ? this.selectedItemComboboxTypeTo[0].id : "";
    let PARTNER_NAME = this.selectedItemComboboxPartner.length > 0 ? this.selectedItemComboboxPartner[0].id : "";
    let SENT_TIME = this.timeSend != "" ? this.timeSend.replace(":","") + "00" : "";   
    this.dateResent = this.utilityService.formatDateToString(this.dateTo, "yyyyMMdd");
    let SENT_DATE = this.dateResent;
    let SMS_CONTENT = this.smsContent;
    let SENDER_NAME = this.selectedItemComboboxSender[0].id;
    let TELCO = "";
    if (this.isCheckVTL) TELCO += "'VIETTEL',";
    if (this.isCheckGPC) TELCO += "'GPC',";
    if (this.isCheckVMS) TELCO += "'VMS',";
    if (this.isCheckVNM) TELCO += "'VNM',";
    if (this.isCheckGTEL) TELCO += "'GTEL',";
    if (this.isCheckSFONE) TELCO += "'SFONE',";
    TELCO = TELCO != "" ? TELCO.substr(0, TELCO.length - 1) : "";
    if(this.dateTo < this.minDate)
    {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("-90"));
    }
    else
    {
      let response: any = await this.dataService.postAsync('/api/sms/ResendSMS', {
        CAMPAIGN_ID, SMS_TYPE, PARTNER_NAME,SENT_DATE, SENT_TIME, SMS_CONTENT, TELCO, SENDER_NAME
      });
      if (response.err_code == 0) {
        this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("250"));
      }
      else if (response.err_code == -30) {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("-30"));
      }
      else {
        this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
      }
    }
   
    this.confirmSendSMSModal.hide();
    this.loading = false;
    debugger;
  }
}
