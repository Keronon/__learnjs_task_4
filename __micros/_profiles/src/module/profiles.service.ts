
const log = console.log;

// other libs
import * as bcrypt from 'bcryptjs';

// other elements
import { DB, QUERYes } from '../db.core';
import { Rabbit      } from '../rabbit.core';

// NestJS elements
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';

// structs
import { Profile, Registrate, Token, User } from '../structs.core';

// this service ->>

@Injectable()
export class AppService
{
    rabbit: Rabbit;

    // services applyfying
    constructor ()
    {
        this.rabbit = new Rabbit;
        this.rabbit.Prepare();
    }

    // registrate account ( user + profile )
    async RegistrateAccount ( data: Registrate )
    {
        log(`  - > S-Profiles : registrate account`);

        // check data
        if ( !('p_surname'  in data.profile) ||
             !('p_birthday' in data.profile) ||
             !('p_gender'   in data.profile) ||
             !('u_email'    in data.user   ) ||
             !('u_password' in data.user   )) throw new BadRequestException(`Need more data to registrate account`);

        let { user, profile } = data;

        // check is user
        this.rabbit.Publish( { cmd: `GetUserByUnic`, data: user } );
        const row: User = await this.rabbit.Get( `GetUserByUnic` );
        if ( row ) throw new HttpException ( `This email already in use`, HttpStatus.BAD_REQUEST );

        // create user
        user.u_password = await bcrypt.hash(user.u_password, 8);

        this.rabbit.Publish( { cmd: `CreateUser`, data: user } );
        user = await this.rabbit.Get( `CreateUser` );
        if ( !user ) throw new InternalServerErrorException( `Can not create user. Try again later` );

        // create profile
        profile.p_id_user = user.u_id;
        profile = (await DB.query( QUERYes.INSERT<Profile>( `profiles`, profile ) )).rows[0];

        // get authorization token
        this.rabbit.Publish( { cmd: `GetToken`, data: user } );
        let token: { token: string } = await this.rabbit.Get( `GetToken` );
        return token;
    }

    // delete account ( user + profile )
    async DeleteAccount ( p_id: number )
    {
        log(`  - > S-Profiles : delete account`);

        // check is user
        const row = await this.GetProfileById( p_id );
        if ( !row ) throw new HttpException ( `There is no profile with used id`, HttpStatus.BAD_REQUEST );

        // delete user
        this.rabbit.Publish( { cmd: `DeleteUser`, data: row.p_id_user } );

        await DB.query( QUERYes.DELETE( `profiles`, `p_id = ${p_id}` ) );
        return true;
    }

    // get profile by id
    async GetProfileById ( p_id: number )
    {
        log(`  - > S-Profiles : get profile by id`);

        let profile: Profile = (await DB.query( QUERYes.SELECT( `profiles`, `p_id = ${p_id}` ) )).rows[0];
        return profile;
    }

    // get profile by user id
    async GetProfileByUId ( u_id: number )
    {
        log(`  - > S-Profiles : get profile by id`);

        let profile: Profile = (await DB.query( QUERYes.SELECT( `profiles`, `p_id_user = ${u_id}` ) )).rows[0];
        return profile;
    }
}
