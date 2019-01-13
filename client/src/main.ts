import * as _ from 'lodash';
import * as pipClient from './services/pip-client';
import pipServer from './services/pip-server';



export class Calculator {
    public static Sum(a: number[]): number {
        return _.sum(a);
    }

    public static Difference(a: number, b: number): number {
        let c = a - b;
        return c;
    }
}

function bootstrap() {
    // initialize app here
    // load components here
    // let a = pipServer;
    pipClient;
    pipServer;
}

bootstrap();
