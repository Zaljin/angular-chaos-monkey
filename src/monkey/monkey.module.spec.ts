import {HttpClient} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {Inject, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {Monkey, MonkeyConfiguration} from './monkey';
import {ChaosMonkeyModule} from './monkey.module';

@Injectable()
export class FakeService {
  constructor(@Inject(Monkey) public readonly monkey: Monkey) {}
}

const FAKE_URL = 'goto.com/fake/myAPI?id=0193923';

@Injectable()
export class DataService {
  constructor(private http: HttpClient) {}

  getData() { return this.http.get(FAKE_URL) }
}

describe('chaos monkey module', () => {
  let service: FakeService;
  let dataService: DataService;
  let httpMock: HttpTestingController;

  async function configure(config: MonkeyConfiguration) {
    await TestBed.configureTestingModule({
      imports : [
        ChaosMonkeyModule.openBarrel(config),
      ],
      providers : [ FakeService ],
    });

    service = TestBed.get(FakeService);
  }

  test('providers', async () => {
    await configure({probability : 1});
    expect(service.monkey).toBeDefined();
  });

  test('http client', async () => {
    await TestBed.configureTestingModule({
      imports : [
        HttpClientTestingModule,
        ChaosMonkeyModule.openBarrel(),
      ],
      providers : [ DataService ],
    });

    dataService = TestBed.get(DataService);
    httpMock = TestBed.get(HttpTestingController);

    dataService.getData().subscribe(() => {});

    httpMock.expectOne(FAKE_URL);
  });
});