
import * as req             from "supertest";
import { Test             } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule        } from '../../src/module/profiles.module';

const host_users = `http://localhost:12121`;
const host_profiles = `http://localhost:12122`;
const reg_data =
{
    "user":
    {
        "u_email"   : "email test admin 1",
        "u_password": "password",
        "u_role"    : "admin"
    },
    "profile":
    {
        "p_surname" : "surname",
        "p_birthday": "01.01.2000",
        "p_gender"  : "M",
        "p_phone"   : "+12 (345) 666-99-69"
    }
};

describe ( `/profiles`, () =>
{
    let app: INestApplication;

    let admin_token;
    let admin_uid;
    let admin;

    beforeAll( async () =>
    {
        const moduleRef = await Test.createTestingModule( { imports: [AppModule] }).compile();

/* this can be used to override service functionality

    .overrideProvider(AppService)
    .useValue({ findAll: () => ['test'] })

 */
        app = moduleRef.createNestApplication();
        await app.init();
    } );

    afterAll( async () => { await app.close(); } );

    it( `/reg -> token of new user | correct token | new profile exists`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .post( `/profiles/reg` )
            .send( reg_data )
            .expect( 200 );

        admin_token = res1.body.token;
        expect( admin_token )
            .toBe( "string" );

        const res2 = await req( app.getHttpServer() )
            .get( `${host_users}/users/cur` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        admin_uid = res2.body;
        expect( admin_uid )
            .toBe( "number" );

        const res3 = await req( app.getHttpServer() )
            .get( `/profiles?u_id=${admin_uid}` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        admin = res3.body;
        expect( admin )
            .toBe( `Profile` );
    } );

    it( `/:id -> Profile`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .get( `/profiles/${admin.p_id}` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        const profile = res1.body;
        expect( profile )
            .toBe( `Profile` );
    } );

    it( `?u_id=# -> Profile`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .get( `/profiles?u_id=${admin_uid}` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        const profile = res1.body;
        expect( profile )
            .toBe( `Profile` );
    } );

    it( `/del -> true`, async () =>
    {
        const res1 = await req( app.getHttpServer() )
            .delete( `/profiles/${admin_uid}/del` )
            .set('Authorization', `Bearer ${admin_token}`)
            .expect( 200 );

        const isDel = res1.body;
        expect( isDel )
            .toBe( true );
    } );
} );
