import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {Injectable} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {cold} from 'jest-marbles';
import {Observable} from 'rxjs';

import {Monkey, MonkeyConfiguration} from './monkey';

class MockHandler extends HttpHandler {
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    throw new Error(`Method not implemented.`);
  }
}

const fakeURL = 'myURL.com/api/myAPI?id=0239';

@Injectable()
class DataService {
  constructor(private http: HttpClient) {}

  getAPI() { return this.http.get<any>(fakeURL); }
}

const FAKE_RESPONSE = new HttpResponse({
  body : undefined,
  headers : new HttpHeaders({}),
  status : 404,
  statusText : '',
  url : '',
});

describe('monkey', () => {
  let monkey: Monkey;
  let request: HttpRequest<any>;
  let handler: HttpHandler;

  function expectMonkeyDo(expected: any) {
    const response = monkey.around(request, handler);

    expect(response).toBeObservable(expected);
  }

  describe('given zero probability', () => {
    beforeEach(() => {
      request = new HttpRequest('GET', 'faketest.com/myAPI/myendpoint?id=0');
      handler = new MockHandler();
    });

    test('returns original request', () => {
      monkey = new Monkey({
        urlPattern : /myAPI/,
        probability : 0,
        random : () => 0.3,
      });
      jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
      expectMonkeyDo(cold('a'));
    });
  });

  describe('given a probability', () => {
    beforeEach(() => {
      request = new HttpRequest('GET', 'faketest.com/myAPI/myendpoint?id=0');
      handler = new MockHandler();
    });

    describe('with a lower roll', () => {
      test('returns empty HttpResponse object', () => {
        monkey = new Monkey({
          urlPattern : /myAPI/,
          probability : 0.5,
          random : () => 0.3,
        });
        jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
        expectMonkeyDo(cold('(a|)', {a : FAKE_RESPONSE}));
      });
    });

    describe('with an equivalent roll', () => {
      test('returns original request', () => {
        monkey = new Monkey({
          urlPattern : /myAPI/,
          probability : 0.5,
          random : () => 0.5,
        });
        jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
        expectMonkeyDo(cold('a'));
      });
    });

    describe('with a higher roll', () => {
      test('returns original request', () => {
        monkey = new Monkey({
          urlPattern : /myAPI/,
          probability : 0.5,
          random : () => 0.7,
        });
        jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
        expectMonkeyDo(cold('a'));
      });
    });
  });

  describe('given no url pattern', () => {
    beforeEach(() => {
      monkey = new Monkey({
        probability : 1,
      });
      request = new HttpRequest('GET', '');
      handler = new MockHandler();
    });

    test('returns original request', () => {
      jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
      expectMonkeyDo(cold('a'));
    });
  });

  describe('given a url pattern', () => {
    beforeEach(() => {
      monkey = new Monkey({
        urlPattern : /myAPI/,
        probability : 1,
      });
      handler = new MockHandler();
    });

    describe('with a url match', () => {
      beforeEach(() => {
        request = new HttpRequest('GET', 'faketest.com/myAPI/myendpoint?id=0');
      });

      test('returns empty HttpResponse object', () => {
        jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
        expectMonkeyDo(cold('(a|)', {a : FAKE_RESPONSE}));
      });
    });

    describe('with no url match', () => {
      beforeEach(() => {
        request = new HttpRequest('GET', 'faketest.com/noAPI/myendpoint?id=0');
      });

      test('returns original request', () => {
        jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
        expectMonkeyDo(cold('a'));
      });
    });
  });

  describe('given no passThrough for API calls', () => {
    beforeEach(() => {
      monkey = new Monkey({
        urlPattern : /myAPI/,
        probability : 1,
        passThrough : false,
      });
      request = new HttpRequest('GET', 'faketest.com/myAPI/myendpoint?id=0');
      handler = new MockHandler();
    });

    test('returns empty HttpResponse object',
         () => { expectMonkeyDo(cold('(a|)', {a : FAKE_RESPONSE})); });
  });
});
