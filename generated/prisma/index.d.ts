
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Anime
 * 
 */
export type Anime = $Result.DefaultSelection<Prisma.$AnimePayload>
/**
 * Model AnimeGenre
 * 
 */
export type AnimeGenre = $Result.DefaultSelection<Prisma.$AnimeGenrePayload>
/**
 * Model AnimeTag
 * 
 */
export type AnimeTag = $Result.DefaultSelection<Prisma.$AnimeTagPayload>
/**
 * Model AnimeRelation
 * 
 */
export type AnimeRelation = $Result.DefaultSelection<Prisma.$AnimeRelationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Anime
 * const anime = await prisma.anime.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Anime
   * const anime = await prisma.anime.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.anime`: Exposes CRUD operations for the **Anime** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Anime
    * const anime = await prisma.anime.findMany()
    * ```
    */
  get anime(): Prisma.AnimeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.animeGenre`: Exposes CRUD operations for the **AnimeGenre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnimeGenres
    * const animeGenres = await prisma.animeGenre.findMany()
    * ```
    */
  get animeGenre(): Prisma.AnimeGenreDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.animeTag`: Exposes CRUD operations for the **AnimeTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnimeTags
    * const animeTags = await prisma.animeTag.findMany()
    * ```
    */
  get animeTag(): Prisma.AnimeTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.animeRelation`: Exposes CRUD operations for the **AnimeRelation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AnimeRelations
    * const animeRelations = await prisma.animeRelation.findMany()
    * ```
    */
  get animeRelation(): Prisma.AnimeRelationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Anime: 'Anime',
    AnimeGenre: 'AnimeGenre',
    AnimeTag: 'AnimeTag',
    AnimeRelation: 'AnimeRelation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "anime" | "animeGenre" | "animeTag" | "animeRelation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Anime: {
        payload: Prisma.$AnimePayload<ExtArgs>
        fields: Prisma.AnimeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnimeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnimeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          findFirst: {
            args: Prisma.AnimeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnimeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          findMany: {
            args: Prisma.AnimeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>[]
          }
          create: {
            args: Prisma.AnimeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          createMany: {
            args: Prisma.AnimeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnimeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>[]
          }
          delete: {
            args: Prisma.AnimeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          update: {
            args: Prisma.AnimeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          deleteMany: {
            args: Prisma.AnimeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnimeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnimeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>[]
          }
          upsert: {
            args: Prisma.AnimeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimePayload>
          }
          aggregate: {
            args: Prisma.AnimeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnime>
          }
          groupBy: {
            args: Prisma.AnimeGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnimeGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnimeCountArgs<ExtArgs>
            result: $Utils.Optional<AnimeCountAggregateOutputType> | number
          }
        }
      }
      AnimeGenre: {
        payload: Prisma.$AnimeGenrePayload<ExtArgs>
        fields: Prisma.AnimeGenreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnimeGenreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnimeGenreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          findFirst: {
            args: Prisma.AnimeGenreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnimeGenreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          findMany: {
            args: Prisma.AnimeGenreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>[]
          }
          create: {
            args: Prisma.AnimeGenreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          createMany: {
            args: Prisma.AnimeGenreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnimeGenreCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>[]
          }
          delete: {
            args: Prisma.AnimeGenreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          update: {
            args: Prisma.AnimeGenreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          deleteMany: {
            args: Prisma.AnimeGenreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnimeGenreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnimeGenreUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>[]
          }
          upsert: {
            args: Prisma.AnimeGenreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeGenrePayload>
          }
          aggregate: {
            args: Prisma.AnimeGenreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnimeGenre>
          }
          groupBy: {
            args: Prisma.AnimeGenreGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnimeGenreGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnimeGenreCountArgs<ExtArgs>
            result: $Utils.Optional<AnimeGenreCountAggregateOutputType> | number
          }
        }
      }
      AnimeTag: {
        payload: Prisma.$AnimeTagPayload<ExtArgs>
        fields: Prisma.AnimeTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnimeTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnimeTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          findFirst: {
            args: Prisma.AnimeTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnimeTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          findMany: {
            args: Prisma.AnimeTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>[]
          }
          create: {
            args: Prisma.AnimeTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          createMany: {
            args: Prisma.AnimeTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnimeTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>[]
          }
          delete: {
            args: Prisma.AnimeTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          update: {
            args: Prisma.AnimeTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          deleteMany: {
            args: Prisma.AnimeTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnimeTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnimeTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>[]
          }
          upsert: {
            args: Prisma.AnimeTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeTagPayload>
          }
          aggregate: {
            args: Prisma.AnimeTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnimeTag>
          }
          groupBy: {
            args: Prisma.AnimeTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnimeTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnimeTagCountArgs<ExtArgs>
            result: $Utils.Optional<AnimeTagCountAggregateOutputType> | number
          }
        }
      }
      AnimeRelation: {
        payload: Prisma.$AnimeRelationPayload<ExtArgs>
        fields: Prisma.AnimeRelationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnimeRelationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnimeRelationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          findFirst: {
            args: Prisma.AnimeRelationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnimeRelationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          findMany: {
            args: Prisma.AnimeRelationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>[]
          }
          create: {
            args: Prisma.AnimeRelationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          createMany: {
            args: Prisma.AnimeRelationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnimeRelationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>[]
          }
          delete: {
            args: Prisma.AnimeRelationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          update: {
            args: Prisma.AnimeRelationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          deleteMany: {
            args: Prisma.AnimeRelationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnimeRelationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnimeRelationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>[]
          }
          upsert: {
            args: Prisma.AnimeRelationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnimeRelationPayload>
          }
          aggregate: {
            args: Prisma.AnimeRelationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnimeRelation>
          }
          groupBy: {
            args: Prisma.AnimeRelationGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnimeRelationGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnimeRelationCountArgs<ExtArgs>
            result: $Utils.Optional<AnimeRelationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    anime?: AnimeOmit
    animeGenre?: AnimeGenreOmit
    animeTag?: AnimeTagOmit
    animeRelation?: AnimeRelationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AnimeCountOutputType
   */

  export type AnimeCountOutputType = {
    relationsTo: number
    relationsFrom: number
    genres: number
    tags: number
  }

  export type AnimeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    relationsTo?: boolean | AnimeCountOutputTypeCountRelationsToArgs
    relationsFrom?: boolean | AnimeCountOutputTypeCountRelationsFromArgs
    genres?: boolean | AnimeCountOutputTypeCountGenresArgs
    tags?: boolean | AnimeCountOutputTypeCountTagsArgs
  }

  // Custom InputTypes
  /**
   * AnimeCountOutputType without action
   */
  export type AnimeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeCountOutputType
     */
    select?: AnimeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AnimeCountOutputType without action
   */
  export type AnimeCountOutputTypeCountRelationsToArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeRelationWhereInput
  }

  /**
   * AnimeCountOutputType without action
   */
  export type AnimeCountOutputTypeCountRelationsFromArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeRelationWhereInput
  }

  /**
   * AnimeCountOutputType without action
   */
  export type AnimeCountOutputTypeCountGenresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeGenreWhereInput
  }

  /**
   * AnimeCountOutputType without action
   */
  export type AnimeCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeTagWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Anime
   */

  export type AggregateAnime = {
    _count: AnimeCountAggregateOutputType | null
    _avg: AnimeAvgAggregateOutputType | null
    _sum: AnimeSumAggregateOutputType | null
    _min: AnimeMinAggregateOutputType | null
    _max: AnimeMaxAggregateOutputType | null
  }

  export type AnimeAvgAggregateOutputType = {
    id: number | null
  }

  export type AnimeSumAggregateOutputType = {
    id: number | null
  }

  export type AnimeMinAggregateOutputType = {
    id: number | null
    titleEn: string | null
    titleRo: string | null
    cover: string | null
    format: string | null
    createdAt: Date | null
    updatedAt: Date | null
    dataHash: string | null
  }

  export type AnimeMaxAggregateOutputType = {
    id: number | null
    titleEn: string | null
    titleRo: string | null
    cover: string | null
    format: string | null
    createdAt: Date | null
    updatedAt: Date | null
    dataHash: string | null
  }

  export type AnimeCountAggregateOutputType = {
    id: number
    titleEn: number
    titleRo: number
    cover: number
    format: number
    createdAt: number
    updatedAt: number
    dataHash: number
    _all: number
  }


  export type AnimeAvgAggregateInputType = {
    id?: true
  }

  export type AnimeSumAggregateInputType = {
    id?: true
  }

  export type AnimeMinAggregateInputType = {
    id?: true
    titleEn?: true
    titleRo?: true
    cover?: true
    format?: true
    createdAt?: true
    updatedAt?: true
    dataHash?: true
  }

  export type AnimeMaxAggregateInputType = {
    id?: true
    titleEn?: true
    titleRo?: true
    cover?: true
    format?: true
    createdAt?: true
    updatedAt?: true
    dataHash?: true
  }

  export type AnimeCountAggregateInputType = {
    id?: true
    titleEn?: true
    titleRo?: true
    cover?: true
    format?: true
    createdAt?: true
    updatedAt?: true
    dataHash?: true
    _all?: true
  }

  export type AnimeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Anime to aggregate.
     */
    where?: AnimeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anime to fetch.
     */
    orderBy?: AnimeOrderByWithRelationInput | AnimeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnimeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anime from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anime.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Anime
    **/
    _count?: true | AnimeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnimeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnimeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnimeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnimeMaxAggregateInputType
  }

  export type GetAnimeAggregateType<T extends AnimeAggregateArgs> = {
        [P in keyof T & keyof AggregateAnime]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnime[P]>
      : GetScalarType<T[P], AggregateAnime[P]>
  }




  export type AnimeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeWhereInput
    orderBy?: AnimeOrderByWithAggregationInput | AnimeOrderByWithAggregationInput[]
    by: AnimeScalarFieldEnum[] | AnimeScalarFieldEnum
    having?: AnimeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnimeCountAggregateInputType | true
    _avg?: AnimeAvgAggregateInputType
    _sum?: AnimeSumAggregateInputType
    _min?: AnimeMinAggregateInputType
    _max?: AnimeMaxAggregateInputType
  }

  export type AnimeGroupByOutputType = {
    id: number
    titleEn: string | null
    titleRo: string | null
    cover: string | null
    format: string | null
    createdAt: Date
    updatedAt: Date
    dataHash: string | null
    _count: AnimeCountAggregateOutputType | null
    _avg: AnimeAvgAggregateOutputType | null
    _sum: AnimeSumAggregateOutputType | null
    _min: AnimeMinAggregateOutputType | null
    _max: AnimeMaxAggregateOutputType | null
  }

  type GetAnimeGroupByPayload<T extends AnimeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnimeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnimeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnimeGroupByOutputType[P]>
            : GetScalarType<T[P], AnimeGroupByOutputType[P]>
        }
      >
    >


  export type AnimeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titleEn?: boolean
    titleRo?: boolean
    cover?: boolean
    format?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataHash?: boolean
    relationsTo?: boolean | Anime$relationsToArgs<ExtArgs>
    relationsFrom?: boolean | Anime$relationsFromArgs<ExtArgs>
    genres?: boolean | Anime$genresArgs<ExtArgs>
    tags?: boolean | Anime$tagsArgs<ExtArgs>
    _count?: boolean | AnimeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["anime"]>

  export type AnimeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titleEn?: boolean
    titleRo?: boolean
    cover?: boolean
    format?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataHash?: boolean
  }, ExtArgs["result"]["anime"]>

  export type AnimeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titleEn?: boolean
    titleRo?: boolean
    cover?: boolean
    format?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataHash?: boolean
  }, ExtArgs["result"]["anime"]>

  export type AnimeSelectScalar = {
    id?: boolean
    titleEn?: boolean
    titleRo?: boolean
    cover?: boolean
    format?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    dataHash?: boolean
  }

  export type AnimeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titleEn" | "titleRo" | "cover" | "format" | "createdAt" | "updatedAt" | "dataHash", ExtArgs["result"]["anime"]>
  export type AnimeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    relationsTo?: boolean | Anime$relationsToArgs<ExtArgs>
    relationsFrom?: boolean | Anime$relationsFromArgs<ExtArgs>
    genres?: boolean | Anime$genresArgs<ExtArgs>
    tags?: boolean | Anime$tagsArgs<ExtArgs>
    _count?: boolean | AnimeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AnimeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AnimeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AnimePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Anime"
    objects: {
      relationsTo: Prisma.$AnimeRelationPayload<ExtArgs>[]
      relationsFrom: Prisma.$AnimeRelationPayload<ExtArgs>[]
      genres: Prisma.$AnimeGenrePayload<ExtArgs>[]
      tags: Prisma.$AnimeTagPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      titleEn: string | null
      titleRo: string | null
      cover: string | null
      format: string | null
      createdAt: Date
      updatedAt: Date
      dataHash: string | null
    }, ExtArgs["result"]["anime"]>
    composites: {}
  }

  type AnimeGetPayload<S extends boolean | null | undefined | AnimeDefaultArgs> = $Result.GetResult<Prisma.$AnimePayload, S>

  type AnimeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnimeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnimeCountAggregateInputType | true
    }

  export interface AnimeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Anime'], meta: { name: 'Anime' } }
    /**
     * Find zero or one Anime that matches the filter.
     * @param {AnimeFindUniqueArgs} args - Arguments to find a Anime
     * @example
     * // Get one Anime
     * const anime = await prisma.anime.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnimeFindUniqueArgs>(args: SelectSubset<T, AnimeFindUniqueArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Anime that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnimeFindUniqueOrThrowArgs} args - Arguments to find a Anime
     * @example
     * // Get one Anime
     * const anime = await prisma.anime.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnimeFindUniqueOrThrowArgs>(args: SelectSubset<T, AnimeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Anime that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeFindFirstArgs} args - Arguments to find a Anime
     * @example
     * // Get one Anime
     * const anime = await prisma.anime.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnimeFindFirstArgs>(args?: SelectSubset<T, AnimeFindFirstArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Anime that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeFindFirstOrThrowArgs} args - Arguments to find a Anime
     * @example
     * // Get one Anime
     * const anime = await prisma.anime.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnimeFindFirstOrThrowArgs>(args?: SelectSubset<T, AnimeFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Anime that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Anime
     * const anime = await prisma.anime.findMany()
     * 
     * // Get first 10 Anime
     * const anime = await prisma.anime.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const animeWithIdOnly = await prisma.anime.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnimeFindManyArgs>(args?: SelectSubset<T, AnimeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Anime.
     * @param {AnimeCreateArgs} args - Arguments to create a Anime.
     * @example
     * // Create one Anime
     * const Anime = await prisma.anime.create({
     *   data: {
     *     // ... data to create a Anime
     *   }
     * })
     * 
     */
    create<T extends AnimeCreateArgs>(args: SelectSubset<T, AnimeCreateArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Anime.
     * @param {AnimeCreateManyArgs} args - Arguments to create many Anime.
     * @example
     * // Create many Anime
     * const anime = await prisma.anime.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnimeCreateManyArgs>(args?: SelectSubset<T, AnimeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Anime and returns the data saved in the database.
     * @param {AnimeCreateManyAndReturnArgs} args - Arguments to create many Anime.
     * @example
     * // Create many Anime
     * const anime = await prisma.anime.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Anime and only return the `id`
     * const animeWithIdOnly = await prisma.anime.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnimeCreateManyAndReturnArgs>(args?: SelectSubset<T, AnimeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Anime.
     * @param {AnimeDeleteArgs} args - Arguments to delete one Anime.
     * @example
     * // Delete one Anime
     * const Anime = await prisma.anime.delete({
     *   where: {
     *     // ... filter to delete one Anime
     *   }
     * })
     * 
     */
    delete<T extends AnimeDeleteArgs>(args: SelectSubset<T, AnimeDeleteArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Anime.
     * @param {AnimeUpdateArgs} args - Arguments to update one Anime.
     * @example
     * // Update one Anime
     * const anime = await prisma.anime.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnimeUpdateArgs>(args: SelectSubset<T, AnimeUpdateArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Anime.
     * @param {AnimeDeleteManyArgs} args - Arguments to filter Anime to delete.
     * @example
     * // Delete a few Anime
     * const { count } = await prisma.anime.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnimeDeleteManyArgs>(args?: SelectSubset<T, AnimeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Anime.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Anime
     * const anime = await prisma.anime.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnimeUpdateManyArgs>(args: SelectSubset<T, AnimeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Anime and returns the data updated in the database.
     * @param {AnimeUpdateManyAndReturnArgs} args - Arguments to update many Anime.
     * @example
     * // Update many Anime
     * const anime = await prisma.anime.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Anime and only return the `id`
     * const animeWithIdOnly = await prisma.anime.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnimeUpdateManyAndReturnArgs>(args: SelectSubset<T, AnimeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Anime.
     * @param {AnimeUpsertArgs} args - Arguments to update or create a Anime.
     * @example
     * // Update or create a Anime
     * const anime = await prisma.anime.upsert({
     *   create: {
     *     // ... data to create a Anime
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Anime we want to update
     *   }
     * })
     */
    upsert<T extends AnimeUpsertArgs>(args: SelectSubset<T, AnimeUpsertArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Anime.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeCountArgs} args - Arguments to filter Anime to count.
     * @example
     * // Count the number of Anime
     * const count = await prisma.anime.count({
     *   where: {
     *     // ... the filter for the Anime we want to count
     *   }
     * })
    **/
    count<T extends AnimeCountArgs>(
      args?: Subset<T, AnimeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnimeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Anime.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnimeAggregateArgs>(args: Subset<T, AnimeAggregateArgs>): Prisma.PrismaPromise<GetAnimeAggregateType<T>>

    /**
     * Group by Anime.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnimeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnimeGroupByArgs['orderBy'] }
        : { orderBy?: AnimeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnimeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnimeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Anime model
   */
  readonly fields: AnimeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Anime.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnimeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    relationsTo<T extends Anime$relationsToArgs<ExtArgs> = {}>(args?: Subset<T, Anime$relationsToArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    relationsFrom<T extends Anime$relationsFromArgs<ExtArgs> = {}>(args?: Subset<T, Anime$relationsFromArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    genres<T extends Anime$genresArgs<ExtArgs> = {}>(args?: Subset<T, Anime$genresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tags<T extends Anime$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Anime$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Anime model
   */
  interface AnimeFieldRefs {
    readonly id: FieldRef<"Anime", 'Int'>
    readonly titleEn: FieldRef<"Anime", 'String'>
    readonly titleRo: FieldRef<"Anime", 'String'>
    readonly cover: FieldRef<"Anime", 'String'>
    readonly format: FieldRef<"Anime", 'String'>
    readonly createdAt: FieldRef<"Anime", 'DateTime'>
    readonly updatedAt: FieldRef<"Anime", 'DateTime'>
    readonly dataHash: FieldRef<"Anime", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Anime findUnique
   */
  export type AnimeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter, which Anime to fetch.
     */
    where: AnimeWhereUniqueInput
  }

  /**
   * Anime findUniqueOrThrow
   */
  export type AnimeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter, which Anime to fetch.
     */
    where: AnimeWhereUniqueInput
  }

  /**
   * Anime findFirst
   */
  export type AnimeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter, which Anime to fetch.
     */
    where?: AnimeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anime to fetch.
     */
    orderBy?: AnimeOrderByWithRelationInput | AnimeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Anime.
     */
    cursor?: AnimeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anime from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anime.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Anime.
     */
    distinct?: AnimeScalarFieldEnum | AnimeScalarFieldEnum[]
  }

  /**
   * Anime findFirstOrThrow
   */
  export type AnimeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter, which Anime to fetch.
     */
    where?: AnimeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anime to fetch.
     */
    orderBy?: AnimeOrderByWithRelationInput | AnimeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Anime.
     */
    cursor?: AnimeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anime from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anime.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Anime.
     */
    distinct?: AnimeScalarFieldEnum | AnimeScalarFieldEnum[]
  }

  /**
   * Anime findMany
   */
  export type AnimeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter, which Anime to fetch.
     */
    where?: AnimeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Anime to fetch.
     */
    orderBy?: AnimeOrderByWithRelationInput | AnimeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Anime.
     */
    cursor?: AnimeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Anime from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Anime.
     */
    skip?: number
    distinct?: AnimeScalarFieldEnum | AnimeScalarFieldEnum[]
  }

  /**
   * Anime create
   */
  export type AnimeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * The data needed to create a Anime.
     */
    data: XOR<AnimeCreateInput, AnimeUncheckedCreateInput>
  }

  /**
   * Anime createMany
   */
  export type AnimeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Anime.
     */
    data: AnimeCreateManyInput | AnimeCreateManyInput[]
  }

  /**
   * Anime createManyAndReturn
   */
  export type AnimeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * The data used to create many Anime.
     */
    data: AnimeCreateManyInput | AnimeCreateManyInput[]
  }

  /**
   * Anime update
   */
  export type AnimeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * The data needed to update a Anime.
     */
    data: XOR<AnimeUpdateInput, AnimeUncheckedUpdateInput>
    /**
     * Choose, which Anime to update.
     */
    where: AnimeWhereUniqueInput
  }

  /**
   * Anime updateMany
   */
  export type AnimeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Anime.
     */
    data: XOR<AnimeUpdateManyMutationInput, AnimeUncheckedUpdateManyInput>
    /**
     * Filter which Anime to update
     */
    where?: AnimeWhereInput
    /**
     * Limit how many Anime to update.
     */
    limit?: number
  }

  /**
   * Anime updateManyAndReturn
   */
  export type AnimeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * The data used to update Anime.
     */
    data: XOR<AnimeUpdateManyMutationInput, AnimeUncheckedUpdateManyInput>
    /**
     * Filter which Anime to update
     */
    where?: AnimeWhereInput
    /**
     * Limit how many Anime to update.
     */
    limit?: number
  }

  /**
   * Anime upsert
   */
  export type AnimeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * The filter to search for the Anime to update in case it exists.
     */
    where: AnimeWhereUniqueInput
    /**
     * In case the Anime found by the `where` argument doesn't exist, create a new Anime with this data.
     */
    create: XOR<AnimeCreateInput, AnimeUncheckedCreateInput>
    /**
     * In case the Anime was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnimeUpdateInput, AnimeUncheckedUpdateInput>
  }

  /**
   * Anime delete
   */
  export type AnimeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
    /**
     * Filter which Anime to delete.
     */
    where: AnimeWhereUniqueInput
  }

  /**
   * Anime deleteMany
   */
  export type AnimeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Anime to delete
     */
    where?: AnimeWhereInput
    /**
     * Limit how many Anime to delete.
     */
    limit?: number
  }

  /**
   * Anime.relationsTo
   */
  export type Anime$relationsToArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    where?: AnimeRelationWhereInput
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    cursor?: AnimeRelationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnimeRelationScalarFieldEnum | AnimeRelationScalarFieldEnum[]
  }

  /**
   * Anime.relationsFrom
   */
  export type Anime$relationsFromArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    where?: AnimeRelationWhereInput
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    cursor?: AnimeRelationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnimeRelationScalarFieldEnum | AnimeRelationScalarFieldEnum[]
  }

  /**
   * Anime.genres
   */
  export type Anime$genresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    where?: AnimeGenreWhereInput
    orderBy?: AnimeGenreOrderByWithRelationInput | AnimeGenreOrderByWithRelationInput[]
    cursor?: AnimeGenreWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnimeGenreScalarFieldEnum | AnimeGenreScalarFieldEnum[]
  }

  /**
   * Anime.tags
   */
  export type Anime$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    where?: AnimeTagWhereInput
    orderBy?: AnimeTagOrderByWithRelationInput | AnimeTagOrderByWithRelationInput[]
    cursor?: AnimeTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnimeTagScalarFieldEnum | AnimeTagScalarFieldEnum[]
  }

  /**
   * Anime without action
   */
  export type AnimeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Anime
     */
    select?: AnimeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Anime
     */
    omit?: AnimeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeInclude<ExtArgs> | null
  }


  /**
   * Model AnimeGenre
   */

  export type AggregateAnimeGenre = {
    _count: AnimeGenreCountAggregateOutputType | null
    _avg: AnimeGenreAvgAggregateOutputType | null
    _sum: AnimeGenreSumAggregateOutputType | null
    _min: AnimeGenreMinAggregateOutputType | null
    _max: AnimeGenreMaxAggregateOutputType | null
  }

  export type AnimeGenreAvgAggregateOutputType = {
    id: number | null
    animeId: number | null
  }

  export type AnimeGenreSumAggregateOutputType = {
    id: number | null
    animeId: number | null
  }

  export type AnimeGenreMinAggregateOutputType = {
    id: number | null
    animeId: number | null
    name: string | null
  }

  export type AnimeGenreMaxAggregateOutputType = {
    id: number | null
    animeId: number | null
    name: string | null
  }

  export type AnimeGenreCountAggregateOutputType = {
    id: number
    animeId: number
    name: number
    _all: number
  }


  export type AnimeGenreAvgAggregateInputType = {
    id?: true
    animeId?: true
  }

  export type AnimeGenreSumAggregateInputType = {
    id?: true
    animeId?: true
  }

  export type AnimeGenreMinAggregateInputType = {
    id?: true
    animeId?: true
    name?: true
  }

  export type AnimeGenreMaxAggregateInputType = {
    id?: true
    animeId?: true
    name?: true
  }

  export type AnimeGenreCountAggregateInputType = {
    id?: true
    animeId?: true
    name?: true
    _all?: true
  }

  export type AnimeGenreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeGenre to aggregate.
     */
    where?: AnimeGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeGenres to fetch.
     */
    orderBy?: AnimeGenreOrderByWithRelationInput | AnimeGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnimeGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnimeGenres
    **/
    _count?: true | AnimeGenreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnimeGenreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnimeGenreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnimeGenreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnimeGenreMaxAggregateInputType
  }

  export type GetAnimeGenreAggregateType<T extends AnimeGenreAggregateArgs> = {
        [P in keyof T & keyof AggregateAnimeGenre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnimeGenre[P]>
      : GetScalarType<T[P], AggregateAnimeGenre[P]>
  }




  export type AnimeGenreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeGenreWhereInput
    orderBy?: AnimeGenreOrderByWithAggregationInput | AnimeGenreOrderByWithAggregationInput[]
    by: AnimeGenreScalarFieldEnum[] | AnimeGenreScalarFieldEnum
    having?: AnimeGenreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnimeGenreCountAggregateInputType | true
    _avg?: AnimeGenreAvgAggregateInputType
    _sum?: AnimeGenreSumAggregateInputType
    _min?: AnimeGenreMinAggregateInputType
    _max?: AnimeGenreMaxAggregateInputType
  }

  export type AnimeGenreGroupByOutputType = {
    id: number
    animeId: number
    name: string
    _count: AnimeGenreCountAggregateOutputType | null
    _avg: AnimeGenreAvgAggregateOutputType | null
    _sum: AnimeGenreSumAggregateOutputType | null
    _min: AnimeGenreMinAggregateOutputType | null
    _max: AnimeGenreMaxAggregateOutputType | null
  }

  type GetAnimeGenreGroupByPayload<T extends AnimeGenreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnimeGenreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnimeGenreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnimeGenreGroupByOutputType[P]>
            : GetScalarType<T[P], AnimeGenreGroupByOutputType[P]>
        }
      >
    >


  export type AnimeGenreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    name?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeGenre"]>

  export type AnimeGenreSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    name?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeGenre"]>

  export type AnimeGenreSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    name?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeGenre"]>

  export type AnimeGenreSelectScalar = {
    id?: boolean
    animeId?: boolean
    name?: boolean
  }

  export type AnimeGenreOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "animeId" | "name", ExtArgs["result"]["animeGenre"]>
  export type AnimeGenreInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeGenreIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeGenreIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }

  export type $AnimeGenrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnimeGenre"
    objects: {
      anime: Prisma.$AnimePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      animeId: number
      name: string
    }, ExtArgs["result"]["animeGenre"]>
    composites: {}
  }

  type AnimeGenreGetPayload<S extends boolean | null | undefined | AnimeGenreDefaultArgs> = $Result.GetResult<Prisma.$AnimeGenrePayload, S>

  type AnimeGenreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnimeGenreFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnimeGenreCountAggregateInputType | true
    }

  export interface AnimeGenreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnimeGenre'], meta: { name: 'AnimeGenre' } }
    /**
     * Find zero or one AnimeGenre that matches the filter.
     * @param {AnimeGenreFindUniqueArgs} args - Arguments to find a AnimeGenre
     * @example
     * // Get one AnimeGenre
     * const animeGenre = await prisma.animeGenre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnimeGenreFindUniqueArgs>(args: SelectSubset<T, AnimeGenreFindUniqueArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AnimeGenre that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnimeGenreFindUniqueOrThrowArgs} args - Arguments to find a AnimeGenre
     * @example
     * // Get one AnimeGenre
     * const animeGenre = await prisma.animeGenre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnimeGenreFindUniqueOrThrowArgs>(args: SelectSubset<T, AnimeGenreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeGenre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreFindFirstArgs} args - Arguments to find a AnimeGenre
     * @example
     * // Get one AnimeGenre
     * const animeGenre = await prisma.animeGenre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnimeGenreFindFirstArgs>(args?: SelectSubset<T, AnimeGenreFindFirstArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeGenre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreFindFirstOrThrowArgs} args - Arguments to find a AnimeGenre
     * @example
     * // Get one AnimeGenre
     * const animeGenre = await prisma.animeGenre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnimeGenreFindFirstOrThrowArgs>(args?: SelectSubset<T, AnimeGenreFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AnimeGenres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnimeGenres
     * const animeGenres = await prisma.animeGenre.findMany()
     * 
     * // Get first 10 AnimeGenres
     * const animeGenres = await prisma.animeGenre.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const animeGenreWithIdOnly = await prisma.animeGenre.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnimeGenreFindManyArgs>(args?: SelectSubset<T, AnimeGenreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AnimeGenre.
     * @param {AnimeGenreCreateArgs} args - Arguments to create a AnimeGenre.
     * @example
     * // Create one AnimeGenre
     * const AnimeGenre = await prisma.animeGenre.create({
     *   data: {
     *     // ... data to create a AnimeGenre
     *   }
     * })
     * 
     */
    create<T extends AnimeGenreCreateArgs>(args: SelectSubset<T, AnimeGenreCreateArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AnimeGenres.
     * @param {AnimeGenreCreateManyArgs} args - Arguments to create many AnimeGenres.
     * @example
     * // Create many AnimeGenres
     * const animeGenre = await prisma.animeGenre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnimeGenreCreateManyArgs>(args?: SelectSubset<T, AnimeGenreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnimeGenres and returns the data saved in the database.
     * @param {AnimeGenreCreateManyAndReturnArgs} args - Arguments to create many AnimeGenres.
     * @example
     * // Create many AnimeGenres
     * const animeGenre = await prisma.animeGenre.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnimeGenres and only return the `id`
     * const animeGenreWithIdOnly = await prisma.animeGenre.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnimeGenreCreateManyAndReturnArgs>(args?: SelectSubset<T, AnimeGenreCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AnimeGenre.
     * @param {AnimeGenreDeleteArgs} args - Arguments to delete one AnimeGenre.
     * @example
     * // Delete one AnimeGenre
     * const AnimeGenre = await prisma.animeGenre.delete({
     *   where: {
     *     // ... filter to delete one AnimeGenre
     *   }
     * })
     * 
     */
    delete<T extends AnimeGenreDeleteArgs>(args: SelectSubset<T, AnimeGenreDeleteArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AnimeGenre.
     * @param {AnimeGenreUpdateArgs} args - Arguments to update one AnimeGenre.
     * @example
     * // Update one AnimeGenre
     * const animeGenre = await prisma.animeGenre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnimeGenreUpdateArgs>(args: SelectSubset<T, AnimeGenreUpdateArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AnimeGenres.
     * @param {AnimeGenreDeleteManyArgs} args - Arguments to filter AnimeGenres to delete.
     * @example
     * // Delete a few AnimeGenres
     * const { count } = await prisma.animeGenre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnimeGenreDeleteManyArgs>(args?: SelectSubset<T, AnimeGenreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeGenres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnimeGenres
     * const animeGenre = await prisma.animeGenre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnimeGenreUpdateManyArgs>(args: SelectSubset<T, AnimeGenreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeGenres and returns the data updated in the database.
     * @param {AnimeGenreUpdateManyAndReturnArgs} args - Arguments to update many AnimeGenres.
     * @example
     * // Update many AnimeGenres
     * const animeGenre = await prisma.animeGenre.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AnimeGenres and only return the `id`
     * const animeGenreWithIdOnly = await prisma.animeGenre.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnimeGenreUpdateManyAndReturnArgs>(args: SelectSubset<T, AnimeGenreUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AnimeGenre.
     * @param {AnimeGenreUpsertArgs} args - Arguments to update or create a AnimeGenre.
     * @example
     * // Update or create a AnimeGenre
     * const animeGenre = await prisma.animeGenre.upsert({
     *   create: {
     *     // ... data to create a AnimeGenre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnimeGenre we want to update
     *   }
     * })
     */
    upsert<T extends AnimeGenreUpsertArgs>(args: SelectSubset<T, AnimeGenreUpsertArgs<ExtArgs>>): Prisma__AnimeGenreClient<$Result.GetResult<Prisma.$AnimeGenrePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AnimeGenres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreCountArgs} args - Arguments to filter AnimeGenres to count.
     * @example
     * // Count the number of AnimeGenres
     * const count = await prisma.animeGenre.count({
     *   where: {
     *     // ... the filter for the AnimeGenres we want to count
     *   }
     * })
    **/
    count<T extends AnimeGenreCountArgs>(
      args?: Subset<T, AnimeGenreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnimeGenreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnimeGenre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnimeGenreAggregateArgs>(args: Subset<T, AnimeGenreAggregateArgs>): Prisma.PrismaPromise<GetAnimeGenreAggregateType<T>>

    /**
     * Group by AnimeGenre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeGenreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnimeGenreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnimeGenreGroupByArgs['orderBy'] }
        : { orderBy?: AnimeGenreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnimeGenreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnimeGenreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnimeGenre model
   */
  readonly fields: AnimeGenreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnimeGenre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnimeGenreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    anime<T extends AnimeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AnimeDefaultArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AnimeGenre model
   */
  interface AnimeGenreFieldRefs {
    readonly id: FieldRef<"AnimeGenre", 'Int'>
    readonly animeId: FieldRef<"AnimeGenre", 'Int'>
    readonly name: FieldRef<"AnimeGenre", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AnimeGenre findUnique
   */
  export type AnimeGenreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter, which AnimeGenre to fetch.
     */
    where: AnimeGenreWhereUniqueInput
  }

  /**
   * AnimeGenre findUniqueOrThrow
   */
  export type AnimeGenreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter, which AnimeGenre to fetch.
     */
    where: AnimeGenreWhereUniqueInput
  }

  /**
   * AnimeGenre findFirst
   */
  export type AnimeGenreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter, which AnimeGenre to fetch.
     */
    where?: AnimeGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeGenres to fetch.
     */
    orderBy?: AnimeGenreOrderByWithRelationInput | AnimeGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeGenres.
     */
    cursor?: AnimeGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeGenres.
     */
    distinct?: AnimeGenreScalarFieldEnum | AnimeGenreScalarFieldEnum[]
  }

  /**
   * AnimeGenre findFirstOrThrow
   */
  export type AnimeGenreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter, which AnimeGenre to fetch.
     */
    where?: AnimeGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeGenres to fetch.
     */
    orderBy?: AnimeGenreOrderByWithRelationInput | AnimeGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeGenres.
     */
    cursor?: AnimeGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeGenres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeGenres.
     */
    distinct?: AnimeGenreScalarFieldEnum | AnimeGenreScalarFieldEnum[]
  }

  /**
   * AnimeGenre findMany
   */
  export type AnimeGenreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter, which AnimeGenres to fetch.
     */
    where?: AnimeGenreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeGenres to fetch.
     */
    orderBy?: AnimeGenreOrderByWithRelationInput | AnimeGenreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnimeGenres.
     */
    cursor?: AnimeGenreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeGenres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeGenres.
     */
    skip?: number
    distinct?: AnimeGenreScalarFieldEnum | AnimeGenreScalarFieldEnum[]
  }

  /**
   * AnimeGenre create
   */
  export type AnimeGenreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * The data needed to create a AnimeGenre.
     */
    data: XOR<AnimeGenreCreateInput, AnimeGenreUncheckedCreateInput>
  }

  /**
   * AnimeGenre createMany
   */
  export type AnimeGenreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnimeGenres.
     */
    data: AnimeGenreCreateManyInput | AnimeGenreCreateManyInput[]
  }

  /**
   * AnimeGenre createManyAndReturn
   */
  export type AnimeGenreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * The data used to create many AnimeGenres.
     */
    data: AnimeGenreCreateManyInput | AnimeGenreCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeGenre update
   */
  export type AnimeGenreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * The data needed to update a AnimeGenre.
     */
    data: XOR<AnimeGenreUpdateInput, AnimeGenreUncheckedUpdateInput>
    /**
     * Choose, which AnimeGenre to update.
     */
    where: AnimeGenreWhereUniqueInput
  }

  /**
   * AnimeGenre updateMany
   */
  export type AnimeGenreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnimeGenres.
     */
    data: XOR<AnimeGenreUpdateManyMutationInput, AnimeGenreUncheckedUpdateManyInput>
    /**
     * Filter which AnimeGenres to update
     */
    where?: AnimeGenreWhereInput
    /**
     * Limit how many AnimeGenres to update.
     */
    limit?: number
  }

  /**
   * AnimeGenre updateManyAndReturn
   */
  export type AnimeGenreUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * The data used to update AnimeGenres.
     */
    data: XOR<AnimeGenreUpdateManyMutationInput, AnimeGenreUncheckedUpdateManyInput>
    /**
     * Filter which AnimeGenres to update
     */
    where?: AnimeGenreWhereInput
    /**
     * Limit how many AnimeGenres to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeGenre upsert
   */
  export type AnimeGenreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * The filter to search for the AnimeGenre to update in case it exists.
     */
    where: AnimeGenreWhereUniqueInput
    /**
     * In case the AnimeGenre found by the `where` argument doesn't exist, create a new AnimeGenre with this data.
     */
    create: XOR<AnimeGenreCreateInput, AnimeGenreUncheckedCreateInput>
    /**
     * In case the AnimeGenre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnimeGenreUpdateInput, AnimeGenreUncheckedUpdateInput>
  }

  /**
   * AnimeGenre delete
   */
  export type AnimeGenreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
    /**
     * Filter which AnimeGenre to delete.
     */
    where: AnimeGenreWhereUniqueInput
  }

  /**
   * AnimeGenre deleteMany
   */
  export type AnimeGenreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeGenres to delete
     */
    where?: AnimeGenreWhereInput
    /**
     * Limit how many AnimeGenres to delete.
     */
    limit?: number
  }

  /**
   * AnimeGenre without action
   */
  export type AnimeGenreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeGenre
     */
    select?: AnimeGenreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeGenre
     */
    omit?: AnimeGenreOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeGenreInclude<ExtArgs> | null
  }


  /**
   * Model AnimeTag
   */

  export type AggregateAnimeTag = {
    _count: AnimeTagCountAggregateOutputType | null
    _avg: AnimeTagAvgAggregateOutputType | null
    _sum: AnimeTagSumAggregateOutputType | null
    _min: AnimeTagMinAggregateOutputType | null
    _max: AnimeTagMaxAggregateOutputType | null
  }

  export type AnimeTagAvgAggregateOutputType = {
    id: number | null
    animeId: number | null
    tagId: number | null
    rank: number | null
  }

  export type AnimeTagSumAggregateOutputType = {
    id: number | null
    animeId: number | null
    tagId: number | null
    rank: number | null
  }

  export type AnimeTagMinAggregateOutputType = {
    id: number | null
    animeId: number | null
    tagId: number | null
    name: string | null
    rank: number | null
    isAdult: boolean | null
  }

  export type AnimeTagMaxAggregateOutputType = {
    id: number | null
    animeId: number | null
    tagId: number | null
    name: string | null
    rank: number | null
    isAdult: boolean | null
  }

  export type AnimeTagCountAggregateOutputType = {
    id: number
    animeId: number
    tagId: number
    name: number
    rank: number
    isAdult: number
    _all: number
  }


  export type AnimeTagAvgAggregateInputType = {
    id?: true
    animeId?: true
    tagId?: true
    rank?: true
  }

  export type AnimeTagSumAggregateInputType = {
    id?: true
    animeId?: true
    tagId?: true
    rank?: true
  }

  export type AnimeTagMinAggregateInputType = {
    id?: true
    animeId?: true
    tagId?: true
    name?: true
    rank?: true
    isAdult?: true
  }

  export type AnimeTagMaxAggregateInputType = {
    id?: true
    animeId?: true
    tagId?: true
    name?: true
    rank?: true
    isAdult?: true
  }

  export type AnimeTagCountAggregateInputType = {
    id?: true
    animeId?: true
    tagId?: true
    name?: true
    rank?: true
    isAdult?: true
    _all?: true
  }

  export type AnimeTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeTag to aggregate.
     */
    where?: AnimeTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeTags to fetch.
     */
    orderBy?: AnimeTagOrderByWithRelationInput | AnimeTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnimeTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnimeTags
    **/
    _count?: true | AnimeTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnimeTagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnimeTagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnimeTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnimeTagMaxAggregateInputType
  }

  export type GetAnimeTagAggregateType<T extends AnimeTagAggregateArgs> = {
        [P in keyof T & keyof AggregateAnimeTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnimeTag[P]>
      : GetScalarType<T[P], AggregateAnimeTag[P]>
  }




  export type AnimeTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeTagWhereInput
    orderBy?: AnimeTagOrderByWithAggregationInput | AnimeTagOrderByWithAggregationInput[]
    by: AnimeTagScalarFieldEnum[] | AnimeTagScalarFieldEnum
    having?: AnimeTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnimeTagCountAggregateInputType | true
    _avg?: AnimeTagAvgAggregateInputType
    _sum?: AnimeTagSumAggregateInputType
    _min?: AnimeTagMinAggregateInputType
    _max?: AnimeTagMaxAggregateInputType
  }

  export type AnimeTagGroupByOutputType = {
    id: number
    animeId: number
    tagId: number
    name: string
    rank: number | null
    isAdult: boolean
    _count: AnimeTagCountAggregateOutputType | null
    _avg: AnimeTagAvgAggregateOutputType | null
    _sum: AnimeTagSumAggregateOutputType | null
    _min: AnimeTagMinAggregateOutputType | null
    _max: AnimeTagMaxAggregateOutputType | null
  }

  type GetAnimeTagGroupByPayload<T extends AnimeTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnimeTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnimeTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnimeTagGroupByOutputType[P]>
            : GetScalarType<T[P], AnimeTagGroupByOutputType[P]>
        }
      >
    >


  export type AnimeTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    tagId?: boolean
    name?: boolean
    rank?: boolean
    isAdult?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeTag"]>

  export type AnimeTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    tagId?: boolean
    name?: boolean
    rank?: boolean
    isAdult?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeTag"]>

  export type AnimeTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    animeId?: boolean
    tagId?: boolean
    name?: boolean
    rank?: boolean
    isAdult?: boolean
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeTag"]>

  export type AnimeTagSelectScalar = {
    id?: boolean
    animeId?: boolean
    tagId?: boolean
    name?: boolean
    rank?: boolean
    isAdult?: boolean
  }

  export type AnimeTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "animeId" | "tagId" | "name" | "rank" | "isAdult", ExtArgs["result"]["animeTag"]>
  export type AnimeTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    anime?: boolean | AnimeDefaultArgs<ExtArgs>
  }

  export type $AnimeTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnimeTag"
    objects: {
      anime: Prisma.$AnimePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      animeId: number
      tagId: number
      name: string
      rank: number | null
      isAdult: boolean
    }, ExtArgs["result"]["animeTag"]>
    composites: {}
  }

  type AnimeTagGetPayload<S extends boolean | null | undefined | AnimeTagDefaultArgs> = $Result.GetResult<Prisma.$AnimeTagPayload, S>

  type AnimeTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnimeTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnimeTagCountAggregateInputType | true
    }

  export interface AnimeTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnimeTag'], meta: { name: 'AnimeTag' } }
    /**
     * Find zero or one AnimeTag that matches the filter.
     * @param {AnimeTagFindUniqueArgs} args - Arguments to find a AnimeTag
     * @example
     * // Get one AnimeTag
     * const animeTag = await prisma.animeTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnimeTagFindUniqueArgs>(args: SelectSubset<T, AnimeTagFindUniqueArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AnimeTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnimeTagFindUniqueOrThrowArgs} args - Arguments to find a AnimeTag
     * @example
     * // Get one AnimeTag
     * const animeTag = await prisma.animeTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnimeTagFindUniqueOrThrowArgs>(args: SelectSubset<T, AnimeTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagFindFirstArgs} args - Arguments to find a AnimeTag
     * @example
     * // Get one AnimeTag
     * const animeTag = await prisma.animeTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnimeTagFindFirstArgs>(args?: SelectSubset<T, AnimeTagFindFirstArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagFindFirstOrThrowArgs} args - Arguments to find a AnimeTag
     * @example
     * // Get one AnimeTag
     * const animeTag = await prisma.animeTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnimeTagFindFirstOrThrowArgs>(args?: SelectSubset<T, AnimeTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AnimeTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnimeTags
     * const animeTags = await prisma.animeTag.findMany()
     * 
     * // Get first 10 AnimeTags
     * const animeTags = await prisma.animeTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const animeTagWithIdOnly = await prisma.animeTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnimeTagFindManyArgs>(args?: SelectSubset<T, AnimeTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AnimeTag.
     * @param {AnimeTagCreateArgs} args - Arguments to create a AnimeTag.
     * @example
     * // Create one AnimeTag
     * const AnimeTag = await prisma.animeTag.create({
     *   data: {
     *     // ... data to create a AnimeTag
     *   }
     * })
     * 
     */
    create<T extends AnimeTagCreateArgs>(args: SelectSubset<T, AnimeTagCreateArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AnimeTags.
     * @param {AnimeTagCreateManyArgs} args - Arguments to create many AnimeTags.
     * @example
     * // Create many AnimeTags
     * const animeTag = await prisma.animeTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnimeTagCreateManyArgs>(args?: SelectSubset<T, AnimeTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnimeTags and returns the data saved in the database.
     * @param {AnimeTagCreateManyAndReturnArgs} args - Arguments to create many AnimeTags.
     * @example
     * // Create many AnimeTags
     * const animeTag = await prisma.animeTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnimeTags and only return the `id`
     * const animeTagWithIdOnly = await prisma.animeTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnimeTagCreateManyAndReturnArgs>(args?: SelectSubset<T, AnimeTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AnimeTag.
     * @param {AnimeTagDeleteArgs} args - Arguments to delete one AnimeTag.
     * @example
     * // Delete one AnimeTag
     * const AnimeTag = await prisma.animeTag.delete({
     *   where: {
     *     // ... filter to delete one AnimeTag
     *   }
     * })
     * 
     */
    delete<T extends AnimeTagDeleteArgs>(args: SelectSubset<T, AnimeTagDeleteArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AnimeTag.
     * @param {AnimeTagUpdateArgs} args - Arguments to update one AnimeTag.
     * @example
     * // Update one AnimeTag
     * const animeTag = await prisma.animeTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnimeTagUpdateArgs>(args: SelectSubset<T, AnimeTagUpdateArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AnimeTags.
     * @param {AnimeTagDeleteManyArgs} args - Arguments to filter AnimeTags to delete.
     * @example
     * // Delete a few AnimeTags
     * const { count } = await prisma.animeTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnimeTagDeleteManyArgs>(args?: SelectSubset<T, AnimeTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnimeTags
     * const animeTag = await prisma.animeTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnimeTagUpdateManyArgs>(args: SelectSubset<T, AnimeTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeTags and returns the data updated in the database.
     * @param {AnimeTagUpdateManyAndReturnArgs} args - Arguments to update many AnimeTags.
     * @example
     * // Update many AnimeTags
     * const animeTag = await prisma.animeTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AnimeTags and only return the `id`
     * const animeTagWithIdOnly = await prisma.animeTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnimeTagUpdateManyAndReturnArgs>(args: SelectSubset<T, AnimeTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AnimeTag.
     * @param {AnimeTagUpsertArgs} args - Arguments to update or create a AnimeTag.
     * @example
     * // Update or create a AnimeTag
     * const animeTag = await prisma.animeTag.upsert({
     *   create: {
     *     // ... data to create a AnimeTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnimeTag we want to update
     *   }
     * })
     */
    upsert<T extends AnimeTagUpsertArgs>(args: SelectSubset<T, AnimeTagUpsertArgs<ExtArgs>>): Prisma__AnimeTagClient<$Result.GetResult<Prisma.$AnimeTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AnimeTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagCountArgs} args - Arguments to filter AnimeTags to count.
     * @example
     * // Count the number of AnimeTags
     * const count = await prisma.animeTag.count({
     *   where: {
     *     // ... the filter for the AnimeTags we want to count
     *   }
     * })
    **/
    count<T extends AnimeTagCountArgs>(
      args?: Subset<T, AnimeTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnimeTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnimeTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnimeTagAggregateArgs>(args: Subset<T, AnimeTagAggregateArgs>): Prisma.PrismaPromise<GetAnimeTagAggregateType<T>>

    /**
     * Group by AnimeTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnimeTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnimeTagGroupByArgs['orderBy'] }
        : { orderBy?: AnimeTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnimeTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnimeTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnimeTag model
   */
  readonly fields: AnimeTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnimeTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnimeTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    anime<T extends AnimeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AnimeDefaultArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AnimeTag model
   */
  interface AnimeTagFieldRefs {
    readonly id: FieldRef<"AnimeTag", 'Int'>
    readonly animeId: FieldRef<"AnimeTag", 'Int'>
    readonly tagId: FieldRef<"AnimeTag", 'Int'>
    readonly name: FieldRef<"AnimeTag", 'String'>
    readonly rank: FieldRef<"AnimeTag", 'Int'>
    readonly isAdult: FieldRef<"AnimeTag", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * AnimeTag findUnique
   */
  export type AnimeTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter, which AnimeTag to fetch.
     */
    where: AnimeTagWhereUniqueInput
  }

  /**
   * AnimeTag findUniqueOrThrow
   */
  export type AnimeTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter, which AnimeTag to fetch.
     */
    where: AnimeTagWhereUniqueInput
  }

  /**
   * AnimeTag findFirst
   */
  export type AnimeTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter, which AnimeTag to fetch.
     */
    where?: AnimeTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeTags to fetch.
     */
    orderBy?: AnimeTagOrderByWithRelationInput | AnimeTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeTags.
     */
    cursor?: AnimeTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeTags.
     */
    distinct?: AnimeTagScalarFieldEnum | AnimeTagScalarFieldEnum[]
  }

  /**
   * AnimeTag findFirstOrThrow
   */
  export type AnimeTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter, which AnimeTag to fetch.
     */
    where?: AnimeTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeTags to fetch.
     */
    orderBy?: AnimeTagOrderByWithRelationInput | AnimeTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeTags.
     */
    cursor?: AnimeTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeTags.
     */
    distinct?: AnimeTagScalarFieldEnum | AnimeTagScalarFieldEnum[]
  }

  /**
   * AnimeTag findMany
   */
  export type AnimeTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter, which AnimeTags to fetch.
     */
    where?: AnimeTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeTags to fetch.
     */
    orderBy?: AnimeTagOrderByWithRelationInput | AnimeTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnimeTags.
     */
    cursor?: AnimeTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeTags.
     */
    skip?: number
    distinct?: AnimeTagScalarFieldEnum | AnimeTagScalarFieldEnum[]
  }

  /**
   * AnimeTag create
   */
  export type AnimeTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * The data needed to create a AnimeTag.
     */
    data: XOR<AnimeTagCreateInput, AnimeTagUncheckedCreateInput>
  }

  /**
   * AnimeTag createMany
   */
  export type AnimeTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnimeTags.
     */
    data: AnimeTagCreateManyInput | AnimeTagCreateManyInput[]
  }

  /**
   * AnimeTag createManyAndReturn
   */
  export type AnimeTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * The data used to create many AnimeTags.
     */
    data: AnimeTagCreateManyInput | AnimeTagCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeTag update
   */
  export type AnimeTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * The data needed to update a AnimeTag.
     */
    data: XOR<AnimeTagUpdateInput, AnimeTagUncheckedUpdateInput>
    /**
     * Choose, which AnimeTag to update.
     */
    where: AnimeTagWhereUniqueInput
  }

  /**
   * AnimeTag updateMany
   */
  export type AnimeTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnimeTags.
     */
    data: XOR<AnimeTagUpdateManyMutationInput, AnimeTagUncheckedUpdateManyInput>
    /**
     * Filter which AnimeTags to update
     */
    where?: AnimeTagWhereInput
    /**
     * Limit how many AnimeTags to update.
     */
    limit?: number
  }

  /**
   * AnimeTag updateManyAndReturn
   */
  export type AnimeTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * The data used to update AnimeTags.
     */
    data: XOR<AnimeTagUpdateManyMutationInput, AnimeTagUncheckedUpdateManyInput>
    /**
     * Filter which AnimeTags to update
     */
    where?: AnimeTagWhereInput
    /**
     * Limit how many AnimeTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeTag upsert
   */
  export type AnimeTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * The filter to search for the AnimeTag to update in case it exists.
     */
    where: AnimeTagWhereUniqueInput
    /**
     * In case the AnimeTag found by the `where` argument doesn't exist, create a new AnimeTag with this data.
     */
    create: XOR<AnimeTagCreateInput, AnimeTagUncheckedCreateInput>
    /**
     * In case the AnimeTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnimeTagUpdateInput, AnimeTagUncheckedUpdateInput>
  }

  /**
   * AnimeTag delete
   */
  export type AnimeTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
    /**
     * Filter which AnimeTag to delete.
     */
    where: AnimeTagWhereUniqueInput
  }

  /**
   * AnimeTag deleteMany
   */
  export type AnimeTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeTags to delete
     */
    where?: AnimeTagWhereInput
    /**
     * Limit how many AnimeTags to delete.
     */
    limit?: number
  }

  /**
   * AnimeTag without action
   */
  export type AnimeTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeTag
     */
    select?: AnimeTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeTag
     */
    omit?: AnimeTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeTagInclude<ExtArgs> | null
  }


  /**
   * Model AnimeRelation
   */

  export type AggregateAnimeRelation = {
    _count: AnimeRelationCountAggregateOutputType | null
    _avg: AnimeRelationAvgAggregateOutputType | null
    _sum: AnimeRelationSumAggregateOutputType | null
    _min: AnimeRelationMinAggregateOutputType | null
    _max: AnimeRelationMaxAggregateOutputType | null
  }

  export type AnimeRelationAvgAggregateOutputType = {
    id: number | null
    fromId: number | null
    toId: number | null
  }

  export type AnimeRelationSumAggregateOutputType = {
    id: number | null
    fromId: number | null
    toId: number | null
  }

  export type AnimeRelationMinAggregateOutputType = {
    id: number | null
    fromId: number | null
    toId: number | null
    relationType: string | null
  }

  export type AnimeRelationMaxAggregateOutputType = {
    id: number | null
    fromId: number | null
    toId: number | null
    relationType: string | null
  }

  export type AnimeRelationCountAggregateOutputType = {
    id: number
    fromId: number
    toId: number
    relationType: number
    _all: number
  }


  export type AnimeRelationAvgAggregateInputType = {
    id?: true
    fromId?: true
    toId?: true
  }

  export type AnimeRelationSumAggregateInputType = {
    id?: true
    fromId?: true
    toId?: true
  }

  export type AnimeRelationMinAggregateInputType = {
    id?: true
    fromId?: true
    toId?: true
    relationType?: true
  }

  export type AnimeRelationMaxAggregateInputType = {
    id?: true
    fromId?: true
    toId?: true
    relationType?: true
  }

  export type AnimeRelationCountAggregateInputType = {
    id?: true
    fromId?: true
    toId?: true
    relationType?: true
    _all?: true
  }

  export type AnimeRelationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeRelation to aggregate.
     */
    where?: AnimeRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeRelations to fetch.
     */
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnimeRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AnimeRelations
    **/
    _count?: true | AnimeRelationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnimeRelationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnimeRelationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnimeRelationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnimeRelationMaxAggregateInputType
  }

  export type GetAnimeRelationAggregateType<T extends AnimeRelationAggregateArgs> = {
        [P in keyof T & keyof AggregateAnimeRelation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnimeRelation[P]>
      : GetScalarType<T[P], AggregateAnimeRelation[P]>
  }




  export type AnimeRelationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnimeRelationWhereInput
    orderBy?: AnimeRelationOrderByWithAggregationInput | AnimeRelationOrderByWithAggregationInput[]
    by: AnimeRelationScalarFieldEnum[] | AnimeRelationScalarFieldEnum
    having?: AnimeRelationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnimeRelationCountAggregateInputType | true
    _avg?: AnimeRelationAvgAggregateInputType
    _sum?: AnimeRelationSumAggregateInputType
    _min?: AnimeRelationMinAggregateInputType
    _max?: AnimeRelationMaxAggregateInputType
  }

  export type AnimeRelationGroupByOutputType = {
    id: number
    fromId: number
    toId: number
    relationType: string
    _count: AnimeRelationCountAggregateOutputType | null
    _avg: AnimeRelationAvgAggregateOutputType | null
    _sum: AnimeRelationSumAggregateOutputType | null
    _min: AnimeRelationMinAggregateOutputType | null
    _max: AnimeRelationMaxAggregateOutputType | null
  }

  type GetAnimeRelationGroupByPayload<T extends AnimeRelationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnimeRelationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnimeRelationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnimeRelationGroupByOutputType[P]>
            : GetScalarType<T[P], AnimeRelationGroupByOutputType[P]>
        }
      >
    >


  export type AnimeRelationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fromId?: boolean
    toId?: boolean
    relationType?: boolean
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeRelation"]>

  export type AnimeRelationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fromId?: boolean
    toId?: boolean
    relationType?: boolean
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeRelation"]>

  export type AnimeRelationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fromId?: boolean
    toId?: boolean
    relationType?: boolean
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["animeRelation"]>

  export type AnimeRelationSelectScalar = {
    id?: boolean
    fromId?: boolean
    toId?: boolean
    relationType?: boolean
  }

  export type AnimeRelationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fromId" | "toId" | "relationType", ExtArgs["result"]["animeRelation"]>
  export type AnimeRelationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeRelationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }
  export type AnimeRelationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    from?: boolean | AnimeDefaultArgs<ExtArgs>
    to?: boolean | AnimeDefaultArgs<ExtArgs>
  }

  export type $AnimeRelationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AnimeRelation"
    objects: {
      from: Prisma.$AnimePayload<ExtArgs>
      to: Prisma.$AnimePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      fromId: number
      toId: number
      relationType: string
    }, ExtArgs["result"]["animeRelation"]>
    composites: {}
  }

  type AnimeRelationGetPayload<S extends boolean | null | undefined | AnimeRelationDefaultArgs> = $Result.GetResult<Prisma.$AnimeRelationPayload, S>

  type AnimeRelationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnimeRelationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnimeRelationCountAggregateInputType | true
    }

  export interface AnimeRelationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AnimeRelation'], meta: { name: 'AnimeRelation' } }
    /**
     * Find zero or one AnimeRelation that matches the filter.
     * @param {AnimeRelationFindUniqueArgs} args - Arguments to find a AnimeRelation
     * @example
     * // Get one AnimeRelation
     * const animeRelation = await prisma.animeRelation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnimeRelationFindUniqueArgs>(args: SelectSubset<T, AnimeRelationFindUniqueArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AnimeRelation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnimeRelationFindUniqueOrThrowArgs} args - Arguments to find a AnimeRelation
     * @example
     * // Get one AnimeRelation
     * const animeRelation = await prisma.animeRelation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnimeRelationFindUniqueOrThrowArgs>(args: SelectSubset<T, AnimeRelationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeRelation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationFindFirstArgs} args - Arguments to find a AnimeRelation
     * @example
     * // Get one AnimeRelation
     * const animeRelation = await prisma.animeRelation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnimeRelationFindFirstArgs>(args?: SelectSubset<T, AnimeRelationFindFirstArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AnimeRelation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationFindFirstOrThrowArgs} args - Arguments to find a AnimeRelation
     * @example
     * // Get one AnimeRelation
     * const animeRelation = await prisma.animeRelation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnimeRelationFindFirstOrThrowArgs>(args?: SelectSubset<T, AnimeRelationFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AnimeRelations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnimeRelations
     * const animeRelations = await prisma.animeRelation.findMany()
     * 
     * // Get first 10 AnimeRelations
     * const animeRelations = await prisma.animeRelation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const animeRelationWithIdOnly = await prisma.animeRelation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnimeRelationFindManyArgs>(args?: SelectSubset<T, AnimeRelationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AnimeRelation.
     * @param {AnimeRelationCreateArgs} args - Arguments to create a AnimeRelation.
     * @example
     * // Create one AnimeRelation
     * const AnimeRelation = await prisma.animeRelation.create({
     *   data: {
     *     // ... data to create a AnimeRelation
     *   }
     * })
     * 
     */
    create<T extends AnimeRelationCreateArgs>(args: SelectSubset<T, AnimeRelationCreateArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AnimeRelations.
     * @param {AnimeRelationCreateManyArgs} args - Arguments to create many AnimeRelations.
     * @example
     * // Create many AnimeRelations
     * const animeRelation = await prisma.animeRelation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnimeRelationCreateManyArgs>(args?: SelectSubset<T, AnimeRelationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AnimeRelations and returns the data saved in the database.
     * @param {AnimeRelationCreateManyAndReturnArgs} args - Arguments to create many AnimeRelations.
     * @example
     * // Create many AnimeRelations
     * const animeRelation = await prisma.animeRelation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AnimeRelations and only return the `id`
     * const animeRelationWithIdOnly = await prisma.animeRelation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnimeRelationCreateManyAndReturnArgs>(args?: SelectSubset<T, AnimeRelationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AnimeRelation.
     * @param {AnimeRelationDeleteArgs} args - Arguments to delete one AnimeRelation.
     * @example
     * // Delete one AnimeRelation
     * const AnimeRelation = await prisma.animeRelation.delete({
     *   where: {
     *     // ... filter to delete one AnimeRelation
     *   }
     * })
     * 
     */
    delete<T extends AnimeRelationDeleteArgs>(args: SelectSubset<T, AnimeRelationDeleteArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AnimeRelation.
     * @param {AnimeRelationUpdateArgs} args - Arguments to update one AnimeRelation.
     * @example
     * // Update one AnimeRelation
     * const animeRelation = await prisma.animeRelation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnimeRelationUpdateArgs>(args: SelectSubset<T, AnimeRelationUpdateArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AnimeRelations.
     * @param {AnimeRelationDeleteManyArgs} args - Arguments to filter AnimeRelations to delete.
     * @example
     * // Delete a few AnimeRelations
     * const { count } = await prisma.animeRelation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnimeRelationDeleteManyArgs>(args?: SelectSubset<T, AnimeRelationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeRelations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AnimeRelations
     * const animeRelation = await prisma.animeRelation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnimeRelationUpdateManyArgs>(args: SelectSubset<T, AnimeRelationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AnimeRelations and returns the data updated in the database.
     * @param {AnimeRelationUpdateManyAndReturnArgs} args - Arguments to update many AnimeRelations.
     * @example
     * // Update many AnimeRelations
     * const animeRelation = await prisma.animeRelation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AnimeRelations and only return the `id`
     * const animeRelationWithIdOnly = await prisma.animeRelation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AnimeRelationUpdateManyAndReturnArgs>(args: SelectSubset<T, AnimeRelationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AnimeRelation.
     * @param {AnimeRelationUpsertArgs} args - Arguments to update or create a AnimeRelation.
     * @example
     * // Update or create a AnimeRelation
     * const animeRelation = await prisma.animeRelation.upsert({
     *   create: {
     *     // ... data to create a AnimeRelation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AnimeRelation we want to update
     *   }
     * })
     */
    upsert<T extends AnimeRelationUpsertArgs>(args: SelectSubset<T, AnimeRelationUpsertArgs<ExtArgs>>): Prisma__AnimeRelationClient<$Result.GetResult<Prisma.$AnimeRelationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AnimeRelations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationCountArgs} args - Arguments to filter AnimeRelations to count.
     * @example
     * // Count the number of AnimeRelations
     * const count = await prisma.animeRelation.count({
     *   where: {
     *     // ... the filter for the AnimeRelations we want to count
     *   }
     * })
    **/
    count<T extends AnimeRelationCountArgs>(
      args?: Subset<T, AnimeRelationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnimeRelationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AnimeRelation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AnimeRelationAggregateArgs>(args: Subset<T, AnimeRelationAggregateArgs>): Prisma.PrismaPromise<GetAnimeRelationAggregateType<T>>

    /**
     * Group by AnimeRelation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnimeRelationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AnimeRelationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnimeRelationGroupByArgs['orderBy'] }
        : { orderBy?: AnimeRelationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AnimeRelationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnimeRelationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AnimeRelation model
   */
  readonly fields: AnimeRelationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AnimeRelation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnimeRelationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    from<T extends AnimeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AnimeDefaultArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    to<T extends AnimeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AnimeDefaultArgs<ExtArgs>>): Prisma__AnimeClient<$Result.GetResult<Prisma.$AnimePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AnimeRelation model
   */
  interface AnimeRelationFieldRefs {
    readonly id: FieldRef<"AnimeRelation", 'Int'>
    readonly fromId: FieldRef<"AnimeRelation", 'Int'>
    readonly toId: FieldRef<"AnimeRelation", 'Int'>
    readonly relationType: FieldRef<"AnimeRelation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AnimeRelation findUnique
   */
  export type AnimeRelationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter, which AnimeRelation to fetch.
     */
    where: AnimeRelationWhereUniqueInput
  }

  /**
   * AnimeRelation findUniqueOrThrow
   */
  export type AnimeRelationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter, which AnimeRelation to fetch.
     */
    where: AnimeRelationWhereUniqueInput
  }

  /**
   * AnimeRelation findFirst
   */
  export type AnimeRelationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter, which AnimeRelation to fetch.
     */
    where?: AnimeRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeRelations to fetch.
     */
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeRelations.
     */
    cursor?: AnimeRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeRelations.
     */
    distinct?: AnimeRelationScalarFieldEnum | AnimeRelationScalarFieldEnum[]
  }

  /**
   * AnimeRelation findFirstOrThrow
   */
  export type AnimeRelationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter, which AnimeRelation to fetch.
     */
    where?: AnimeRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeRelations to fetch.
     */
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AnimeRelations.
     */
    cursor?: AnimeRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeRelations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AnimeRelations.
     */
    distinct?: AnimeRelationScalarFieldEnum | AnimeRelationScalarFieldEnum[]
  }

  /**
   * AnimeRelation findMany
   */
  export type AnimeRelationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter, which AnimeRelations to fetch.
     */
    where?: AnimeRelationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AnimeRelations to fetch.
     */
    orderBy?: AnimeRelationOrderByWithRelationInput | AnimeRelationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AnimeRelations.
     */
    cursor?: AnimeRelationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AnimeRelations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AnimeRelations.
     */
    skip?: number
    distinct?: AnimeRelationScalarFieldEnum | AnimeRelationScalarFieldEnum[]
  }

  /**
   * AnimeRelation create
   */
  export type AnimeRelationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * The data needed to create a AnimeRelation.
     */
    data: XOR<AnimeRelationCreateInput, AnimeRelationUncheckedCreateInput>
  }

  /**
   * AnimeRelation createMany
   */
  export type AnimeRelationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AnimeRelations.
     */
    data: AnimeRelationCreateManyInput | AnimeRelationCreateManyInput[]
  }

  /**
   * AnimeRelation createManyAndReturn
   */
  export type AnimeRelationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * The data used to create many AnimeRelations.
     */
    data: AnimeRelationCreateManyInput | AnimeRelationCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeRelation update
   */
  export type AnimeRelationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * The data needed to update a AnimeRelation.
     */
    data: XOR<AnimeRelationUpdateInput, AnimeRelationUncheckedUpdateInput>
    /**
     * Choose, which AnimeRelation to update.
     */
    where: AnimeRelationWhereUniqueInput
  }

  /**
   * AnimeRelation updateMany
   */
  export type AnimeRelationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AnimeRelations.
     */
    data: XOR<AnimeRelationUpdateManyMutationInput, AnimeRelationUncheckedUpdateManyInput>
    /**
     * Filter which AnimeRelations to update
     */
    where?: AnimeRelationWhereInput
    /**
     * Limit how many AnimeRelations to update.
     */
    limit?: number
  }

  /**
   * AnimeRelation updateManyAndReturn
   */
  export type AnimeRelationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * The data used to update AnimeRelations.
     */
    data: XOR<AnimeRelationUpdateManyMutationInput, AnimeRelationUncheckedUpdateManyInput>
    /**
     * Filter which AnimeRelations to update
     */
    where?: AnimeRelationWhereInput
    /**
     * Limit how many AnimeRelations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AnimeRelation upsert
   */
  export type AnimeRelationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * The filter to search for the AnimeRelation to update in case it exists.
     */
    where: AnimeRelationWhereUniqueInput
    /**
     * In case the AnimeRelation found by the `where` argument doesn't exist, create a new AnimeRelation with this data.
     */
    create: XOR<AnimeRelationCreateInput, AnimeRelationUncheckedCreateInput>
    /**
     * In case the AnimeRelation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnimeRelationUpdateInput, AnimeRelationUncheckedUpdateInput>
  }

  /**
   * AnimeRelation delete
   */
  export type AnimeRelationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
    /**
     * Filter which AnimeRelation to delete.
     */
    where: AnimeRelationWhereUniqueInput
  }

  /**
   * AnimeRelation deleteMany
   */
  export type AnimeRelationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AnimeRelations to delete
     */
    where?: AnimeRelationWhereInput
    /**
     * Limit how many AnimeRelations to delete.
     */
    limit?: number
  }

  /**
   * AnimeRelation without action
   */
  export type AnimeRelationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnimeRelation
     */
    select?: AnimeRelationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AnimeRelation
     */
    omit?: AnimeRelationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnimeRelationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AnimeScalarFieldEnum: {
    id: 'id',
    titleEn: 'titleEn',
    titleRo: 'titleRo',
    cover: 'cover',
    format: 'format',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    dataHash: 'dataHash'
  };

  export type AnimeScalarFieldEnum = (typeof AnimeScalarFieldEnum)[keyof typeof AnimeScalarFieldEnum]


  export const AnimeGenreScalarFieldEnum: {
    id: 'id',
    animeId: 'animeId',
    name: 'name'
  };

  export type AnimeGenreScalarFieldEnum = (typeof AnimeGenreScalarFieldEnum)[keyof typeof AnimeGenreScalarFieldEnum]


  export const AnimeTagScalarFieldEnum: {
    id: 'id',
    animeId: 'animeId',
    tagId: 'tagId',
    name: 'name',
    rank: 'rank',
    isAdult: 'isAdult'
  };

  export type AnimeTagScalarFieldEnum = (typeof AnimeTagScalarFieldEnum)[keyof typeof AnimeTagScalarFieldEnum]


  export const AnimeRelationScalarFieldEnum: {
    id: 'id',
    fromId: 'fromId',
    toId: 'toId',
    relationType: 'relationType'
  };

  export type AnimeRelationScalarFieldEnum = (typeof AnimeRelationScalarFieldEnum)[keyof typeof AnimeRelationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type AnimeWhereInput = {
    AND?: AnimeWhereInput | AnimeWhereInput[]
    OR?: AnimeWhereInput[]
    NOT?: AnimeWhereInput | AnimeWhereInput[]
    id?: IntFilter<"Anime"> | number
    titleEn?: StringNullableFilter<"Anime"> | string | null
    titleRo?: StringNullableFilter<"Anime"> | string | null
    cover?: StringNullableFilter<"Anime"> | string | null
    format?: StringNullableFilter<"Anime"> | string | null
    createdAt?: DateTimeFilter<"Anime"> | Date | string
    updatedAt?: DateTimeFilter<"Anime"> | Date | string
    dataHash?: StringNullableFilter<"Anime"> | string | null
    relationsTo?: AnimeRelationListRelationFilter
    relationsFrom?: AnimeRelationListRelationFilter
    genres?: AnimeGenreListRelationFilter
    tags?: AnimeTagListRelationFilter
  }

  export type AnimeOrderByWithRelationInput = {
    id?: SortOrder
    titleEn?: SortOrderInput | SortOrder
    titleRo?: SortOrderInput | SortOrder
    cover?: SortOrderInput | SortOrder
    format?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataHash?: SortOrderInput | SortOrder
    relationsTo?: AnimeRelationOrderByRelationAggregateInput
    relationsFrom?: AnimeRelationOrderByRelationAggregateInput
    genres?: AnimeGenreOrderByRelationAggregateInput
    tags?: AnimeTagOrderByRelationAggregateInput
  }

  export type AnimeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AnimeWhereInput | AnimeWhereInput[]
    OR?: AnimeWhereInput[]
    NOT?: AnimeWhereInput | AnimeWhereInput[]
    titleEn?: StringNullableFilter<"Anime"> | string | null
    titleRo?: StringNullableFilter<"Anime"> | string | null
    cover?: StringNullableFilter<"Anime"> | string | null
    format?: StringNullableFilter<"Anime"> | string | null
    createdAt?: DateTimeFilter<"Anime"> | Date | string
    updatedAt?: DateTimeFilter<"Anime"> | Date | string
    dataHash?: StringNullableFilter<"Anime"> | string | null
    relationsTo?: AnimeRelationListRelationFilter
    relationsFrom?: AnimeRelationListRelationFilter
    genres?: AnimeGenreListRelationFilter
    tags?: AnimeTagListRelationFilter
  }, "id">

  export type AnimeOrderByWithAggregationInput = {
    id?: SortOrder
    titleEn?: SortOrderInput | SortOrder
    titleRo?: SortOrderInput | SortOrder
    cover?: SortOrderInput | SortOrder
    format?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataHash?: SortOrderInput | SortOrder
    _count?: AnimeCountOrderByAggregateInput
    _avg?: AnimeAvgOrderByAggregateInput
    _max?: AnimeMaxOrderByAggregateInput
    _min?: AnimeMinOrderByAggregateInput
    _sum?: AnimeSumOrderByAggregateInput
  }

  export type AnimeScalarWhereWithAggregatesInput = {
    AND?: AnimeScalarWhereWithAggregatesInput | AnimeScalarWhereWithAggregatesInput[]
    OR?: AnimeScalarWhereWithAggregatesInput[]
    NOT?: AnimeScalarWhereWithAggregatesInput | AnimeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Anime"> | number
    titleEn?: StringNullableWithAggregatesFilter<"Anime"> | string | null
    titleRo?: StringNullableWithAggregatesFilter<"Anime"> | string | null
    cover?: StringNullableWithAggregatesFilter<"Anime"> | string | null
    format?: StringNullableWithAggregatesFilter<"Anime"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Anime"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Anime"> | Date | string
    dataHash?: StringNullableWithAggregatesFilter<"Anime"> | string | null
  }

  export type AnimeGenreWhereInput = {
    AND?: AnimeGenreWhereInput | AnimeGenreWhereInput[]
    OR?: AnimeGenreWhereInput[]
    NOT?: AnimeGenreWhereInput | AnimeGenreWhereInput[]
    id?: IntFilter<"AnimeGenre"> | number
    animeId?: IntFilter<"AnimeGenre"> | number
    name?: StringFilter<"AnimeGenre"> | string
    anime?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }

  export type AnimeGenreOrderByWithRelationInput = {
    id?: SortOrder
    animeId?: SortOrder
    name?: SortOrder
    anime?: AnimeOrderByWithRelationInput
  }

  export type AnimeGenreWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    animeId_name?: AnimeGenreAnimeIdNameCompoundUniqueInput
    AND?: AnimeGenreWhereInput | AnimeGenreWhereInput[]
    OR?: AnimeGenreWhereInput[]
    NOT?: AnimeGenreWhereInput | AnimeGenreWhereInput[]
    animeId?: IntFilter<"AnimeGenre"> | number
    name?: StringFilter<"AnimeGenre"> | string
    anime?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }, "id" | "animeId_name">

  export type AnimeGenreOrderByWithAggregationInput = {
    id?: SortOrder
    animeId?: SortOrder
    name?: SortOrder
    _count?: AnimeGenreCountOrderByAggregateInput
    _avg?: AnimeGenreAvgOrderByAggregateInput
    _max?: AnimeGenreMaxOrderByAggregateInput
    _min?: AnimeGenreMinOrderByAggregateInput
    _sum?: AnimeGenreSumOrderByAggregateInput
  }

  export type AnimeGenreScalarWhereWithAggregatesInput = {
    AND?: AnimeGenreScalarWhereWithAggregatesInput | AnimeGenreScalarWhereWithAggregatesInput[]
    OR?: AnimeGenreScalarWhereWithAggregatesInput[]
    NOT?: AnimeGenreScalarWhereWithAggregatesInput | AnimeGenreScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AnimeGenre"> | number
    animeId?: IntWithAggregatesFilter<"AnimeGenre"> | number
    name?: StringWithAggregatesFilter<"AnimeGenre"> | string
  }

  export type AnimeTagWhereInput = {
    AND?: AnimeTagWhereInput | AnimeTagWhereInput[]
    OR?: AnimeTagWhereInput[]
    NOT?: AnimeTagWhereInput | AnimeTagWhereInput[]
    id?: IntFilter<"AnimeTag"> | number
    animeId?: IntFilter<"AnimeTag"> | number
    tagId?: IntFilter<"AnimeTag"> | number
    name?: StringFilter<"AnimeTag"> | string
    rank?: IntNullableFilter<"AnimeTag"> | number | null
    isAdult?: BoolFilter<"AnimeTag"> | boolean
    anime?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }

  export type AnimeTagOrderByWithRelationInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    name?: SortOrder
    rank?: SortOrderInput | SortOrder
    isAdult?: SortOrder
    anime?: AnimeOrderByWithRelationInput
  }

  export type AnimeTagWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    animeId_tagId?: AnimeTagAnimeIdTagIdCompoundUniqueInput
    AND?: AnimeTagWhereInput | AnimeTagWhereInput[]
    OR?: AnimeTagWhereInput[]
    NOT?: AnimeTagWhereInput | AnimeTagWhereInput[]
    animeId?: IntFilter<"AnimeTag"> | number
    tagId?: IntFilter<"AnimeTag"> | number
    name?: StringFilter<"AnimeTag"> | string
    rank?: IntNullableFilter<"AnimeTag"> | number | null
    isAdult?: BoolFilter<"AnimeTag"> | boolean
    anime?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }, "id" | "animeId_tagId">

  export type AnimeTagOrderByWithAggregationInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    name?: SortOrder
    rank?: SortOrderInput | SortOrder
    isAdult?: SortOrder
    _count?: AnimeTagCountOrderByAggregateInput
    _avg?: AnimeTagAvgOrderByAggregateInput
    _max?: AnimeTagMaxOrderByAggregateInput
    _min?: AnimeTagMinOrderByAggregateInput
    _sum?: AnimeTagSumOrderByAggregateInput
  }

  export type AnimeTagScalarWhereWithAggregatesInput = {
    AND?: AnimeTagScalarWhereWithAggregatesInput | AnimeTagScalarWhereWithAggregatesInput[]
    OR?: AnimeTagScalarWhereWithAggregatesInput[]
    NOT?: AnimeTagScalarWhereWithAggregatesInput | AnimeTagScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AnimeTag"> | number
    animeId?: IntWithAggregatesFilter<"AnimeTag"> | number
    tagId?: IntWithAggregatesFilter<"AnimeTag"> | number
    name?: StringWithAggregatesFilter<"AnimeTag"> | string
    rank?: IntNullableWithAggregatesFilter<"AnimeTag"> | number | null
    isAdult?: BoolWithAggregatesFilter<"AnimeTag"> | boolean
  }

  export type AnimeRelationWhereInput = {
    AND?: AnimeRelationWhereInput | AnimeRelationWhereInput[]
    OR?: AnimeRelationWhereInput[]
    NOT?: AnimeRelationWhereInput | AnimeRelationWhereInput[]
    id?: IntFilter<"AnimeRelation"> | number
    fromId?: IntFilter<"AnimeRelation"> | number
    toId?: IntFilter<"AnimeRelation"> | number
    relationType?: StringFilter<"AnimeRelation"> | string
    from?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
    to?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }

  export type AnimeRelationOrderByWithRelationInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
    relationType?: SortOrder
    from?: AnimeOrderByWithRelationInput
    to?: AnimeOrderByWithRelationInput
  }

  export type AnimeRelationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    fromId_toId_relationType?: AnimeRelationFromIdToIdRelationTypeCompoundUniqueInput
    AND?: AnimeRelationWhereInput | AnimeRelationWhereInput[]
    OR?: AnimeRelationWhereInput[]
    NOT?: AnimeRelationWhereInput | AnimeRelationWhereInput[]
    fromId?: IntFilter<"AnimeRelation"> | number
    toId?: IntFilter<"AnimeRelation"> | number
    relationType?: StringFilter<"AnimeRelation"> | string
    from?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
    to?: XOR<AnimeScalarRelationFilter, AnimeWhereInput>
  }, "id" | "fromId_toId_relationType">

  export type AnimeRelationOrderByWithAggregationInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
    relationType?: SortOrder
    _count?: AnimeRelationCountOrderByAggregateInput
    _avg?: AnimeRelationAvgOrderByAggregateInput
    _max?: AnimeRelationMaxOrderByAggregateInput
    _min?: AnimeRelationMinOrderByAggregateInput
    _sum?: AnimeRelationSumOrderByAggregateInput
  }

  export type AnimeRelationScalarWhereWithAggregatesInput = {
    AND?: AnimeRelationScalarWhereWithAggregatesInput | AnimeRelationScalarWhereWithAggregatesInput[]
    OR?: AnimeRelationScalarWhereWithAggregatesInput[]
    NOT?: AnimeRelationScalarWhereWithAggregatesInput | AnimeRelationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AnimeRelation"> | number
    fromId?: IntWithAggregatesFilter<"AnimeRelation"> | number
    toId?: IntWithAggregatesFilter<"AnimeRelation"> | number
    relationType?: StringWithAggregatesFilter<"AnimeRelation"> | string
  }

  export type AnimeCreateInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationCreateNestedManyWithoutFromInput
    genres?: AnimeGenreCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUncheckedCreateInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationUncheckedCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationUncheckedCreateNestedManyWithoutFromInput
    genres?: AnimeGenreUncheckedCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagUncheckedCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUncheckedUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUncheckedUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUncheckedUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUncheckedUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeCreateManyInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
  }

  export type AnimeUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AnimeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AnimeGenreCreateInput = {
    name: string
    anime: AnimeCreateNestedOneWithoutGenresInput
  }

  export type AnimeGenreUncheckedCreateInput = {
    id?: number
    animeId: number
    name: string
  }

  export type AnimeGenreUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    anime?: AnimeUpdateOneRequiredWithoutGenresNestedInput
  }

  export type AnimeGenreUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    animeId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeGenreCreateManyInput = {
    id?: number
    animeId: number
    name: string
  }

  export type AnimeGenreUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeGenreUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    animeId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeTagCreateInput = {
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
    anime: AnimeCreateNestedOneWithoutTagsInput
  }

  export type AnimeTagUncheckedCreateInput = {
    id?: number
    animeId: number
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
  }

  export type AnimeTagUpdateInput = {
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
    anime?: AnimeUpdateOneRequiredWithoutTagsNestedInput
  }

  export type AnimeTagUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    animeId?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AnimeTagCreateManyInput = {
    id?: number
    animeId: number
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
  }

  export type AnimeTagUpdateManyMutationInput = {
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AnimeTagUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    animeId?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AnimeRelationCreateInput = {
    relationType: string
    from: AnimeCreateNestedOneWithoutRelationsFromInput
    to: AnimeCreateNestedOneWithoutRelationsToInput
  }

  export type AnimeRelationUncheckedCreateInput = {
    id?: number
    fromId: number
    toId: number
    relationType: string
  }

  export type AnimeRelationUpdateInput = {
    relationType?: StringFieldUpdateOperationsInput | string
    from?: AnimeUpdateOneRequiredWithoutRelationsFromNestedInput
    to?: AnimeUpdateOneRequiredWithoutRelationsToNestedInput
  }

  export type AnimeRelationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fromId?: IntFieldUpdateOperationsInput | number
    toId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeRelationCreateManyInput = {
    id?: number
    fromId: number
    toId: number
    relationType: string
  }

  export type AnimeRelationUpdateManyMutationInput = {
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeRelationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    fromId?: IntFieldUpdateOperationsInput | number
    toId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AnimeRelationListRelationFilter = {
    every?: AnimeRelationWhereInput
    some?: AnimeRelationWhereInput
    none?: AnimeRelationWhereInput
  }

  export type AnimeGenreListRelationFilter = {
    every?: AnimeGenreWhereInput
    some?: AnimeGenreWhereInput
    none?: AnimeGenreWhereInput
  }

  export type AnimeTagListRelationFilter = {
    every?: AnimeTagWhereInput
    some?: AnimeTagWhereInput
    none?: AnimeTagWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AnimeRelationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnimeGenreOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnimeTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AnimeCountOrderByAggregateInput = {
    id?: SortOrder
    titleEn?: SortOrder
    titleRo?: SortOrder
    cover?: SortOrder
    format?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataHash?: SortOrder
  }

  export type AnimeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AnimeMaxOrderByAggregateInput = {
    id?: SortOrder
    titleEn?: SortOrder
    titleRo?: SortOrder
    cover?: SortOrder
    format?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataHash?: SortOrder
  }

  export type AnimeMinOrderByAggregateInput = {
    id?: SortOrder
    titleEn?: SortOrder
    titleRo?: SortOrder
    cover?: SortOrder
    format?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    dataHash?: SortOrder
  }

  export type AnimeSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type AnimeScalarRelationFilter = {
    is?: AnimeWhereInput
    isNot?: AnimeWhereInput
  }

  export type AnimeGenreAnimeIdNameCompoundUniqueInput = {
    animeId: number
    name: string
  }

  export type AnimeGenreCountOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    name?: SortOrder
  }

  export type AnimeGenreAvgOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
  }

  export type AnimeGenreMaxOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    name?: SortOrder
  }

  export type AnimeGenreMinOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    name?: SortOrder
  }

  export type AnimeGenreSumOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AnimeTagAnimeIdTagIdCompoundUniqueInput = {
    animeId: number
    tagId: number
  }

  export type AnimeTagCountOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    name?: SortOrder
    rank?: SortOrder
    isAdult?: SortOrder
  }

  export type AnimeTagAvgOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    rank?: SortOrder
  }

  export type AnimeTagMaxOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    name?: SortOrder
    rank?: SortOrder
    isAdult?: SortOrder
  }

  export type AnimeTagMinOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    name?: SortOrder
    rank?: SortOrder
    isAdult?: SortOrder
  }

  export type AnimeTagSumOrderByAggregateInput = {
    id?: SortOrder
    animeId?: SortOrder
    tagId?: SortOrder
    rank?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type AnimeRelationFromIdToIdRelationTypeCompoundUniqueInput = {
    fromId: number
    toId: number
    relationType: string
  }

  export type AnimeRelationCountOrderByAggregateInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
    relationType?: SortOrder
  }

  export type AnimeRelationAvgOrderByAggregateInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
  }

  export type AnimeRelationMaxOrderByAggregateInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
    relationType?: SortOrder
  }

  export type AnimeRelationMinOrderByAggregateInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
    relationType?: SortOrder
  }

  export type AnimeRelationSumOrderByAggregateInput = {
    id?: SortOrder
    fromId?: SortOrder
    toId?: SortOrder
  }

  export type AnimeRelationCreateNestedManyWithoutToInput = {
    create?: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput> | AnimeRelationCreateWithoutToInput[] | AnimeRelationUncheckedCreateWithoutToInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutToInput | AnimeRelationCreateOrConnectWithoutToInput[]
    createMany?: AnimeRelationCreateManyToInputEnvelope
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
  }

  export type AnimeRelationCreateNestedManyWithoutFromInput = {
    create?: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput> | AnimeRelationCreateWithoutFromInput[] | AnimeRelationUncheckedCreateWithoutFromInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutFromInput | AnimeRelationCreateOrConnectWithoutFromInput[]
    createMany?: AnimeRelationCreateManyFromInputEnvelope
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
  }

  export type AnimeGenreCreateNestedManyWithoutAnimeInput = {
    create?: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput> | AnimeGenreCreateWithoutAnimeInput[] | AnimeGenreUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeGenreCreateOrConnectWithoutAnimeInput | AnimeGenreCreateOrConnectWithoutAnimeInput[]
    createMany?: AnimeGenreCreateManyAnimeInputEnvelope
    connect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
  }

  export type AnimeTagCreateNestedManyWithoutAnimeInput = {
    create?: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput> | AnimeTagCreateWithoutAnimeInput[] | AnimeTagUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeTagCreateOrConnectWithoutAnimeInput | AnimeTagCreateOrConnectWithoutAnimeInput[]
    createMany?: AnimeTagCreateManyAnimeInputEnvelope
    connect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
  }

  export type AnimeRelationUncheckedCreateNestedManyWithoutToInput = {
    create?: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput> | AnimeRelationCreateWithoutToInput[] | AnimeRelationUncheckedCreateWithoutToInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutToInput | AnimeRelationCreateOrConnectWithoutToInput[]
    createMany?: AnimeRelationCreateManyToInputEnvelope
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
  }

  export type AnimeRelationUncheckedCreateNestedManyWithoutFromInput = {
    create?: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput> | AnimeRelationCreateWithoutFromInput[] | AnimeRelationUncheckedCreateWithoutFromInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutFromInput | AnimeRelationCreateOrConnectWithoutFromInput[]
    createMany?: AnimeRelationCreateManyFromInputEnvelope
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
  }

  export type AnimeGenreUncheckedCreateNestedManyWithoutAnimeInput = {
    create?: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput> | AnimeGenreCreateWithoutAnimeInput[] | AnimeGenreUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeGenreCreateOrConnectWithoutAnimeInput | AnimeGenreCreateOrConnectWithoutAnimeInput[]
    createMany?: AnimeGenreCreateManyAnimeInputEnvelope
    connect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
  }

  export type AnimeTagUncheckedCreateNestedManyWithoutAnimeInput = {
    create?: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput> | AnimeTagCreateWithoutAnimeInput[] | AnimeTagUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeTagCreateOrConnectWithoutAnimeInput | AnimeTagCreateOrConnectWithoutAnimeInput[]
    createMany?: AnimeTagCreateManyAnimeInputEnvelope
    connect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AnimeRelationUpdateManyWithoutToNestedInput = {
    create?: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput> | AnimeRelationCreateWithoutToInput[] | AnimeRelationUncheckedCreateWithoutToInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutToInput | AnimeRelationCreateOrConnectWithoutToInput[]
    upsert?: AnimeRelationUpsertWithWhereUniqueWithoutToInput | AnimeRelationUpsertWithWhereUniqueWithoutToInput[]
    createMany?: AnimeRelationCreateManyToInputEnvelope
    set?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    disconnect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    delete?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    update?: AnimeRelationUpdateWithWhereUniqueWithoutToInput | AnimeRelationUpdateWithWhereUniqueWithoutToInput[]
    updateMany?: AnimeRelationUpdateManyWithWhereWithoutToInput | AnimeRelationUpdateManyWithWhereWithoutToInput[]
    deleteMany?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
  }

  export type AnimeRelationUpdateManyWithoutFromNestedInput = {
    create?: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput> | AnimeRelationCreateWithoutFromInput[] | AnimeRelationUncheckedCreateWithoutFromInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutFromInput | AnimeRelationCreateOrConnectWithoutFromInput[]
    upsert?: AnimeRelationUpsertWithWhereUniqueWithoutFromInput | AnimeRelationUpsertWithWhereUniqueWithoutFromInput[]
    createMany?: AnimeRelationCreateManyFromInputEnvelope
    set?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    disconnect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    delete?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    update?: AnimeRelationUpdateWithWhereUniqueWithoutFromInput | AnimeRelationUpdateWithWhereUniqueWithoutFromInput[]
    updateMany?: AnimeRelationUpdateManyWithWhereWithoutFromInput | AnimeRelationUpdateManyWithWhereWithoutFromInput[]
    deleteMany?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
  }

  export type AnimeGenreUpdateManyWithoutAnimeNestedInput = {
    create?: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput> | AnimeGenreCreateWithoutAnimeInput[] | AnimeGenreUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeGenreCreateOrConnectWithoutAnimeInput | AnimeGenreCreateOrConnectWithoutAnimeInput[]
    upsert?: AnimeGenreUpsertWithWhereUniqueWithoutAnimeInput | AnimeGenreUpsertWithWhereUniqueWithoutAnimeInput[]
    createMany?: AnimeGenreCreateManyAnimeInputEnvelope
    set?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    disconnect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    delete?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    connect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    update?: AnimeGenreUpdateWithWhereUniqueWithoutAnimeInput | AnimeGenreUpdateWithWhereUniqueWithoutAnimeInput[]
    updateMany?: AnimeGenreUpdateManyWithWhereWithoutAnimeInput | AnimeGenreUpdateManyWithWhereWithoutAnimeInput[]
    deleteMany?: AnimeGenreScalarWhereInput | AnimeGenreScalarWhereInput[]
  }

  export type AnimeTagUpdateManyWithoutAnimeNestedInput = {
    create?: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput> | AnimeTagCreateWithoutAnimeInput[] | AnimeTagUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeTagCreateOrConnectWithoutAnimeInput | AnimeTagCreateOrConnectWithoutAnimeInput[]
    upsert?: AnimeTagUpsertWithWhereUniqueWithoutAnimeInput | AnimeTagUpsertWithWhereUniqueWithoutAnimeInput[]
    createMany?: AnimeTagCreateManyAnimeInputEnvelope
    set?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    disconnect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    delete?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    connect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    update?: AnimeTagUpdateWithWhereUniqueWithoutAnimeInput | AnimeTagUpdateWithWhereUniqueWithoutAnimeInput[]
    updateMany?: AnimeTagUpdateManyWithWhereWithoutAnimeInput | AnimeTagUpdateManyWithWhereWithoutAnimeInput[]
    deleteMany?: AnimeTagScalarWhereInput | AnimeTagScalarWhereInput[]
  }

  export type AnimeRelationUncheckedUpdateManyWithoutToNestedInput = {
    create?: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput> | AnimeRelationCreateWithoutToInput[] | AnimeRelationUncheckedCreateWithoutToInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutToInput | AnimeRelationCreateOrConnectWithoutToInput[]
    upsert?: AnimeRelationUpsertWithWhereUniqueWithoutToInput | AnimeRelationUpsertWithWhereUniqueWithoutToInput[]
    createMany?: AnimeRelationCreateManyToInputEnvelope
    set?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    disconnect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    delete?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    update?: AnimeRelationUpdateWithWhereUniqueWithoutToInput | AnimeRelationUpdateWithWhereUniqueWithoutToInput[]
    updateMany?: AnimeRelationUpdateManyWithWhereWithoutToInput | AnimeRelationUpdateManyWithWhereWithoutToInput[]
    deleteMany?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
  }

  export type AnimeRelationUncheckedUpdateManyWithoutFromNestedInput = {
    create?: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput> | AnimeRelationCreateWithoutFromInput[] | AnimeRelationUncheckedCreateWithoutFromInput[]
    connectOrCreate?: AnimeRelationCreateOrConnectWithoutFromInput | AnimeRelationCreateOrConnectWithoutFromInput[]
    upsert?: AnimeRelationUpsertWithWhereUniqueWithoutFromInput | AnimeRelationUpsertWithWhereUniqueWithoutFromInput[]
    createMany?: AnimeRelationCreateManyFromInputEnvelope
    set?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    disconnect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    delete?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    connect?: AnimeRelationWhereUniqueInput | AnimeRelationWhereUniqueInput[]
    update?: AnimeRelationUpdateWithWhereUniqueWithoutFromInput | AnimeRelationUpdateWithWhereUniqueWithoutFromInput[]
    updateMany?: AnimeRelationUpdateManyWithWhereWithoutFromInput | AnimeRelationUpdateManyWithWhereWithoutFromInput[]
    deleteMany?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
  }

  export type AnimeGenreUncheckedUpdateManyWithoutAnimeNestedInput = {
    create?: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput> | AnimeGenreCreateWithoutAnimeInput[] | AnimeGenreUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeGenreCreateOrConnectWithoutAnimeInput | AnimeGenreCreateOrConnectWithoutAnimeInput[]
    upsert?: AnimeGenreUpsertWithWhereUniqueWithoutAnimeInput | AnimeGenreUpsertWithWhereUniqueWithoutAnimeInput[]
    createMany?: AnimeGenreCreateManyAnimeInputEnvelope
    set?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    disconnect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    delete?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    connect?: AnimeGenreWhereUniqueInput | AnimeGenreWhereUniqueInput[]
    update?: AnimeGenreUpdateWithWhereUniqueWithoutAnimeInput | AnimeGenreUpdateWithWhereUniqueWithoutAnimeInput[]
    updateMany?: AnimeGenreUpdateManyWithWhereWithoutAnimeInput | AnimeGenreUpdateManyWithWhereWithoutAnimeInput[]
    deleteMany?: AnimeGenreScalarWhereInput | AnimeGenreScalarWhereInput[]
  }

  export type AnimeTagUncheckedUpdateManyWithoutAnimeNestedInput = {
    create?: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput> | AnimeTagCreateWithoutAnimeInput[] | AnimeTagUncheckedCreateWithoutAnimeInput[]
    connectOrCreate?: AnimeTagCreateOrConnectWithoutAnimeInput | AnimeTagCreateOrConnectWithoutAnimeInput[]
    upsert?: AnimeTagUpsertWithWhereUniqueWithoutAnimeInput | AnimeTagUpsertWithWhereUniqueWithoutAnimeInput[]
    createMany?: AnimeTagCreateManyAnimeInputEnvelope
    set?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    disconnect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    delete?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    connect?: AnimeTagWhereUniqueInput | AnimeTagWhereUniqueInput[]
    update?: AnimeTagUpdateWithWhereUniqueWithoutAnimeInput | AnimeTagUpdateWithWhereUniqueWithoutAnimeInput[]
    updateMany?: AnimeTagUpdateManyWithWhereWithoutAnimeInput | AnimeTagUpdateManyWithWhereWithoutAnimeInput[]
    deleteMany?: AnimeTagScalarWhereInput | AnimeTagScalarWhereInput[]
  }

  export type AnimeCreateNestedOneWithoutGenresInput = {
    create?: XOR<AnimeCreateWithoutGenresInput, AnimeUncheckedCreateWithoutGenresInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutGenresInput
    connect?: AnimeWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type AnimeUpdateOneRequiredWithoutGenresNestedInput = {
    create?: XOR<AnimeCreateWithoutGenresInput, AnimeUncheckedCreateWithoutGenresInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutGenresInput
    upsert?: AnimeUpsertWithoutGenresInput
    connect?: AnimeWhereUniqueInput
    update?: XOR<XOR<AnimeUpdateToOneWithWhereWithoutGenresInput, AnimeUpdateWithoutGenresInput>, AnimeUncheckedUpdateWithoutGenresInput>
  }

  export type AnimeCreateNestedOneWithoutTagsInput = {
    create?: XOR<AnimeCreateWithoutTagsInput, AnimeUncheckedCreateWithoutTagsInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutTagsInput
    connect?: AnimeWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type AnimeUpdateOneRequiredWithoutTagsNestedInput = {
    create?: XOR<AnimeCreateWithoutTagsInput, AnimeUncheckedCreateWithoutTagsInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutTagsInput
    upsert?: AnimeUpsertWithoutTagsInput
    connect?: AnimeWhereUniqueInput
    update?: XOR<XOR<AnimeUpdateToOneWithWhereWithoutTagsInput, AnimeUpdateWithoutTagsInput>, AnimeUncheckedUpdateWithoutTagsInput>
  }

  export type AnimeCreateNestedOneWithoutRelationsFromInput = {
    create?: XOR<AnimeCreateWithoutRelationsFromInput, AnimeUncheckedCreateWithoutRelationsFromInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutRelationsFromInput
    connect?: AnimeWhereUniqueInput
  }

  export type AnimeCreateNestedOneWithoutRelationsToInput = {
    create?: XOR<AnimeCreateWithoutRelationsToInput, AnimeUncheckedCreateWithoutRelationsToInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutRelationsToInput
    connect?: AnimeWhereUniqueInput
  }

  export type AnimeUpdateOneRequiredWithoutRelationsFromNestedInput = {
    create?: XOR<AnimeCreateWithoutRelationsFromInput, AnimeUncheckedCreateWithoutRelationsFromInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutRelationsFromInput
    upsert?: AnimeUpsertWithoutRelationsFromInput
    connect?: AnimeWhereUniqueInput
    update?: XOR<XOR<AnimeUpdateToOneWithWhereWithoutRelationsFromInput, AnimeUpdateWithoutRelationsFromInput>, AnimeUncheckedUpdateWithoutRelationsFromInput>
  }

  export type AnimeUpdateOneRequiredWithoutRelationsToNestedInput = {
    create?: XOR<AnimeCreateWithoutRelationsToInput, AnimeUncheckedCreateWithoutRelationsToInput>
    connectOrCreate?: AnimeCreateOrConnectWithoutRelationsToInput
    upsert?: AnimeUpsertWithoutRelationsToInput
    connect?: AnimeWhereUniqueInput
    update?: XOR<XOR<AnimeUpdateToOneWithWhereWithoutRelationsToInput, AnimeUpdateWithoutRelationsToInput>, AnimeUncheckedUpdateWithoutRelationsToInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type AnimeRelationCreateWithoutToInput = {
    relationType: string
    from: AnimeCreateNestedOneWithoutRelationsFromInput
  }

  export type AnimeRelationUncheckedCreateWithoutToInput = {
    id?: number
    fromId: number
    relationType: string
  }

  export type AnimeRelationCreateOrConnectWithoutToInput = {
    where: AnimeRelationWhereUniqueInput
    create: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput>
  }

  export type AnimeRelationCreateManyToInputEnvelope = {
    data: AnimeRelationCreateManyToInput | AnimeRelationCreateManyToInput[]
  }

  export type AnimeRelationCreateWithoutFromInput = {
    relationType: string
    to: AnimeCreateNestedOneWithoutRelationsToInput
  }

  export type AnimeRelationUncheckedCreateWithoutFromInput = {
    id?: number
    toId: number
    relationType: string
  }

  export type AnimeRelationCreateOrConnectWithoutFromInput = {
    where: AnimeRelationWhereUniqueInput
    create: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput>
  }

  export type AnimeRelationCreateManyFromInputEnvelope = {
    data: AnimeRelationCreateManyFromInput | AnimeRelationCreateManyFromInput[]
  }

  export type AnimeGenreCreateWithoutAnimeInput = {
    name: string
  }

  export type AnimeGenreUncheckedCreateWithoutAnimeInput = {
    id?: number
    name: string
  }

  export type AnimeGenreCreateOrConnectWithoutAnimeInput = {
    where: AnimeGenreWhereUniqueInput
    create: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput>
  }

  export type AnimeGenreCreateManyAnimeInputEnvelope = {
    data: AnimeGenreCreateManyAnimeInput | AnimeGenreCreateManyAnimeInput[]
  }

  export type AnimeTagCreateWithoutAnimeInput = {
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
  }

  export type AnimeTagUncheckedCreateWithoutAnimeInput = {
    id?: number
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
  }

  export type AnimeTagCreateOrConnectWithoutAnimeInput = {
    where: AnimeTagWhereUniqueInput
    create: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput>
  }

  export type AnimeTagCreateManyAnimeInputEnvelope = {
    data: AnimeTagCreateManyAnimeInput | AnimeTagCreateManyAnimeInput[]
  }

  export type AnimeRelationUpsertWithWhereUniqueWithoutToInput = {
    where: AnimeRelationWhereUniqueInput
    update: XOR<AnimeRelationUpdateWithoutToInput, AnimeRelationUncheckedUpdateWithoutToInput>
    create: XOR<AnimeRelationCreateWithoutToInput, AnimeRelationUncheckedCreateWithoutToInput>
  }

  export type AnimeRelationUpdateWithWhereUniqueWithoutToInput = {
    where: AnimeRelationWhereUniqueInput
    data: XOR<AnimeRelationUpdateWithoutToInput, AnimeRelationUncheckedUpdateWithoutToInput>
  }

  export type AnimeRelationUpdateManyWithWhereWithoutToInput = {
    where: AnimeRelationScalarWhereInput
    data: XOR<AnimeRelationUpdateManyMutationInput, AnimeRelationUncheckedUpdateManyWithoutToInput>
  }

  export type AnimeRelationScalarWhereInput = {
    AND?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
    OR?: AnimeRelationScalarWhereInput[]
    NOT?: AnimeRelationScalarWhereInput | AnimeRelationScalarWhereInput[]
    id?: IntFilter<"AnimeRelation"> | number
    fromId?: IntFilter<"AnimeRelation"> | number
    toId?: IntFilter<"AnimeRelation"> | number
    relationType?: StringFilter<"AnimeRelation"> | string
  }

  export type AnimeRelationUpsertWithWhereUniqueWithoutFromInput = {
    where: AnimeRelationWhereUniqueInput
    update: XOR<AnimeRelationUpdateWithoutFromInput, AnimeRelationUncheckedUpdateWithoutFromInput>
    create: XOR<AnimeRelationCreateWithoutFromInput, AnimeRelationUncheckedCreateWithoutFromInput>
  }

  export type AnimeRelationUpdateWithWhereUniqueWithoutFromInput = {
    where: AnimeRelationWhereUniqueInput
    data: XOR<AnimeRelationUpdateWithoutFromInput, AnimeRelationUncheckedUpdateWithoutFromInput>
  }

  export type AnimeRelationUpdateManyWithWhereWithoutFromInput = {
    where: AnimeRelationScalarWhereInput
    data: XOR<AnimeRelationUpdateManyMutationInput, AnimeRelationUncheckedUpdateManyWithoutFromInput>
  }

  export type AnimeGenreUpsertWithWhereUniqueWithoutAnimeInput = {
    where: AnimeGenreWhereUniqueInput
    update: XOR<AnimeGenreUpdateWithoutAnimeInput, AnimeGenreUncheckedUpdateWithoutAnimeInput>
    create: XOR<AnimeGenreCreateWithoutAnimeInput, AnimeGenreUncheckedCreateWithoutAnimeInput>
  }

  export type AnimeGenreUpdateWithWhereUniqueWithoutAnimeInput = {
    where: AnimeGenreWhereUniqueInput
    data: XOR<AnimeGenreUpdateWithoutAnimeInput, AnimeGenreUncheckedUpdateWithoutAnimeInput>
  }

  export type AnimeGenreUpdateManyWithWhereWithoutAnimeInput = {
    where: AnimeGenreScalarWhereInput
    data: XOR<AnimeGenreUpdateManyMutationInput, AnimeGenreUncheckedUpdateManyWithoutAnimeInput>
  }

  export type AnimeGenreScalarWhereInput = {
    AND?: AnimeGenreScalarWhereInput | AnimeGenreScalarWhereInput[]
    OR?: AnimeGenreScalarWhereInput[]
    NOT?: AnimeGenreScalarWhereInput | AnimeGenreScalarWhereInput[]
    id?: IntFilter<"AnimeGenre"> | number
    animeId?: IntFilter<"AnimeGenre"> | number
    name?: StringFilter<"AnimeGenre"> | string
  }

  export type AnimeTagUpsertWithWhereUniqueWithoutAnimeInput = {
    where: AnimeTagWhereUniqueInput
    update: XOR<AnimeTagUpdateWithoutAnimeInput, AnimeTagUncheckedUpdateWithoutAnimeInput>
    create: XOR<AnimeTagCreateWithoutAnimeInput, AnimeTagUncheckedCreateWithoutAnimeInput>
  }

  export type AnimeTagUpdateWithWhereUniqueWithoutAnimeInput = {
    where: AnimeTagWhereUniqueInput
    data: XOR<AnimeTagUpdateWithoutAnimeInput, AnimeTagUncheckedUpdateWithoutAnimeInput>
  }

  export type AnimeTagUpdateManyWithWhereWithoutAnimeInput = {
    where: AnimeTagScalarWhereInput
    data: XOR<AnimeTagUpdateManyMutationInput, AnimeTagUncheckedUpdateManyWithoutAnimeInput>
  }

  export type AnimeTagScalarWhereInput = {
    AND?: AnimeTagScalarWhereInput | AnimeTagScalarWhereInput[]
    OR?: AnimeTagScalarWhereInput[]
    NOT?: AnimeTagScalarWhereInput | AnimeTagScalarWhereInput[]
    id?: IntFilter<"AnimeTag"> | number
    animeId?: IntFilter<"AnimeTag"> | number
    tagId?: IntFilter<"AnimeTag"> | number
    name?: StringFilter<"AnimeTag"> | string
    rank?: IntNullableFilter<"AnimeTag"> | number | null
    isAdult?: BoolFilter<"AnimeTag"> | boolean
  }

  export type AnimeCreateWithoutGenresInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationCreateNestedManyWithoutFromInput
    tags?: AnimeTagCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUncheckedCreateWithoutGenresInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationUncheckedCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationUncheckedCreateNestedManyWithoutFromInput
    tags?: AnimeTagUncheckedCreateNestedManyWithoutAnimeInput
  }

  export type AnimeCreateOrConnectWithoutGenresInput = {
    where: AnimeWhereUniqueInput
    create: XOR<AnimeCreateWithoutGenresInput, AnimeUncheckedCreateWithoutGenresInput>
  }

  export type AnimeUpsertWithoutGenresInput = {
    update: XOR<AnimeUpdateWithoutGenresInput, AnimeUncheckedUpdateWithoutGenresInput>
    create: XOR<AnimeCreateWithoutGenresInput, AnimeUncheckedCreateWithoutGenresInput>
    where?: AnimeWhereInput
  }

  export type AnimeUpdateToOneWithWhereWithoutGenresInput = {
    where?: AnimeWhereInput
    data: XOR<AnimeUpdateWithoutGenresInput, AnimeUncheckedUpdateWithoutGenresInput>
  }

  export type AnimeUpdateWithoutGenresInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUpdateManyWithoutFromNestedInput
    tags?: AnimeTagUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUncheckedUpdateWithoutGenresInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUncheckedUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUncheckedUpdateManyWithoutFromNestedInput
    tags?: AnimeTagUncheckedUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeCreateWithoutTagsInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationCreateNestedManyWithoutFromInput
    genres?: AnimeGenreCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUncheckedCreateWithoutTagsInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationUncheckedCreateNestedManyWithoutToInput
    relationsFrom?: AnimeRelationUncheckedCreateNestedManyWithoutFromInput
    genres?: AnimeGenreUncheckedCreateNestedManyWithoutAnimeInput
  }

  export type AnimeCreateOrConnectWithoutTagsInput = {
    where: AnimeWhereUniqueInput
    create: XOR<AnimeCreateWithoutTagsInput, AnimeUncheckedCreateWithoutTagsInput>
  }

  export type AnimeUpsertWithoutTagsInput = {
    update: XOR<AnimeUpdateWithoutTagsInput, AnimeUncheckedUpdateWithoutTagsInput>
    create: XOR<AnimeCreateWithoutTagsInput, AnimeUncheckedCreateWithoutTagsInput>
    where?: AnimeWhereInput
  }

  export type AnimeUpdateToOneWithWhereWithoutTagsInput = {
    where?: AnimeWhereInput
    data: XOR<AnimeUpdateWithoutTagsInput, AnimeUncheckedUpdateWithoutTagsInput>
  }

  export type AnimeUpdateWithoutTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUncheckedUpdateWithoutTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUncheckedUpdateManyWithoutToNestedInput
    relationsFrom?: AnimeRelationUncheckedUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUncheckedUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeCreateWithoutRelationsFromInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationCreateNestedManyWithoutToInput
    genres?: AnimeGenreCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUncheckedCreateWithoutRelationsFromInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsTo?: AnimeRelationUncheckedCreateNestedManyWithoutToInput
    genres?: AnimeGenreUncheckedCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagUncheckedCreateNestedManyWithoutAnimeInput
  }

  export type AnimeCreateOrConnectWithoutRelationsFromInput = {
    where: AnimeWhereUniqueInput
    create: XOR<AnimeCreateWithoutRelationsFromInput, AnimeUncheckedCreateWithoutRelationsFromInput>
  }

  export type AnimeCreateWithoutRelationsToInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsFrom?: AnimeRelationCreateNestedManyWithoutFromInput
    genres?: AnimeGenreCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagCreateNestedManyWithoutAnimeInput
  }

  export type AnimeUncheckedCreateWithoutRelationsToInput = {
    id: number
    titleEn?: string | null
    titleRo?: string | null
    cover?: string | null
    format?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dataHash?: string | null
    relationsFrom?: AnimeRelationUncheckedCreateNestedManyWithoutFromInput
    genres?: AnimeGenreUncheckedCreateNestedManyWithoutAnimeInput
    tags?: AnimeTagUncheckedCreateNestedManyWithoutAnimeInput
  }

  export type AnimeCreateOrConnectWithoutRelationsToInput = {
    where: AnimeWhereUniqueInput
    create: XOR<AnimeCreateWithoutRelationsToInput, AnimeUncheckedCreateWithoutRelationsToInput>
  }

  export type AnimeUpsertWithoutRelationsFromInput = {
    update: XOR<AnimeUpdateWithoutRelationsFromInput, AnimeUncheckedUpdateWithoutRelationsFromInput>
    create: XOR<AnimeCreateWithoutRelationsFromInput, AnimeUncheckedCreateWithoutRelationsFromInput>
    where?: AnimeWhereInput
  }

  export type AnimeUpdateToOneWithWhereWithoutRelationsFromInput = {
    where?: AnimeWhereInput
    data: XOR<AnimeUpdateWithoutRelationsFromInput, AnimeUncheckedUpdateWithoutRelationsFromInput>
  }

  export type AnimeUpdateWithoutRelationsFromInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUpdateManyWithoutToNestedInput
    genres?: AnimeGenreUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUncheckedUpdateWithoutRelationsFromInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsTo?: AnimeRelationUncheckedUpdateManyWithoutToNestedInput
    genres?: AnimeGenreUncheckedUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUncheckedUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUpsertWithoutRelationsToInput = {
    update: XOR<AnimeUpdateWithoutRelationsToInput, AnimeUncheckedUpdateWithoutRelationsToInput>
    create: XOR<AnimeCreateWithoutRelationsToInput, AnimeUncheckedCreateWithoutRelationsToInput>
    where?: AnimeWhereInput
  }

  export type AnimeUpdateToOneWithWhereWithoutRelationsToInput = {
    where?: AnimeWhereInput
    data: XOR<AnimeUpdateWithoutRelationsToInput, AnimeUncheckedUpdateWithoutRelationsToInput>
  }

  export type AnimeUpdateWithoutRelationsToInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsFrom?: AnimeRelationUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeUncheckedUpdateWithoutRelationsToInput = {
    id?: IntFieldUpdateOperationsInput | number
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    titleRo?: NullableStringFieldUpdateOperationsInput | string | null
    cover?: NullableStringFieldUpdateOperationsInput | string | null
    format?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: NullableStringFieldUpdateOperationsInput | string | null
    relationsFrom?: AnimeRelationUncheckedUpdateManyWithoutFromNestedInput
    genres?: AnimeGenreUncheckedUpdateManyWithoutAnimeNestedInput
    tags?: AnimeTagUncheckedUpdateManyWithoutAnimeNestedInput
  }

  export type AnimeRelationCreateManyToInput = {
    id?: number
    fromId: number
    relationType: string
  }

  export type AnimeRelationCreateManyFromInput = {
    id?: number
    toId: number
    relationType: string
  }

  export type AnimeGenreCreateManyAnimeInput = {
    id?: number
    name: string
  }

  export type AnimeTagCreateManyAnimeInput = {
    id?: number
    tagId: number
    name: string
    rank?: number | null
    isAdult: boolean
  }

  export type AnimeRelationUpdateWithoutToInput = {
    relationType?: StringFieldUpdateOperationsInput | string
    from?: AnimeUpdateOneRequiredWithoutRelationsFromNestedInput
  }

  export type AnimeRelationUncheckedUpdateWithoutToInput = {
    id?: IntFieldUpdateOperationsInput | number
    fromId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeRelationUncheckedUpdateManyWithoutToInput = {
    id?: IntFieldUpdateOperationsInput | number
    fromId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeRelationUpdateWithoutFromInput = {
    relationType?: StringFieldUpdateOperationsInput | string
    to?: AnimeUpdateOneRequiredWithoutRelationsToNestedInput
  }

  export type AnimeRelationUncheckedUpdateWithoutFromInput = {
    id?: IntFieldUpdateOperationsInput | number
    toId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeRelationUncheckedUpdateManyWithoutFromInput = {
    id?: IntFieldUpdateOperationsInput | number
    toId?: IntFieldUpdateOperationsInput | number
    relationType?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeGenreUpdateWithoutAnimeInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeGenreUncheckedUpdateWithoutAnimeInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeGenreUncheckedUpdateManyWithoutAnimeInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AnimeTagUpdateWithoutAnimeInput = {
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AnimeTagUncheckedUpdateWithoutAnimeInput = {
    id?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AnimeTagUncheckedUpdateManyWithoutAnimeInput = {
    id?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rank?: NullableIntFieldUpdateOperationsInput | number | null
    isAdult?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}