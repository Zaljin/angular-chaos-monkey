import {HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {cold} from 'jest-marbles';
import {Observable} from 'rxjs';

import {Monkey} from './monkey';

class MockHandler extends HttpHandler {
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    throw new Error("Method not implemented.");
  }
}

describe('monkey http interceptor', () => {
  let monkey: Monkey;
  let request: HttpRequest<any>;
  let handler: HttpHandler;

  function expectMonkeyDo(expected: any) {
    const response = monkey.intercept(request, handler);

    expect(response).toBeObservable(expected);
  }

  describe('given no configuration', () => {
    beforeEach(() => {
      monkey = new Monkey();
      request = new HttpRequest('GET', '');
      handler = new MockHandler();
    });

    test('returns original request', () => {
      jest.spyOn(handler, 'handle').mockReturnValue(cold('a'));
      expectMonkeyDo(cold('a'));
    });
  });
});
