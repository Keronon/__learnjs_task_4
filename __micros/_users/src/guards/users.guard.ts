
const log = console.log;

// NestJS - elements
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

// other objects
import { Observable } from "rxjs";
import { Reflector  } from "@nestjs/core";

// services
import { AppService } from "src/module/users.service";

// decors keys
import { ROLES_DECOR } from "../decorators/role.decorator";
import { SELF_DECOR  } from "../decorators/self.decorator";

@Injectable()
export class UsersGuard implements CanActivate
{
    constructor ( private reflector : Reflector,
                  private usersService: AppService ) {}

    // guard by users data
    canActivate (context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
    {
        log(`  = > U > G-Users : can activate`);

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
                const user = this.usersService.Verify( req.headers.authorization );

                const u_id = req.params[`id`];
                if ( u_id && user.u_id === +u_id ) return true;
            }

            // get roles-decor
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_DECOR, [
                context.getHandler(),
                context.getClass()
            ]);

            if ( !requiredRoles ) return true;

            // check authorization
            const user = this.usersService.Verify( req.headers.authorization );

            return requiredRoles.includes( user.u_role );
        }
        catch (e)
        {
            throw new ForbiddenException( `guarding by user data` );
        }
    }
}