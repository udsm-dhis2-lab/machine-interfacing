import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ElectronStoreService } from "../services/electron-store.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public settings: any = {};
  public user: { login: string; password: string } = {
    login: "",
    password: "",
  };
  hide: boolean = true;
  constructor(private router: Router, private store: ElectronStoreService) {
    this.settings = this.store.get("appSettings");

    if (
      undefined !== this.settings &&
      null !== this.settings &&
      undefined !== this.settings.interfaceAutoConnect &&
      null !== this.settings.interfaceAutoConnect &&
      "yes" === this.settings.interfaceAutoConnect
    ) {
      this.store.set("loggedin", true);
      this.router.navigate(["/dashboard"]);
    }
  }

  ngOnInit(): void {}

  public doLogin() {
    if (this.user.login === "admin" && this.user.password === "admin") {
      this.store.set("loggedin", true);

      if (undefined === this.settings) {
        this.router.navigate(["/settings"]);
      } else {
        this.router.navigate(["/dashboard"]);
      }
    } else {
      const myNotification = new Notification("Error", {
        body: "Oops! Wrong username or password.",
      });
      this.router.navigate([""]);
    }
  }
}
