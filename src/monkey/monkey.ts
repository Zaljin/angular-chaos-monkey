import {HttpHeaders, HttpInterceptor} from '@angular/common/http';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {Optional} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';

export class MonkeyConfiguration {
  urlPattern?: RegExp;

  /**
   * Determines whether to send the original HTTP request, and modify the real
   * response. Setting this value to false will create a fake response.
   *
   * If a urlPattern is specified, the passThrough will only respect matching
   * URLs.
   */
  passThrough?: boolean = true;

  probability: number = 0.2;
}

export class Monkey implements HttpInterceptor {
  constructor(@Optional() private readonly config?: MonkeyConfiguration) {
    if (!config)
      this.config = new MonkeyConfiguration();
  }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    const urlMatchesPattern =
        !this.config.urlPattern || this.config.urlPattern.test(req.url);

    if (!urlMatchesPattern)
      return next.handle(req);

    const response$ = this.config.passThrough
                          ? next.handle(req)
                          : observableOf(new HttpResponse({}));

    return response$;
  }

  private createFakeResponse() {
    return new HttpResponse({
      body : {},
      headers : new HttpHeaders({}),
      status : 400,
      statusText : '',
      url : '',
    });
  }
}
