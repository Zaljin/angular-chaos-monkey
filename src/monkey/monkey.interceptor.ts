import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {Monkey} from './monkey';

@Injectable()
export class MonkeyInterceptor implements HttpInterceptor {
  constructor(private readonly monkey?: Monkey) {}

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    return this.monkey.around(req, next);
  }
}
