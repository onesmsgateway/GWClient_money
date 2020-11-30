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
  selector: 'app-token-oa',
  templateUrl: './token-oa.component.html',
  styleUrls: ['./token-oa.component.css']
})
export class TokenOaComponent implements OnInit {

  @ViewChild('showModalCreate', { static: false }) public showModalCreate: ModalDirective;
  @ViewChild('showModalUpdate', { static: false }) public showModalUpdate: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  public dataTokenOA = [];
  public pagination: Pagination = new Pagination();
  public name;
  public id;
  public inName: string = '';
  public formEditTokenOA: FormGroup;
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

    this.formEditTokenOA = new FormGroup({
      id: new FormControl(),
      name: new FormControl(),
      token: new FormControl()
    });
  }

  ngOnInit() {
    this.getData();
  }

  //#region load data
  async getData() {
    let response: any = await this.dataService.getAsync('/api/tokenOA/GetTokenOAPaging?pageIndex=' + this.pagination.pageIndex +
      "&pageSize=" + this.pagination.pageSize + "&name=" + this.inName)
    this.loadData(response);
  }

  loadData(response?: any) {
    if (response) {
      this.dataTokenOA = response.data;
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
  async createTokenOA(item) {
    let smsTemp = item.value;
    let NAME = smsTemp.name;
    let TOKEN = smsTemp.token;
    if (NAME == "" || NAME == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-124"));
      return;
    }
    if (TOKEN == "" || TOKEN == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-125"));
      return;
    }

    let response: any = await this.dataService.postAsync('/api/tokenOA', {
      NAME, TOKEN
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
    let response: any = await this.dataService.getAsync('/api/tokenOA/' + id)
    if (response.err_code == 0) {
      let dataSmsTemp = response.data[0];
      this.formEditTokenOA = new FormGroup({
        id: new FormControl(id),
        name: new FormControl(dataSmsTemp.NAME),
        token: new FormControl(dataSmsTemp.TOKEN)
      });
      this.showModalUpdate.show();
    } else {
      this.notificationService.displayErrorMessage(response.err_message);
    }
  }

  // update tin mẫu
  async editTokenOA() {
    let formData = this.formEditTokenOA.controls;
    let ID = formData.id.value;
    let NAME = formData.name.value;
    let TOKEN = formData.token.value;
    if (NAME == "" || NAME == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-124"));
      return;
    }
    if (TOKEN == "" || TOKEN == null) {
      this.notificationService.displayWarnMessage(this.utilityService.getErrorMessage("-125"));
      return;
    }
    let response: any = await this.dataService.putAsync('/api/tokenOA/' + ID, {
      NAME, TOKEN
    })
    if (response.err_code == 0) {
      this.showModalUpdate.hide();
      this.notificationService.displaySuccessMessage(this.utilityService.getErrorMessage("300"));
      this.getData();
    } else {
      this.notificationService.displayErrorMessage(this.utilityService.getErrorMessage("110"));
    }
  }

  showConfirmDelete(id, name) {
    this.name = name;
    this.id = id;
    this.confirmDeleteModal.show();
  }

  // delete
  async confirmDelete(id) {
    let response: any = await this.dataService.deleteAsync('/api/tokenOA/' + id)
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
