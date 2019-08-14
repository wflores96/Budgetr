import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';;
import { AuthService } from './service/auth.service';
import { Router } from '@angular/router';
import { DataService } from './service/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  public loggedIn$: Observable<boolean>;

  constructor(private auth: AuthService, private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.loggedIn$ = this.auth.authenticated$;
    this.dataService.checkMigrate().subscribe(resp => {
    });
  }

  public async logout(): Promise<void> {
    return this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
