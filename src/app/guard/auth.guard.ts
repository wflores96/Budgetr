import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
      
    return this.auth.currentFireUser$.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if(!loggedIn) {
          console.log('access denied');
          this.router.navigate(['/login']);
        }
      })
    )
  }
}
