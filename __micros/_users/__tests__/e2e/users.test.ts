
import * as req             from "supertest";
import { Test             } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule        } from '../../src/module/users.module';

describe ( `/users`, () =>
{
    let app: INestApplication;

    let admin_token;
    let admin;

    beforeAll( async () =>
    {
        const moduleRef = await Test.createTestingModule( { imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    } );

    afterAll( async () => { await app.close(); } );

    it( `/login -> token of user | correct token`, () =>
    {
        return req( app.getHttpServer() )
            .get( `/users/login` )
            .send( { u_email: 'email 1', u_password: 'password 1' } )
            .expect( (res: req.Response) =>
            {
                admin_token = res.body.token;

                expect( typeof admin_token )
                    .toBe( "string" );
            } )
            .expect( 200 );
    } );

    it( `. -> All users`, () =>
    {
        return req( app.getHttpServer() )
            .get( `/users` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( (res: req.Response) =>
            {
                expect( res.body instanceof Array )
                    .toBe( true );

                expect( res.body.length )
                    .toEqual( 2 );
            } )
            .expect( 200 );
    } );

    it( `/users/cur -> User`, () =>
    {
        return req( app.getHttpServer() )
            .get( `/users/cur` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( (res: req.Response) =>
            {
                admin = res.body;
                expect( isToken( admin ) )
                    .toBe( true );
            } )
            .expect( 200 );
    } );

    it( `/users/:id -> User`, () =>
    {
        return req( app.getHttpServer() )
            .get( `/users/${admin.u_id}` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( (res: req.Response) =>
            {
                expect( isUser( res.body ) )
                    .toBe( true );
            } )
            .expect( 200 );
    } );
} );

function isToken( obj: any )
{
    return `u_id`       in obj &&
           `u_email`    in obj &&
           `u_role`     in obj ;
}

function isUser( obj: any )
{
    return `u_id`       in obj &&
           `u_email`    in obj &&
           `u_role`     in obj &&
           `u_login`    in obj &&
           `u_password` in obj ;
}
