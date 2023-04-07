
// other modules
import { ConfigModule } from '@nestjs/config';
import { JwtModule    } from '@nestjs/jwt';

// this module >>

import { Module        } from '@nestjs/common';
import { AppController } from './users.controller';
import { AppService    } from './users.service';

@Module( {
    imports:
    [
        ConfigModule.forRoot( { envFilePath: `.env`, isGlobal: true } ),
        JwtModule.register( {
            secret: process.env.PRIVATE_KEY || `pKey`,
            signOptions: { expiresIn: `24h` }
        } )
    ],
    controllers: [ AppController ],
    providers  : [ AppService    ],
} )
export class AppModule { }
