
const log = ( text: any ) => console.log( `${colours.fg.yellow}${text}${colours.reset}` );

// NestJS - elements
import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';

// other elemenrts
import { colours } from 'src/console.colors';

// structs
import { User } from '../structs.core';

// services
import { AppService } from './users.service';

// decors
import { UsersGuard } from 'src/guards/users.guard';
import { Roles } from 'src/decorators/role.decorator';

// this controller >>

@Controller( 'users' )
export class AppController
{
    // services applyfying
    constructor ( private service: AppService ) { }

    // REQ login
    @Post(`/login`)
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
