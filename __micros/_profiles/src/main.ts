
const log = ( line: string ) => console.log( `\n = > ${line}\n` );

import { NestFactory } from '@nestjs/core';
import { AppModule   } from './module/profiles.module';

async function start ()
{
    const PORT = process.env.PORT || 12121;
    const APP  = await NestFactory.create( AppModule );

    await APP.listen( PORT, () => log( `micro - profiles : running\n = > on port : ${PORT}` ) );
}
start();
