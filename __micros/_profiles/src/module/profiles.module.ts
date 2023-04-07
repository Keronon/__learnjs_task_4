
// other modules
import { ConfigModule } from '@nestjs/config';

// this module >>

import { Module        } from '@nestjs/common';
import { AppController } from './profiles.controller';
import { AppService    } from './profiles.service';

@Module( {
    imports:
    [
        ConfigModule.forRoot( { envFilePath: `.env`, isGlobal: true } )
    ],
    controllers: [ AppController ],
    providers  : [ AppService    ],
} )
export class AppModule { }
