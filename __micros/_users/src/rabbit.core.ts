
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
    public  channel  : amqp.Channel;
    public  queueCMDs: amqp.Replies.AssertQueue;
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

    async Publish( data: MsgData )
    {
        log(`  - > Rabbit : publish`);

        // creating data queue
        this.queueDATA = await this.channel.assertQueue( `DATA`, this.options );
        await this.channel.bindQueue( this.queueDATA.queue, exchangeName, exchangeKeys.DATA );

        this.channel.publish( exchangeName, exchangeKeys.DATA,
            Buffer.from( JSON.stringify( data ) ) );
    }
}
