
const log = ( text: any ) => console.log( `${colours.fg.yellow}${text}${colours.reset}` );

// NestJS - elements
import { Body, Controller, Post, Get, Param, UseGuards, Headers } from '@nestjs/common';

// other elemenrts
import { colours } from '../console.colors';

// structs
import { User } from '../structs.core';

// services
import { AppService } from './users.service';

// decors
import { UsersGuard } from '../guards/users.guard';
import { Roles } from '../decorators/role.decorator';

// this controller >>

@Controller( 'users' )
export class AppController
{
    // services applyfying
    constructor ( private service: AppService ) { }

    // REQ login
    @Get(`/login`)
    Login ( @Body() data: User )
    {
        log(`  = > C-Users : login`);

        return this.service.Login( data );
    }

    // REQ get all users
    @UseGuards( UsersGuard )
    @Roles('admin')
    @Get()
    GetAll ()
    {
        log(`  = > C-Users : get all`);

        return this.service.GetUsers();
    }

    // REQ get current user
    @UseGuards( UsersGuard )
    @Get(`/cur`)
    GetCurrent ( @Headers (`Authorization`) authHeader )
    {
        log(`  = > C-Users : get current`);

        return this.service.GetUserCurrent( authHeader );
    }

    // REQ get user by id
    @UseGuards( UsersGuard )
    @Roles('admin')
    @Get(`/:id`)
    GetById ( @Param(`id`) u_id: number )
    {
        log(`  = > C-Users : get by id`);

        return this.service.GetUserById( u_id );
    }
}
