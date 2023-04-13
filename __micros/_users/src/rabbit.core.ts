
const log = ( data: any ) => console.log( colors.fg.blue, ` - > R-Users :`, data, colors.reset );

import * as amqp from 'amqplib';
import { colors } from './console.colors';

// structs
import { MsgData } from './structs.core';
import { ConflictException } from '@nestjs/common';

const exchangeName  = `profiles - users`;
const exchangeKeys  = { CMDs: `cmd`, DATA: `data` };
const exchangeTypes = { ByKEY: undefined, ByBindKEY: 'direct', ToALL: 'fanout', HEADERS: 'headers', ByFILTER: 'topic' };
const queueOptions  : amqp.Options.AssertQueue = { expires : 5000 };

export class Rabbit
{
    public  channel  : amqp.Channel;
    public  queueCMDs: amqp.Replies.AssertQueue;
    private queueDATA: amqp.Replies.AssertQueue;

    // initializing of rabbit service objects
    async Prepare()
    {
        log(`prepare`);

        // connecting to rabbit
        let connection;
        try {
            connection = await amqp.connect( process.env.AMQP_URL );
        } catch (ex) { log( (new Date()).toTimeString() ); throw ex; }
        this.channel = await connection.createChannel();
        if ( !this.channel )
            throw new ConflictException( `Can not connet to the rabbit channel` );
        await this.channel.assertExchange( exchangeName, exchangeTypes.ByKEY );

        // creating commands queue
        this.queueCMDs = await this.channel.assertQueue( `CMDs`, queueOptions );
        await this.channel.bindQueue( this.queueCMDs.queue, exchangeName, exchangeKeys.CMDs );
    }

    async Publish( data: MsgData )
    {
        log(`publish`);

        // creating data queue
        this.queueDATA = await this.channel.assertQueue( `DATA`, queueOptions );
        await this.channel.bindQueue( this.queueDATA.queue, exchangeName, exchangeKeys.DATA );

        this.channel.publish( exchangeName, exchangeKeys.DATA,
            Buffer.from( JSON.stringify( data ) ) );
    }
}
