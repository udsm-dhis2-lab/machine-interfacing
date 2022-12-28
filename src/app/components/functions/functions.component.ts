import { Component, NgZone, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { InterfaceService } from "../../services/interface.service";
import { FxPayload, FxResponse } from "../../shared/interfaces/fx.interface";
import { AddOrChangeSecretComponent } from "../add-or-change-secret/add-or-change-secret.component";
import { CreateEditFunctionComponent } from "../create-edit-function/create-edit-function.component";
import { InfoComponent } from "../info/info.component";
import { ScheduleComponent } from "../schedule/schedule.component";

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
})
export class FunctionsComponent implements OnInit {
  actionsClicked: boolean = false;
  pageSizeOptions: any[] = [5, 10, 50, 100];
  totalRows: number;
  fxRunning: boolean;
  processes: FxPayload[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  liveLogText: any[] = [];
  displayedColumns: string[] = ["name", "description", "frequency", "actions"];

  constructor(
    private service: DatabaseService,
    private router: Router,
    private interfaceService: InterfaceService,
    private _ngZone: NgZone,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.interfaceService.liveLog.subscribe((mesg) => {
      this._ngZone.run(() => {
        this.liveLogText = mesg;
      });
    });
    this.loadFunctions();
    // this.runCron();
  }

  onEdit(fx: FxPayload) {
    this.newFunction(fx);
  }

  scheduleCron = (fx: FxPayload, edit: boolean) => {
    const confirmDialog = this.dialog.open(ScheduleComponent, {
      width: "auto",
      height: "auto",
      disableClose: true,
      data: { fx, edit },
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res && typeof res === "boolean") {
        this.loadFunctions();
      }
    });
  };

  navigateToDashboard() {
    this.router.navigate(["./dashboard"]);
  }
  newFunction(data?: any) {
    const createFunctionDialog = this.dialog.open(CreateEditFunctionComponent, {
      width: "65vw",
      height: "auto",
      disableClose: true,
      data,
    });
    createFunctionDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.loadFunctions();
      }
    });
  }

  addOrChangeSecret(fx: FxPayload) {
    const confirmDialog = this.dialog.open(AddOrChangeSecretComponent, {
      width: "45vw",
      height: "auto",
      disableClose: true,
      data: fx,
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.loadFunctions();
      }
    });
  }

  loadFunctions = () => {
    this.service
      .getProcesses({ page: this.currentPage, pageSize: this.pageSize })
      .then((res) => {
        this.processes = res.data;
        this.totalRows = res.count;
      });
  };

  openSnackBar = (data: FxResponse) => {
    this.snackBar.open(data.message, "", {
      duration: 2500,
      panelClass: data.success ? ["success"] : ["error"],
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  };

  runCron = () => {
    this.service.runCron();
  };

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadFunctions();
  }

  onRun = (fx: FxPayload) => {
    this.service.run(fx.id).then((res) => {
      this.liveLogText = [
        `<span> <span class="text-info">[Info]</span> ${res}</span>`,
      ];
    });
  };

  onDelete = (fx: FxPayload) => {
    const confirmDialog = this.dialog.open(InfoComponent, {
      width: "300px",
      height: "190px",
    });
    confirmDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.deleteFx(fx);
      }
    });
  };

  private deleteFx = (fx: FxPayload) => {
    this.service.deleteProcesses(fx.id).then((res) => {
      this.openSnackBar(res);
      this.loadFunctions();
    });
  };
}
