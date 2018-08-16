import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ModuleWithProviders, NgModule, Optional, Self} from '@angular/core';

import {Monkey, MonkeyConfiguration} from './monkey';
import {MonkeyInterceptor} from './monkey.interceptor';

export function MONKEY_FACTORY(config?: MonkeyConfiguration) {
  return new Monkey(config);
}

@NgModule({})
export class ChaosMonkeyModule {
  static openBarrel(config?: MonkeyConfiguration): ModuleWithProviders {
    return {
      ngModule: ChaosMonkeyModule, providers: [
        {
          provide : MonkeyConfiguration,
          useValue : config,
        },
        Monkey,
        {
          provide : HTTP_INTERCEPTORS,
          useClass : MonkeyInterceptor,
          multi : true,
        },
      ],
    }
  }
}
