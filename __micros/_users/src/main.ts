
const log = ( data: string ) => console.log( `\n = > ${data}\n` );

import { NestFactory } from '@nestjs/core';
import { AppModule   } from './module/users.module';

export default async function start ()
{
    const PORT = process.env.PORT || 12121;
    const APP  = await NestFactory.create( AppModule );

    await APP.listen( PORT, () => log( `micro - users : running\n = > on port : ${PORT}` ) );
}
start();
