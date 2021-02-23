import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Ajv, { ValidateFunction } from 'ajv';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { FairUser } from './domain/fair-user';
import { UglyUser } from './domain/ugly-user';

type User = FairUser | UglyUser;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly resourceUrl = 'https://jsonplaceholder.typicode.com/users/1';
  private readonly fairUserSchemaFile$ = this.getSchemaFile$('fair-user');
  private readonly uglyUserSchemaFile$ = this.getSchemaFile$('ugly-user');
  zipCode = '';
  jsonResponse: User = null;
  validationErrors = '';

  constructor(private readonly httpClient: HttpClient) {}

  loadFairUser(): void {
    this.loadUser$<FairUser>(this.fairUserSchemaFile$).subscribe((rsp) => (this.zipCode = rsp.address.zipcode));
  }

  loadUglyUser(): void {
    this.loadUser$<UglyUser>(this.uglyUserSchemaFile$).subscribe((rsp) => (this.zipCode = rsp.address.uglyZipcode));
  }

  private loadUser$<T extends User>(validator$: Observable<ValidateFunction>): Observable<T> {
    this.jsonResponse = null;
    this.validationErrors = '';
    return combineLatest([this.httpClient.get<T>(this.resourceUrl), validator$]).pipe(
      tap(([rsp, validator]) => {
        this.jsonResponse = rsp;
        if (!validator(rsp)) {
          this.validationErrors = validator.errors.map((e) => `"${e.dataPath || 'root'}" ${e.message}`).join('\n  ');
        }
      }),
      map(([rsp]) => rsp)
    );
  }

  private getSchemaFile$(name: string): Observable<ValidateFunction> {
    return this.httpClient.get<any[]>(`assets/schemas/${name}.schema.json`).pipe(
      map((schema) => new Ajv().compile(schema)),
      shareReplay(1)
    );
  }
}
