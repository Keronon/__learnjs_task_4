
import * as req             from "supertest";
import { Test             } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule        } from '../../src/module/users.module';
import { User             } from "src/structs.core";

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

    it( `/login -> token of user | correct token`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .post( `/users/login` )
            .send( { email: 'email 1', password: 'password 1' } )
            .expect( 200 );

        admin_token = res1.body.token;
        expect( admin_token )
            .toBe( "string" );
    } );

    it( `-> All users`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .get( `/users` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        const users = res1.body;
        expect( users )
            .toBe( `Array` );
    } );

    it( `/users/cur -> User`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .get( `/users/cur` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        admin = res1.body;
        expect( admin )
            .toBe( `User` );
    } );

    it( `/users/:id -> User`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .delete( `/users/${admin.u_id}` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        admin = res1.body;
        expect( admin )
            .toBe( 'User' );
    } );
} );
