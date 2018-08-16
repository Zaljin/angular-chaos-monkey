import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {Injectable, Optional} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class MonkeyConfiguration {
  urlPattern?: RegExp = /.*/;

  /**
   * Determines whether to send the original HTTP request, and modify the real
   * response. Setting this value to false will create a fake response.
   *
   * If a urlPattern is specified, the passThrough will only respect matching
   * URLs.
   */
  passThrough?: boolean = true;

  probability?: number = 1;

  random?: () => number;

  mockResponse?: {body?: string; status?: number;} = {
    body : undefined,
    status: 404,
  };
}

@Injectable()
export class Monkey {
  constructor(@Optional() private readonly config?: MonkeyConfiguration) {
    if (!config)
      this.config = new MonkeyConfiguration();
  }

  around(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const urlMatchesPattern =
        this.config.urlPattern && this.config.urlPattern.test(req.url);
    const skip = this.config.probability === 0;
    const applyChaos = this.random() < this.config.probability;

    if (skip || !applyChaos || !urlMatchesPattern)
      return next.handle(req);

    const response$ =
        this.config.passThrough
            ? next.handle(req).pipe(map(() => this.createFakeResponse()))
            : observableOf(this.createFakeResponse());

    return response$;
  }

  private random() {
    return this.config && this.config.random && this.config.random() ||
           Math.random();
  }

  private createFakeResponse(original?: HttpResponse<any>) {
    if (original) {
      return original.clone<any>({
        body : this.config.mockResponse && this.config.mockResponse.body,
        status :
            this.config.mockResponse && this.config.mockResponse.status || 404,
      });
    }
    return new HttpResponse({
      body : this.config.mockResponse && this.config.mockResponse.body,
      headers : new HttpHeaders({}),
      status :
          this.config.mockResponse && this.config.mockResponse.status || 404,
      statusText : '',
      url : '',
    });
  }
}
