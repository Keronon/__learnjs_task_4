
const log = ( text: any ) => console.log(  `${colours.fg.yellow}${text}${colours.reset}` );

// other elements
import { colours    } from '../console.colors';
import { Registrate } from '../structs.core';

// NestJS elements
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

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
        log(`  = > C-Profiles : registrate`);

        return this.service.RegistrateAccount( data );
    }

    // REQ delete account
    @UseGuards( UsersGuard )
    @Self()
    @Roles('admin')
    @Post(`/:id/del`)
    Delete ( @Param(`id`) p_id: number )
    {
        log(`  = > C-Profiles : delete`);

        return this.service.DeleteAccount( p_id );
    }

    // REQ get account by id
    @UseGuards( UsersGuard )
    @Roles('admin')
    @Get(`/:id`)
    GetById ( @Param(`id`) p_id: number )
    {
        log(`  = > C-Profiles : get by id`);

        return this.service.GetProfileById( p_id );
    }
}
