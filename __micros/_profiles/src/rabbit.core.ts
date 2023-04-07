
const log = ( text: any ) => console.log(  `${colours.fg.blue}${text}${colours.reset}` );

import * as amqp from 'amqplib';
import { colours } from './console.colors';

// structs
import { MsgData } from './structs.core';

const exchangeName  = `profiles - users`;
const exchangeKeys  = { CMDs: `cmd`, DATA: `data` };
const exchangeTypes = { ByKEY: undefined, ByBindKEY: 'direct', ToALL: 'fanout', HEADERS: 'headers', ByFILTER: 'topic' };

export class Rabbit
{
    private channel  : amqp.Channel;
    private queueCMDs: amqp.Replies.AssertQueue;
    private queueDATA: amqp.Replies.AssertQueue;
    private readonly options: amqp.Options.AssertQueue = { expires: 5000 };

    // initializing of rabbit service objects
    async Prepare()
    {
        log(`  - > Rabbit : prepare`);

        // connecting to rabbit
        this.channel = await ( await amqp.connect(`amqp://localhost`) ).createChannel();
        await this.channel.assertExchange( exchangeName, exchangeTypes.ByKEY );

        // creating commands queue
        this.queueCMDs = await this.channel.assertQueue( `CMDs`, this.options );
        await this.channel.bindQueue( this.queueCMDs.queue, exchangeName, exchangeKeys.CMDs );
    }

    Publish( data: MsgData )
    {
        log(`  - > Rabbit : publish`);

        this.channel.publish( exchangeName, exchangeKeys.CMDs,
            Buffer.from( JSON.stringify( data ) ) );
    }

    async Get( cmd: string )
    {
        log(`  - > Rabbit : consume`);

        // creating data queue
        this.queueDATA = await this.channel.assertQueue( `DATA`, this.options );
        await this.channel.bindQueue( this.queueDATA.queue, exchangeName, exchangeKeys.DATA );

        let msg: amqp.GetMessage | boolean;

        while ( !msg )
        {
            msg = await this.channel.get( this.queueDATA.queue );
        }

        msg = msg as amqp.GetMessage;
        const data: MsgData = JSON.parse( ( msg.content.toString() ) );
        if ( data.cmd === cmd ) this.channel.ack( msg );

        return data.data;
    }
}
