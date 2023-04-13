
const log = ( data: any ) => console.log( colors.fg.yellow, ` = > C-Profiles :`, data, colors.reset );

// other elements
import { colors    } from '../console.colors';
import { Registrate } from '../structs.core';

// NestJS elements
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

// services
import { AppService } from './profiles.service';

// decors
import { Roles      } from '../decorators/role.decorator';
import { Self       } from '../decorators/self.decorator';
import { UsersGuard } from '../guards/users.guard';

// this controller >>

@Controller('profiles')
export class AppController
{
    // services applyfying
    constructor ( private service: AppService ) { }

    // REQ registrate account
    @Post(`/reg`)
    Registrate ( @Body() data: Registrate )
    {
        log(`registrate`);

        return this.service.RegistrateAccount( data );
    }

    // REQ delete account
    @UseGuards( UsersGuard )
    @Self()
    @Roles('admin')
    @Delete(`/:id/del`)
    Delete ( @Param(`id`) p_id: number )
    {
        log(`delete`);

        return this.service.DeleteAccount( p_id );
    }

    // REQ get profile by id
    @UseGuards( UsersGuard )
    @Self()
    @Roles('admin')
    @Get(`/:id`)
    GetById ( @Param(`id`) p_id: number )
    {
        log(`get by id`);

        return this.service.GetProfileById( p_id );
    }

    // REQ get profile by uid
    @UseGuards( UsersGuard )
    @Self()
    @Roles('admin')
    @Get()
    GetByUId ( @Query( `u_id` ) u_id: number )
    {
        log(`get by uid`);

        return this.service.GetProfileByUId( u_id );
    }
}
