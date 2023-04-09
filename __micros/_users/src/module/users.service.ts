
const log = console.log;

// other libs
import * as bcrypt from 'bcryptjs';

// own other elements
import { DB, QUERYes } from '../db.core';
import { Rabbit      } from '../rabbit.core';

// NestJS elements
import { Injectable, UnauthorizedException } from '@nestjs/common';

// structs
import { MsgData, Token, User } from '../structs.core';

// services
import { JwtService } from '@nestjs/jwt';

// this service >>

@Injectable()
export class AppService
{
    rabbit: Rabbit;

    // services applyfying
    constructor ( private jwtService: JwtService )
    {
        this.rabbit = new Rabbit;
        this.rabbit.Prepare().then( () =>
            this.rabbit.channel.consume( this.rabbit.queueCMDs.queue, ( msg ) =>
            {
                const data: MsgData = JSON.parse( msg.content.toString() ) ;

                try
                {
                    const deal: Promise<any> | any = this[ data.cmd ]( data.data );
                    const back = (res) =>
                    {
                        this.rabbit.Publish( { cmd: data.cmd, data: res } );
                        this.rabbit.channel.ack( msg );
                    };

                    if ( deal instanceof Promise ) deal.then( back );
                    else back( deal );
                }
                catch (ex)
                {
                    log(ex);
                    this.rabbit.Publish( { cmd: data.cmd, data: ex } );
                    this.rabbit.channel.ack( msg );
                }
            } )
        );
    }

    // authorize
    async Login ( data: User )
    {
        log(`  - > S-Users : login`);

        const user = await this.LoginValid( data ); // is user
        return this.GetToken( user );               // get authorize token
    }

    // is user
    private async LoginValid( data: User )
    {
        log(`  - > S-Users : valid`);

        // check data
        if ( !(('u_email'    in data) || ('u_login' in data)) ||
             !( 'u_password' in data)) throw new UnauthorizedException(`Need more data to login`);

        // serch user by email
        let user = await this.GetUserByUnic( data );

        // if user found
        if ( user )
        {
            // check password
            if ( await bcrypt.compare( data.u_password, user.u_password ) )
                return user;
            else
                throw new UnauthorizedException( { message: `Incorrect password` } );
        }
        throw new UnauthorizedException( { message: `Incorrect email` } );
    }

    // get authorize token
    async GetToken (user: User)
    {
        log(`  - > S-Users : get token`);

        const payload: Token = { u_id: user.u_id, u_email: user.u_email, u_role: user.u_role };
        return { token: this.jwtService.sign( payload ) }
    }

    // create new user
    async CreateUser (data: User)
    {
        log(`  - > S-Users : create user`);

        // create user
        let row: User = (await DB.query( QUERYes.INSERT<User>( `users`, data ) )).rows[0];
        return row;
    }

    // delete user
    async DeleteUser ( u_id: number )
    {
        log(`  - > S-Users : delete user`);

        await DB.query( QUERYes.DELETE( `users`, `u_id = ${u_id}` ) );
        return true;
    }

    // get current user
    async GetUserCurrent (authHeader)
    {
        log(`  - > S-Users : get current user`);

        const row: User = this.Verify(authHeader);
        return row;
    }

    // get all users
    async GetUsers ()
    {
        log(`  - > S-Users : get users`);

        const rows: User[] = (await DB.query( QUERYes.SELECT( `users` ) )).rows;
        return rows;
    }

    // get user by id
    async GetUserById (u_id: number)
    {
        log(`  - > S-Users : get user by id`);

        const row: User = (await DB.query( QUERYes.SELECT( `users`, `u_id = ${u_id}` ) )).rows[0];
        return row;
    }

    // get user by unic field
    async GetUserByUnic (data: User)
    {
        log(`  - > S-Users : get user by unic`);

        // check is unic and serch
        let row: User;
        if ( `u_login` in data )
            row = (await DB.query( QUERYes.SELECT( `users`, `u_login = '${data.u_login}'` ) )).rows[0];
        if ( `u_email` in data )
            row = (await DB.query( QUERYes.SELECT( `users`, `u_email = '${data.u_email}'` ) )).rows[0];

        if (!row) return row;
        return row;
    }

    // check user authentification
    Verify(authHeader): User
    {
        log(`  = > S-Users : verify`);

        const [ bearer, token ] = authHeader.split(' ');

        if ( bearer != 'Bearer' || !token )
        {
            throw new UnauthorizedException( { message: `Unathorized user` } );
        }

        return this.jwtService.verify( token );
    }
}
