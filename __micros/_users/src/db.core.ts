
const log = console.log;

// other elements
import { ConfigModule } from "@nestjs/config";
import { Pool         } from "pg";

// load .env data
ConfigModule.forRoot( { envFilePath: `.env` } )

// DB controller
export const DB = new Pool( {
    host:      process.env.PG_HOST,
    port:     +process.env.PG_PORT,
    user:      process.env.PG_USER,
    password:  process.env.PG_PASS,
    database:  process.env.PG_DB
} );

// queries generator
export const QUERYes =
{
    INSERT: function<T>( table: string, data: T )
    {
        log(`  - > DB : INSERT`);

        return ` INSERT INTO ${ table } ( ${ Object.keys(data).join(`, `) } ) VALUES (
            ${ Object.values(data).map( (v) => typeof(v) === 'string' ? `'${v}'` : v ).join( `, ` ) } ) RETURNING *; `;
    },

    UPDATE: function( table: string, data: [string, any][], condition: string )
    {
        log(`  - > DB : UPDATE`);

        return ` UPDATE ${ table } SET ${ data.map( (v) => `${v[0]} = ` + (typeof(v[1]) === 'string' ? `'${v[1]}'` : v[1]) ).join( `, ` ) }
            WHERE ${ condition } RETURNING *; `;
    },

    DELETE: function(table: string, condition: string)
    {
        log(`  - > DB : DELETE`);

        return ` DELETE FROM ${ table } WHERE ${ condition } RETURNING *; `;
    },

    SELECT: function(table: string, condition?: string)
    {
        log(`  - > DB : SELECT`);

        let query = ` SELECT * FROM ${ table } `;
        if ( condition && condition.length > 3 ) query += ` WHERE ${ condition } `;

        return query + ` ; `;
    }
};
