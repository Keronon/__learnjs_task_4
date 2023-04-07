
const log = console.log;

// NestJS - elements
import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

// other objects
import { Observable } from "rxjs";
import { Reflector  } from "@nestjs/core";

// structs
import { User } from "../structs.core";

// services
import { AppService } from "src/module/profiles.service";

// decors keys
import { ROLES_DECOR } from "../decorators/role.decorator";
import { SELF_DECOR  } from "../decorators/self.decorator";

@Injectable()
export class UsersGuard implements CanActivate
{
    constructor ( private reflector      : Reflector,
                  private profilesService: AppService ) {}

    // guard by users data
    async canActivate (context: ExecutionContext)
    {
        log(`  = > G-Users : can activate`);

        try
        {
            // get REQ data
            const req = context.switchToHttp().getRequest();

            // get self-decor
            const canSelf = this.reflector.getAllAndOverride<string[]>(SELF_DECOR, [
                context.getHandler(),
                context.getClass()
            ]);

            // check self
            if ( canSelf )
            {
                // check authorization
                const user: User = await this.Verify( req.headers.authorization );

                const u_id = req.params[`u_id`];
                if ( u_id && user.u_id === +u_id ) return true;
            }

            // get roles-decor
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_DECOR, [
                context.getHandler(),
                context.getClass()
            ]);

            if ( !requiredRoles ) return true;

            // check authorization
            const user: User = await this.Verify( req.headers.authorization );

            return requiredRoles.includes( user.u_role );
        }
        catch (e)
        {
            throw new ForbiddenException( `guarding by user data` );
        }
    }

    async Verify(authHeader)
    {
        log(`  = > G-Users : verify`);

        const [ bearer, token ] = authHeader.split(' ');

        if ( bearer != 'Bearer' || !token )
        {
            throw new UnauthorizedException( { message: `Unathorized user` } );
        }
        console.log(authHeader);
        this.profilesService.rabbit.Publish( { cmd: `Verify`, data: authHeader } );
        const res = await this.profilesService.rabbit.Get( 'data' );
        if ( (res.name as string).includes( `Exception` ) )
            throw res;

        return res;
    }
}