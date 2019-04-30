
/// <reference types="node" />

declare module 'express-cassandra' {
    export function uuid(): string;
    export function uuidFromString(str: string): any;

    export const driver: any;
    //export let instance: ExpressCassandraInstance;

    export function createClient(options: ExpressCassandraCreateClientOptions): ExpressCassandraClient;

    export interface ClientOptions {
        contactPoints: Array<string>
        keyspace?: string;
        refreshSchemaDelay?: number;
        isMetadataSyncEnabled?: boolean;
        prepareOnAllHosts?: boolean;
        rePrepareOnUp?: boolean;
        maxPrepared?: number;
        policies?: {
            loadBalancing?: LoadBalancingPolicy;
            retry?: RetryPolicy;
            reconnection?: ReconnectionPolicy;
            addressResolution?: AddressTranslator;
            speculativeExecution?: SpeculativeExecutionPolicy;
            timestampGeneration?: TimestampGenerator;
        }
        queryOptions?: QueryOptions;
        pooling?: {
            heartBeatInterval?: number;
            coreConnectionsPerHost?: {};
            warmup?: boolean;
        }
        protocolOptions?: {
            port?: number;
            maxSchemaAgreementWaitSeconds?: number;
            maxVersion?: number;
        }
        socketOptions?: {
            connectTimeout?: number;
            defunctReadTimeoutThreshold?: number;
            keepAlive?: boolean;
            keepAliveDelay?: number;
            readTimeout?: number;
            tcpNoDelay?: boolean;
            coalescingThreshold?: number;
        }
        authProvider?: AuthProvider;
        sslOptions?: {};
        encoding?: {
            map?: Function;
            set?: Function;
            copyBuffer?:boolean;
            useUndefinedAsUnset?:boolean;
        }
        profiles?: Array<ExecutionProfile>;
        promiseFactory?: Function;
    }

    export interface ExpressCassandraCreateClientOptions {
        clientOptions: ClientOptions;
        ormOptions: {
            defaultReplicationStrategy?: {
                class: 'SimpleStrategy' | 'NetworkTopologyStrategy';
                replication_factor: number;
            };
            migration?: 'safe' | 'drop' | 'alter';
            disableTTYConfirmation?: boolean;
            createKeyspace?: boolean;
            createTable?: boolean;
        }
    }

    export interface ResultSet {
        info: {
            queriedHost: string,
           triedHosts: { [key: string]: any },
           speculativeExecutions: number,
           achievedConsistency: number,
           traceId: any,
           warnings: string,
           customPayload: string
        },
        rows: Array<{ '[applied]': boolean }>;
        rowLength: number;
        columns: Array<{ name: string, type: object }>;
        pageState: any;
        nextPage: any;
    }
    // export class ExpressCassandraInstance {
    //     [key: string]: ExpressCassandraSearch;
    // }


    export class ExpressCassandraPageModel {
        pageState: string;
    }

    export interface ExpressCassandraQuery {
        query: string;
        params: QueryParameter;
        after_hook: Function;
    }

    export interface QueryObject {
        /** order results by */
        $orderby?: {
            $asc?: string,
            $desc?: string,
        };
        /** group results by a certain field or list of fields */
        $groupby?: Array<string>;
        /** limit the result set to x    rows */
        $limit?: number;
        /** use custom index expressions */
        $expr?: {
            /** index name */
            index: string;
            /** custom expr query */
            query: string;
        }
        /** using dse search */
        $solr_query?: string;
        /** additional other filters */
        [key: string]: string | {[key in Filters]: any} | {[key:string]: QueryObject} | any;
    }

    export class QueryParameter {
        return_query?: boolean;
        raw?: boolean;
        ttl?: number;
        conditions?: any;
        if_exists?: boolean;
        if_not_exist?: boolean;
        distinct?: boolean;
        materialized_view?: string;
        allow_filtering?: boolean;
        fetchSize?: number;
        select?: Array<string>;
    }

    export interface Validator {
        validator: (value: any) => boolean;
        message: string;
    }

    export interface ModelSchemaFieldConfiguration {
        type: DbFieldTypes;
        virtuel?: {
            get: () => any;
            set: (value: any) => void;
        }
        default?: Function | string | {'$db_function': string};
        rule?: Function | Validator
    }

    export interface ClusteringOrder {
        [key: string]: 'asc' | 'desc';
    }

    export type Filter = {
        [key in Filters]: any;
    };

    export interface CustomIndexes {
        on: string;
        using: string;
        options: {};
    }

    export interface MaterializedView {
        select: Array<string>;
        key: Array<string>;
        clustering_order: ClusteringOrder;
        filters: {
            [field: string]: Filter;
        }
    }

    export interface ModelSchema {
        fields: {
            [key: string]: DbFieldTypes | ModelSchemaFieldConfiguration;
        };
        /** primary and combined keys (first partition key, rest clustering keys) */
        key: Array<string | Array<string>>;
        /** data order for the cluster */
        clustering_order?: ClusteringOrder;
        /** query views for the table */
        materialized_views?: {
            [viewName: string]: MaterializedView
        };
        /** indexed fields for faster search */
        indexes?: Array<string>;
        /** customized indexes in the database */
        custom_indexes?: Array<CustomIndexes>;
        /** table name for the database */
        table_name: string;
        /** methods for this model */
        methods?: {
            /** methods for this model */
            [functionName: string]: Function | undefined;
            /** triggered before saving the model */
            before_save?: (model: ExpressCassandraModel, options: QueryParameter) => boolean;
            /** triggered after saving the model */
            after_save?: (model: ExpressCassandraModel, options: QueryParameter) => boolean;

            /** triggered before updating the model */
            before_update?: (queryObject: QueryObject, updateValue: {}, options: QueryParameter) => boolean;
            /** triggered after updating the model */
            after_update?: (queryObject: QueryObject, updateValue: {}, options: QueryParameter) => boolean;

            /** triggered before deleting the model */
            before_delete?: (queryObject: QueryObject, options: QueryParameter) => boolean;
            /** triggered after deleting the model */
            after_delete?: (queryObject: QueryObject, options: QueryParameter) => boolean;
        };
        /** options to manipulate the Model standards */
        options?: {
            /** timestamp fields for update and change */
            timestamps?: {
                /** timestamp for created is default at created_at */
                createdAt?: string;
                /** timestamp for update is default at updated_at */
                updatedAt?: string;
            }
            /** version definitions for changes */
            versions?: {
                /** default __v */
                key: string;
            }
        };
    }
    export class ExpressCassandraModel {
        constructor(data: any);

        update(queryObject: {}, updateValues: {}, options: {return_query: true} | QueryParameter, callback: (err: string) => void): ExpressCassandraQuery;
        update(queryObject: {}, updateValues: {}, options: {return_query: false} | QueryParameter, callback: (err: string) => void): {} | undefined;
        updateAsync(queryObject: {}, updateValues: {}, options: QueryParameter): Promise<ResultSet>;

        /**
         * sync model to database
         * @param callback receiving data interface
         */
        syncDB(callback: (err: string, result: boolean) => void): void;

        find<T = any>(query: QueryObject, callback: (err: any, result: Array<T>) => void): void;
        findAsync<T = any>(query: QueryObject): Promise<Array<T>>;
        find<T = any>(query: QueryObject, options: QueryParameter, callback: (err: any, result: Array<T>) => void): void;
        findAsync<T = any>(query: QueryObject, options: QueryParameter): Promise<Array<T>>;
        findOne<T = any>(query: QueryObject, callback: (err: any, result: T) => void): void;
        findOneAsync<T = any>(query: QueryObject): Promise<T>;
        findOne<T = any>(query: QueryObject, options: QueryParameter, callback: (err: any, result: T) => void): void;
        findOneAsync<T = any>(query: QueryObject, options: QueryParameter): Promise<T>;
        eachRow<T = any>(query: QueryObject, options: QueryParameter, eachRow: (index: number, row: T) => void, callback: (err: any, result: ExpressCassandraPageModel) => void): void;
        stream(query: QueryObject, options: QueryParameter, callback: (reader: any) => void): void;
        streamAsync(query: QueryObject, options: QueryParameter): Promise<any>;

        save(callback: (err: string) => void): void;
        saveAsync(): Promise<void>;
        save(options: {return_query: true} | QueryParameter, callback: (err: string) => void): ExpressCassandraQuery;
        save(options: {return_query: false} | QueryParameter, callback: (err: string) => void): {} | undefined;
        saveAsync(options: QueryParameter): Promise<void>;

        delete(callback: (err: string) => void): void;
        deleteAsync(): Promise<void>;
        delete(query: QueryObject, callback: (err: string) => void): ExpressCassandraQuery;
        delete(query: QueryObject, callback: (err: string) => void): {} | undefined;
        deleteAsync(query: QueryObject): Promise<void>;

        /** getter for data type */
        get_data_types(): any;
        /** getter for table name */
        get_table_name(): string;
        /** getter for table name */
        get_keyspace_name(): string;
        /** getter for table name */
        _get_default_value(): string;
        /** validate the property with the given value */
        validate(propertyName: string, value: any): true | string;
        /** return model as JSON */
        toJSON(): string;
        /** return the modified flag */
        isModified(): boolean;
    }


    export class ExpressCassandraClient {
        public instance: {
            [key: string]: ExpressCassandraModel;
        }
        static driver: {
            auth: {
                PlainTextAuthProvider: PlainTextAuthProvider;
            }
        }
        public loadSchema(modelName: string, schema: ModelSchema): ExpressCassandraClient;

        public doBatch(queries: Array<ExpressCassandraQuery>, options: QueryParameter, callback: Function): void;
        public doBatchAsync(): Promise<boolean>;
    }

    export type DbFieldTypes = 'ascii' | 'bigint' | 'blob' | 'boolean' | 'counter' | 'date' | 'decimal' | 'double' | 'float' | 'frozen' | 'inet' | 'int' | 'list' | 'map' | 'set' | 'smallint' | 'text' | 'time' | 'timestamp' | 'timeuuid' | 'tinyint' | 'tuple' | 'uuid' | 'varchar' | 'varint';
    export type Filters = '$eq:' | '$ne' | '$isnt' | '$gt' | '$lt' | '$gte' | '$lte' | '$in' | '$like' | '$token' | '$contains' | '$contains_key';


    export enum consistencies {
        one,
        two
    }





    /**
     * Provides Authenticator instances to be used when connecting to a host.
     */
    export class AuthProvider {
        /**
         * Returns an Authenticator instance to be used when connecting to a host.
         * @param endpoint The ip address and port number in the format ip:port
         * @param name Authenticator name
         */
        newAuthenticator(endpoint: string , name: string): Authenticator;
    }

    /**
     * Provides plain text Authenticator instances to be used when connecting to a host.
     */
    export class PlainTextAuthProvider extends AuthProvider {
        /**
         * Creates a new instance of the Authenticator provider
         *
         * Examples:
         *   var authProvider = new cassandra.auth.PlainTextAuthProvider('my_user', 'p@ssword1!');
         *   //Set the auth provider in the clientOptions when creating the Client instance
         *   var client = new Client({ contactPoints: contactPoints, authProvider: authProvider });
         * @param username User name in plain text
         * @param password Password in plain text
         */
        constructor(username: string, password: string);
    }

    /**
     * Handles SASL authentication with Cassandra servers.
     * Each time a new connection is created and the server requires authentication,
     * a new instance of this class will be created by the corresponding.
     */
    export class Authenticator {

        /**
         * Evaluates a challenge received from the Server. Generally, this method should callback with no error and no additional params when authentication is complete from the client perspective.
         * @param challenge
         * @param callback
         */
        evaluateChallenge(challenge: Buffer, callback: Function): void;

        /**
         * Obtain an initial response token for initializing the SASL handshake.
         * @param callback
         */
        initialResponse(callback: Function): void;

        /**
         * Called when authentication is successful with the last information optionally sent by the server.
         * @param token
         */
        onAuthenticationSuccess(token: Buffer): void;
    }
    export class HostMap {
        /** Removes all items from the map */
        clear(): Array<Host>;
        /** Executes a provided function once per map element. */
        forEach(callback: Function): void;
        /** Gets a host by key or undefined if not found. */
        get(key: string): Host | undefined;
        /** Returns an array of host addresses. */
        keys(): Array<string>;
        /** Removes an item from the map. */
        remove(key: string): void;
        /** Removes multiple hosts from the map. */
        removeMultiple(keys: Array<string>): void;
        /** Adds a new item to the map. */
        set(key: string, value: Host): void;
        /** Returns a shallow copy of the values of the map. */
        values(): Array<Host>;

        addListener(event: "add", listener: () => void): this;
        addListener(event: "remove", listener: () => void): this;

        emit(event: "add"): boolean;
        emit(event: "remove"): boolean;

        on(event: "add", listener: () => void): this;
        on(event: "remove", listener: () => void): this;

        once(event: "add", listener: () => void): this;
        once(event: "remove", listener: () => void): this;

        prependListener(event: "add", listener: () => void): this;
        prependListener(event: "remove", listener: () => void): this;

        prependOnceListener(event: "add", listener: () => void): this;
        prependOnceListener(event: "remove", listener: () => void): this;
    }

    export class Host {
        /** Gets ip address and port number of the node separated by :. */
        address: string;
        /** Gets string containing the Cassandra version. */
        cassandraVersion: string;
        /** Gets data center name of the node. */
        datacenter: string;
        /** Gets rack name of the node. */
        rack: string;
        /** Gets the tokens assigned to the node. */
        tokens: Array<string>;

        /** Determines if the host can be considered as UP */
        canBeConsideredAsUp(): boolean;
        /** Returns an array containing the Cassandra Version as an Array of Numbers having the major version in the first position. */
        getCassandraVersion(): Array<number>;
        /** Determines if the node is UP now (seen as UP by the driver). */
        isUp(): boolean;
    }

    /**
     * Base class for Load Balancing Policies
     */
    export class LoadBalancingPolicy {
        /**
         * Initializes the load balancing policy, called after the driver obtained the information of the cluster.
         */
        init (client: Client, hosts: HostMap, callback: Function): void;

        /**
         * Returns the distance assigned by this policy to the provided host.
         */
        getDistance(host: Host): any;

        /**
         * Returns an iterator with the hosts for a new query. Each new query will call this method.
         * The first host in the result will then be used to perform the query.
         *
         * @param keyspace Name of currently logged keyspace at Client level.
         * @param query OptionsOptions related to this query execution.
         * @param callback The function to be invoked with the error as first parameter and the host iterator as second parameter.
         */
        newQueryPlan(keyspace: string , queryOptions: QueryOptions | null, callback: Function): any
    }

    /** This policy yield nodes in a round-robin fashion. */
    export class RoundRobinPolicy extends LoadBalancingPolicy {

        /**
         * Returns an iterator with the hosts for a new query. Each new query will call this method.
         * The first host in the result will then be used to perform the query.
         *
         * @param keyspace Name of currently logged keyspace at Client level.
         * @param query OptionsOptions related to this query execution.
         * @param callback The function to be invoked with the error as first parameter and the host iterator as second parameter.
         */
        newQueryPlan(keyspace: string , queryOptions: QueryOptions | null, callback: Function): any
    }

    /**
     * A data-center aware Round-robin load balancing policy. This policy provides round-robin queries
     * over the node of the local data center. It also includes in the query plans returned a configurable
     * number of hosts in the remote data centers, but those are always tried after the local nodes.
     * In other words, this policy guarantees that no host in a remote data center will be queried unless
     * no host in the local data center can be reached.
     */
    export class DCAwareRoundRobinPolicy extends LoadBalancingPolicy {
        localHostsArray: Array<Host>;
        remoteHostsArray: Array<Host>;

        /**
         * @param localDc local datacenter name.
         * @param usedHostsPerRemoteDc the number of host per remote datacenter that the policy will yield \ in a newQueryPlan after the local nodes
         */
        constructor(localDc?: string, usedHostsPerRemoteDc?: number);

        /**
         * Returns an iterator with the hosts for a new query. Each new query will call this method.
         * The first host in the result will then be used to perform the query.
         *
         * @param keyspace Name of currently logged keyspace at Client level.
         * @param query OptionsOptions related to this query execution.
         * @param callback The function to be invoked with the error as first parameter and the host iterator as second parameter.
         */
        newQueryPlan(keyspace: string , queryOptions: QueryOptions | null, callback: Function): any
    }

    /**
     * A wrapper load balancing policy that add token awareness to a child policy..
     */
    export class TokenAwarePolicy extends LoadBalancingPolicy {

        constructor(childPolicy: LoadBalancingPolicy);
        /**
         * Returns an iterator with the hosts for a new query. Each new query will call this method.
         * The first host in the result will then be used to perform the query.
         *
         * @param keyspace Name of currently logged keyspace at Client level.
         * @param query OptionsOptions related to this query execution.
         * @param callback The function to be invoked with the error as first parameter and the host iterator as second parameter.
         */
        newQueryPlan(keyspace: string , queryOptions: QueryOptions | null, callback: Function): any
    }

    /**
     * A load balancing policy wrapper that ensure that only hosts from a provided white list will ever be returned.
     *
     * This policy wraps another load balancing policy and will delegate the choice of hosts to the wrapped policy
     * with the exception that only hosts contained in the white list provided when constructing this policy will
     * ever be returned. Any host not in the while list will be considered ignored and thus will not be connected to.
     *
     * This policy can be useful to ensure that the driver only connects to a predefined set of hosts. Keep in mind
     * however that this policy defeats somewhat the host auto-detection of the driver. As such, this policy is only
     * useful in a few special cases or for testing, but is not optimal in general. If all you want to do is limiting
     * connections to hosts of the local data-center then you should use DCAwareRoundRobinPolicy and not this policy
     * in particular.
     */
    export class WhiteListPolicy extends LoadBalancingPolicy {
        /**
         * Create a new policy that wraps the provided child policy but only “allow” hosts from the provided while list.
         * @param childPolicy the wrapped policy
         * @param whiteList the white listed hosts address in the format ipAddress:port. Only hosts from this list may get connected to (whether they will get connected to or not depends on the child policy).
         */
        constructor(childPolicy: LoadBalancingPolicy, whiteList: Array<string>);

        /**
         * Uses the child policy to return the distance to the host if included in the white list. Any host not in the while list will be considered ignored.
         */
        getDistance(host: Host): any;

        /**
         * Returns the hosts to use for a new query filtered by the white list.
         */
        newQueryPlan(): any
    }

     /**
     * Translates IP addresses received from Cassandra nodes into locally queryable addresses.
     *
     * The driver auto-detects new Cassandra nodes added to the cluster through server side pushed
     * notifications and through checking the system tables. For each node, the address received
     * will correspond to the address set as rpc_address in the node yaml file. In most case, this
     * is the correct address to use by the driver and that is what is used by default. However,
     * sometimes the addresses received through this mechanism will either not be reachable directly
     * by the driver or should not be the preferred address to use to reach the node (for instance,
     * the rpc_address set on Cassandra nodes might be a private IP, but some clients may have to
     * use a public IP, or pass by a router to reach that node). This interface allows to deal with
     * such cases, by allowing to translate an address as sent by a Cassandra node to another address
     * to be used by the driver for connection.
     *
     * Please note that the contact points addresses provided while creating the Client instance are
     * not “translated”, only IP address retrieve from or sent by Cassandra nodes to the driver are.
     */
    export class AddressTranslator {
        /**
         * Translates a Cassandra rpc_address to another address if necessary
         * @param address the address of a node as returned by Cassandra. Note that if the rpc_address of a node has been configured to 0.0.0.0 server side, then the provided address will be the node listen_address, not 0.0.0.0.
         * @param port The port number, as specified in the protocolOptions at Client instance creation (9042 by default).
         * @param callback Callback to invoke with endpoint as first parameter. The endpoint is an string composed of the IP address and the port number in the format ipAddress:port.
         */
        translate (address: string, port: number, callback: Function): void;
    }



    /**
     * Base class for Reconnection Policies
     */
    export class ReconnectionPolicy {
        /**
         * A new reconnection schedule.
         * @returns An infinite iterator
         */
        newSchedule(): any;
    }


    /**
     * A reconnection policy that waits a constant time between each reconnection attempt.
     */
    export class ConstantReconnectionPolicy extends ReconnectionPolicy {
        /**
         * A reconnection policy that waits a constant time between each reconnection attempt.
         *
         * @param delay Delay in ms
         */
        constructor(delay: number);
    }

    /**
     * A reconnection policy that waits exponentially longer between each reconnection attempt
     * (but keeps a constant delay once a maximum delay is reached).
     */
    export class ExponentialReconnectionPolicy extends ReconnectionPolicy {
        /**
         * A reconnection policy that waits exponentially longer between each reconnection attempt
         * (but keeps a constant delay once a maximum delay is reached).
         *
         * @param baseDelay Delay in ms that
         * @param maxDelay the maximum delay in ms to wait between two reconnection attempt
         * @param startWithNoDelay Determines if the first attempt should be zero delay
         */
        constructor(baseDelay: number, maxDelay: number, startWithNoDelay: boolean);
    }

    /**
     * The policy that decides if the driver will send speculative queries to the next hosts when the current host
     * takes too long to respond.
     *
     * Note that only idempotent statements will be speculatively retried.
     */
    export abstract class SpeculativeExecutionPolicy {
        /**
         * Initialization method that gets invoked on Client startup.
         * @param client Client
         */
        init(client: Client): void;

        /**
         * Gets the plan to use for a new query. Returns an object with a nextExecution() method,
         * which returns a positive number representing the amount of milliseconds to delay
         * the next execution or a non-negative number to avoid further executions.
         *
         * @param keyspace The currently logged keyspace.
         * @param queryInfo The query, or queries in the case of batches, for which to build a plan.
         */
        newPlan(keyspace: string, queryInfo: string | Array<string>): {nextExecution(): void};

        /**
         * Gets invoked at client shutdown, giving the opportunity to the implementor to perform cleanup.
         */
        shutdown(): void;
    }

    /**
     * A SpeculativeExecutionPolicy that never schedules speculative executions.
     */
    export class NoSpeculativeExecutionPolicy extends SpeculativeExecutionPolicy {
        /**
         * Creates a new instance of NoSpeculativeExecutionPolicy.
         */
        constructor();
    }

    /**
     * A SpeculativeExecutionPolicy that schedules a given number of speculative executions, separated by a fixed delay.
     */
    export class ConstantSpeculativeExecutionPolicy extends SpeculativeExecutionPolicy {
        /**
         * Creates a new instance of ConstantSpeculativeExecutionPolicy.
         * @param delay The delay between each speculative execution
         * @param maxSpeculativeExecutions The amount of speculative executions that should be scheduled after the initial execution. Must be strictly positive.
         */
        constructor(delay: number, maxSpeculativeExecutions: number);
    }


    /**
     * Generates client-side, microsecond-precision query timestamps.
     *
     * Given that Cassandra uses those timestamps to resolve conflicts,
     * implementations should generate monotonically increasing timestamps for successive
     * invocations of TimestampGenerator.next().
     */
    export class TimestampGenerator {
        /**
         * Creates a new instance of TimestampGenerator.
         */
        constructor();

        /**
         * Returns the next timestamp.
         *
         * Implementors should enforce increasing monotonicity of timestamps, that is, a timestamp returned
         * should always be strictly greater that any previously returned timestamp.
         *
         * Implementors should strive to achieve microsecond precision in the best possible way, which
         * is usually largely dependent on the underlying operating system’s capabilities.
         *
         * @param client The Client instance to generate timestamps to.
         * @returns the next timestamp (in microseconds). If it’s equals to null, it won’t be sent by the driver, letting the server to generate the timestamp.
         */
        next(client: Client): number | null;
    }


    /**
     * A timestamp generator that guarantees monotonically increasing timestamps
     * and logs warnings when timestamps drift in the future.
     *
     * Date has millisecond precision and client timestamps require microsecond precision.
     * This generator keeps track of the last generated timestamp, and if the current time is
     * within the same millisecond as the last, it fills the microsecond portion of the new timestamp
     * with the value of an incrementing counter.
     */
    export class MonotonicTimestampGenerator extends TimestampGenerator {
        /**
         * Creates a new instance of MonotonicTimestampGenerator.
         * @param warningThreshold Determines how far in the future timestamps are allowed to drift before a warning is logged, expressed in milliseconds. Default: 1000.
         * @param minLogInterval In case of multiple log events, it determines the time separation between log events, expressed in milliseconds. Use 0 to disable. Default: 1000.
         */
        constructor(warningThreshold?: number, minLogInterval?: number);

        /**
         * Returns the current time in milliseconds since UNIX epoch
         */
        getDate(): number;
    }

    /** Query options */
    export interface QueryOptions {
        /**
         * Determines if the driver must retrieve the following result pages automatically.
         *
         * This setting is only considered by the Client#eachRow() method. For more information,
         * check the paging results documentation.
         */
        autoPage?: boolean;

        /**
         * Determines if the stack trace before the query execution should be maintained.
         *
         * Useful for debugging purposes, it should be set to false under production environment
         * as it adds an unnecessary overhead to each execution.
         *
         * Default: false.
         */
        captureStackTrace?: boolean;

        /**
         * Consistency level. Default: localOne.
         */
        consistency?: number;

        /**
         * Key-value payload to be passed to the server. On the Cassandra side, implementations of
         * QueryHandler can use this data.
         */
        customPayload?: Object;

        /**
         * Name or instance of the profile to be used for this execution. If not set, it will the use
         * “default” execution profile.
         */
        executionProfile?: string | ExecutionProfile;

        /**
         * Amount of rows to retrieve per page.
         */
        fetchSize?: number;

        /**
         * Type hints for parameters given in the query, ordered as for the parameters.
         *
         * For batch queries, an array of such arrays, ordered as with the queries in the batch.
         */
        hints?: Array<string> | Array<Array<string>>;


        /**
         * Defines whether the query can be applied multiple times without changing the result
         * beyond the initial application.
         *
         * The query execution idempotence can be used at RetryPolicy level to determine
         * if an statement can be retried in case of request error or write timeout.
         *
         * Default: false.
         */
        isIdempotent?: boolean;

        /**
         * Specifies the keyspace for the query. Used for routing within the driver, this property is
         * suitable when the query operates on a different keyspace than the current keyspace.
         *
         * This property should only be set manually by the user when the query operates on a different
         * keyspace than the current keyspace and using either batch or non-prepared query executions.
         */
        keyspace?: string;

        /**
         * Determines if the batch should be written to the batchlog. Only valid for Client#batch(),
         * it will be ignored by other methods. Default: true.
         */
        logged?: boolean;

         /**
          * Buffer or string token representing the paging state.
          * Useful for manual paging, if provided, the query will be executed starting from a given paging state.
          */
        pageState?: Buffer | string;

        /**
         * Determines if the query must be executed as a prepared statement.
         */
        prepare?: boolean;

         /**
          * When defined, it overrides the default read timeout (socketOptions.readTimeout) in
          * milliseconds for this execution per coordinator.
          *
          * Suitable for statements for which the coordinator may allow a longer server-side timeout,
          * for example aggregation queries.
          *
          * A value of 0 disables client side read timeout for the execution. Default: undefined.
          */
        readTimeout?: number;

        /**
         * Retry policy for the query.
         * This property can be used to specify a different retry policy to the one specified in the ClientOptions.policies.
         */
        retry?: RetryPolicy;

        /**
         * Determines if the client should retry when it didn’t hear back from a host within
         * socketOptions.readTimeout. Default: true.
         */
        retryOnTimeout?: boolean;

         /**
          * Index of the parameters that are part of the partition key to determine the routing.
          */
        routingIndexes?: Array<string>;

         /**
          * Partition key(s) to determine which coordinator should be used for the query.
          */
        routingKey?: Buffer | Array<string>;

         /**
          * Array of the parameters names that are part of the partition key to determine the routing.
          */
        routingNames?: Array<string>;

         /**
          * Serial consistency is the consistency level for the serial phase of conditional updates. T
          * his option will be ignored for anything else that a conditional update/insert.
          */
        serialConsistency?: number;

         /**
          * The default timestamp for the query in microseconds from the unix epoch (00:00:00, January 1st, 1970).
          * If provided, this will replace the server side assigned timestamp as default timestamp.
          *
          * Use generateTimestamp() utility method to generate a valid timestamp based on a Date and microseconds parts.
          */
        timestamp?: number;

        /**
         * Enable query tracing for the execution. Use query tracing to diagnose performance problems
         * related to query executions. Default: false.
         * To retrieve trace, you can call Metadata.getTrace() method.
         */
        traceQuery?: boolean;
    }

    /**
     * Represents a set configurations to be used in a statement execution to be used for a single Client instance.
     * An ExecutionProfile instance should not be shared across different Client instances.
     */
    export class ExecutionProfile {
        /** Creates a new instance of ExecutionProfile */
        constructor(name?: string, options?: ExecutionProfile);

        /** Consistency level */
        consistency?: number;
        /** Load-balancing policy */
        loadBalancing?: LoadBalancingPolicy;
        /** Name of the execution profile */
        name?: string;
        /** Client read timeout */
        readTimeout?: number;
        /** Retry policy. */
        retry?: RetryPolicy;
        /** Serial consistency level. */
        serialConsistency?: number;
    }

    /**
     * Base and default RetryPolicy.
     * Determines what to do when the drivers runs into an specific Cassandra exception
     * @constructor
     */
    export class RetryPolicy {
        /**
         * Determines the retry decision for the retry policies.
         * @type {Object}
         * @property rethrow
         * @property retry
         * @property ignore
         * @static
         */
        static retryDecision: {rethrow: number; retry: number; ignore: number};

        /**
         * Determines what to do when the driver gets an UnavailableException response from a Cassandra node.
         * @param info OperationInfo
         * @param consistency The consistency level of the query that triggered the exception.
         * @param required The number of replicas whose response is required to achieve therequired consistency.
         * @param alive The number of replicas that were known to be alive when the request had been processed (since an unavailable exception has been triggered, there will be alive &lt; required)
         */
        onUnavailable(info: OperationInfo, consistency: number, required: number, alive: number): DecisionInfo;

        /**
         * Determines what to do when the driver gets a ReadTimeoutException response from a Cassandra node.
         * @param info OperationInfo
         * @param consistency The consistency level of the query that triggered the exception.
         * @param received The number of nodes having answered the request.
         * @param blockFor The number of replicas whose response is required to achieve the required consistency.
         * @param isDataPresent When <code>false</code>, it means the replica that was asked for data has not responded.
         */
        onReadTimeout(info: OperationInfo, consistency: number, received: number, blockFor: number, isDataPresent: boolean): DecisionInfo;

        /**
         * Determines what to do when the driver gets a WriteTimeoutException response from a Cassandra node.
         * @param info OperationInfo
         * @param consistency The consistency level of the query that triggered the exception.
         * @param received The number of nodes having acknowledged the request.
         * @param blockFor The number of replicas whose acknowledgement is required to achieve the required consistency.
         * @param writeType A <code>string</code> that describes the type of the write that timed out ("SIMPLE" / "BATCH" / "BATCH_LOG" / "UNLOGGED_BATCH" / "COUNTER").
         */
        onWriteTimeout(info: OperationInfo, consistency: number, received: number, blockFor: number, writeType: 'SIMPLE' | 'BATCH' | 'BATCH_LOG' | 'UNLOGGED_BATCH' | 'COUNTER'): DecisionInfo;

        /**
         * Defines whether to retry and at which consistency level on an unexpected error.
         * <p>
         * This method might be invoked in the following situations:
         * </p>
         * <ol>
         * <li>On a client timeout, while waiting for the server response
         * (see [socketOptionsreadTimeoutthe error an instance of
         * OperationTimedOutError.</li>
         * <li>On a connection error (socket closed, etc.).</li>
         * <li>When the contacted host replies with an error, such as <code>overloaded</code>, <code>isBootstrapping</code>,
         * </code>serverError, etc. In this case, the error is instance of ResponseError.
         * </li>
         * </ol>
         * <p>
         * Note that when this method is invoked, <em>the driver cannot guarantee that the mutation has been effectively
         * applied server-side</em>; a retry should only be attempted if the request is known to be idempotent.
         * </p>
         * @param info OperationInfo
         * @paramun consistency The consistency level of the query that triggered the exception.
         * @param err The error that caused this request to fail.
         */
        onRequestError(info: OperationInfo, consistency: number | undefined, err: number): DecisionInfo;

        /**
         * Returnsaretry the request with the given consistency.
         * @param consistency When specified, it retries the request with the given consistency.
         * @param useCurrentHost When specified, determines if the retry should be made using the same coordinator. Default: true.
         */
        retryResult(consistency: number, useCurrentHost: boolean): DecisionInfo;

        /**
         * Returns a callback in error when a err is obtained for a given request.
         */
        rethrowResult(): Function
    }

    /** Decision information */
    export interface DecisionInfo {
        /** The decision as specified in retryDecision. */
        decision: number;
        /** The consistency level. */
        consistency: number;
        /** Determines if it should use the same host to retry the request. */
        useCurrentHost: boolean;
    }

    /** Request information */
    export interface OperationInfo {
        /** The query that was executed. */
        query: string;
        /** The options for the query that was executed. */
        options: QueryOptions;
        /** The number of retries already performed for this operation. */
        nbRetry: number;
        /** DEPRECATED: it will be removed in the next major version. The request handler. */
        handler: Object;
        /** DEPRECATED: it will be removed in the next major version. Represents the request that was executed. */
        request: Object;
        /** DEPRECATED: it will be removed in the next major version. The value as specified in the QueryOptions for this operation. Use OperationInfo.options value instead. */
        retryOnTimeout: boolean;
    }
    /**
     * A Client holds connections to a Cassandra cluster, allowing it to be queried.
     * Each Client instance maintains multiple connections to the cluster nodes, provides
     * policies to choose which node to use for each query, and handles retries for
     * failed query (when it makes sense), etc…
     *
     * Client instances are designed to be long-lived and usually a single instance is
     * enough per application. As a given Client can only be “logged” into one keyspace
     * at a time (where the “logged” keyspace is the one used by query if the query doesn’t
     * explicitly use a fully qualified table name), it can make sense to create one client
     * per keyspace used. This is however not necessary to query multiple keyspaces since
     * it is always possible to use a single session with fully qualified table name in
     * queries.
     *
     * Examples:
     *    Creating a new client instance
     *    const client = new Client({ contactPoints: ['192.168.1.100'] });
     *    client.connect(function (err) {
     *      if (err) return console.error(err);
     *      console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
     *    });
     *
     * Executing a query
     *    // calling #execute() can be made without previously calling #connect(), as internally
     *    // it will ensure it's connected before attempting to execute the query
     *    client.execute('SELECT key FROM system.local', function (err, result) {
     *      if (err) return console.error(err);
     *      const row = result.first();
     *      console.log(row['key']);
     *    });
     *
     * Executing a query with promise-based API
     *    const result = await client.execute('SELECT key FROM system.local');
     *    const row = result.first();
     *    console.log(row['key']);
     */
    class Client {
        /** Gets an associative array of cluster hosts. */
        public hosts: HostMap;
        /** Gets the name of the active keyspace. */
        public keyspace: string;
        /** Gets the schema and cluster metadata information. */
        public metadata: {};


        /**
         * Creates a new instance of Client.
         * @param options The options for this instance.
         */
        constructor(options: ClientOptions);

        /**
         * Executes batch of queries on an available connection to a host.
         *
         * If a callback is provided, it will invoke the callback when the execution completes.
         * Otherwise, it will return a Promise.
         *
         * Executes callback(err, result) when the batch was executed
         *
         * @param queries The queries to execute as an Array of strings or as an array of object containing the query and params
         * @param options QueryOptions
         * @param callback ResultCallback
         */
        batch (queries: Array<string> | Array<{query: string, params: Array<any>}>, callback: Function): void;
        batch (queries: Array<string> | Array<{query: string, params: Array<any>}>, options: QueryOptions, callback: Function): void;

        /**
         * Tries to connect to one of the contactPoints and discovers the rest the nodes of the cluster.
         *
         * If a callback is provided, it will invoke the callback when the client is connected. Otherwise, it will return a Promise.
         *
         * If the Client is already connected, it invokes callback immediately (when provided) or the promise is fulfilled .
         *
         * Examples:
         * Callback-based execution
         *     client.connect(function (err) {
         *     if (err) return console.error(err);
         *     console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
         *     });
         *
         * Promise-based execution
         *     await client.connect();
         *
         * @param callback The callback is invoked when the pool is connected it failed to connect.
         */
        connect (): Promise<void>;
        connect (callback: Function): void;

        /**
         * Executes the query and calls rowCallback for each row as soon as they are received.
         * Calls final callback after all rows have been sent, or when there is an error.
         *
         * The query can be prepared (recommended) or not depending on QueryOptions.prepare flag.
         * Retries on multiple hosts if needed.
         *
         * Examples:
         * Using per-row callback and arrow functions
         *     client.eachRow(query, params, { prepare: true }, (n, row) => console.log(n, row), err => console.error(err));
         *
         * When dealing with paged results, ResultSet#nextPage() method can be used to retrieve the following page. In that case, rowCallback() will be again called for each row and the final callback will be invoked when all rows in the following page has been retrieved.
         * @param query The query to execute
         * @param params Array of parameter values or an associative array (object) containing parameter names as keys and its value.
         * @param options QueryOptions
         * @param rowCallback Executes rowCallback(n, row) per each row received, where n is the row index and row is the current Row.
         * @param callback Executes callback(err, result) after all rows have been received.
         */
        eachRow(query: string, rowCallback: Function): void;
        eachRow(query: string, params: Array<any> | Object, rowCallback: Function): void;
        eachRow(query: string, params: Array<any> | Object, options: QueryOptions, rowCallback: Function): void;
        eachRow(query: string, params: Array<any> | Object, rowCallback: Function, callback: Function): void;
        eachRow(query: string, params: Array<any> | Object, options: QueryOptions, rowCallback: Function, callback: Function): void;

        /**
         * Executes a query on an available connection.
         *
         * If a callback is provided, it will invoke the callback when the execution completes. Otherwise, it will return a Promise.
         *
         * The query can be prepared (recommended) or not depending on QueryOptions.prepare flag.
         *
         * Some executions failures can be handled transparently by the driver, according to the RetryPolicy defined at ClientOptions or QueryOptions level.
         *
         * Examples:
         * Callback-based API
         *   const query = 'SELECT name, email FROM users WHERE id = ?';
         *   client.execute(query, [ id ], { prepare: true }, function (err, result) {
         *     assert.ifError(err);
         *     const row = result.first();
         *     console.log('%s: %s', row.name, row.email);
         *   });
         *
         * Promise-based API, using async/await
         *   const query = 'SELECT name, email FROM users WHERE id = ?';
         *   const result = await client.execute(query, [ id ], { prepare: true });
         *   const row = result.first();
         *   console.log('%s: %s', row.name, row.email);
         *
         * @param query The query to execute.
         * @param params Array of parameter values or an associative array (object) containing parameter names as keys and its value.
         * @param options The query options for the execution.
         * @param callback Executes callback(err, result) when execution completed. When not defined, the method will return a promise.
         */
        execute(query: string, options: QueryOptions): Promise<any>;
        execute(query: string, options: QueryOptions, callback: Function): void;
        execute(query: string, params: Array<any> | Object, options: QueryOptions): Promise<any>;
        execute(query: string, params: Array<any> | Object, options: QueryOptions, callback: Function): void;

        /**
         * Gets the host list representing the replicas that contain such partition.
         * @param keyspace
         * @param token
         */
        getReplicas(keyspace: string, token: Buffer): Array<any>;

        /**
         * Gets a snapshot containing information on the connections pools held by this Client at the current time.
         *
         * The information provided in the returned object only represents the state at the moment this method was
         * called and it’s not maintained in sync with the driver metadata.
         */
        getState(): ClientState

        /**
         * f a callback is provided, it will invoke the callback when the client is disconnected. Otherwise, it will
         * return a Promise.
         * @param callback Optional callback to be invoked when finished closing all connections.
         */
        shutdown(): Promise<void>;
        shutdown(callback: Function): void

        /**
         * Executes the query and pushes the rows to the result stream as soon as they received. Calls callback
         * after all rows have been sent, or when there is an error.
         *
         * The stream is a Readable Streams2 object that contains the raw bytes of the field value. It can be piped
         * downstream and provides automatic pause/resume logic (it buffers when not read).
         *
         * The query can be prepared (recommended) or not depending on QueryOptions.prepare flag. Retries on multiple
         * hosts if needed.
         * @param query The query to prepare and execute
         * @param params Array of parameter values or an associative array (object) containing parameter names as keys and its value
         * @param options QueryOptions
         * @param callback executes callback(err) after all rows have been received or if there is an error
         */
        stream(query: string): Promise<ResultStream>;
        stream(query: string, callback: Function): any;
        stream(query: string, options: QueryOptions): Promise<ResultStream>;
        stream(query: string, options: QueryOptions, callback: Function): any;
        stream(query: string, params: Array<any> | Object): Promise<ResultStream>;
        stream(query: string, params: Array<any> | Object, callback: Function): any;
        stream(query: string, params: Array<any> | Object, options: QueryOptions): Promise<ResultStream>;
        stream(query: string, params: Array<any> | Object, options: QueryOptions, callback: Function): any;


        addListener(event: "hostAdd", listener: (host: Host) => void): this;
        addListener(event: "hostDown", listener: (host: Host) => void): this;
        addListener(event: "hostRemove", listener: (host: Host) => void): this;
        addListener(event: "hostUp", listener: (host: Host) => void): this;

        emit(event: "hostAdd"): boolean;
        emit(event: "hostDown"): boolean;
        emit(event: "hostRemove"): boolean;
        emit(event: "hostUp"): boolean;

        on(event: "hostAdd", listener: (host: Host) => void): this;
        on(event: "hostDown", listener: (host: Host) => void): this;
        on(event: "hostRemove", listener: (host: Host) => void): this;
        on(event: "hostUp", listener: (host: Host) => void): this;

        once(event: "hostAdd", listener: (host: Host) => void): this;
        once(event: "hostDown", listener: (host: Host) => void): this;
        once(event: "hostRemove", listener: (host: Host) => void): this;
        once(event: "hostUp", listener: (host: Host) => void): this;

        prependListener(event: "hostAdd", listener: (host: Host) => void): this;
        prependListener(event: "hostDown", listener: (host: Host) => void): this;
        prependListener(event: "hostRemove", listener: (host: Host) => void): this;
        prependListener(event: "hostUp", listener: (host: Host) => void): this;

        prependOnceListener(event: "hostAdd", listener: (host: Host) => void): this;
        prependOnceListener(event: "hostDown", listener: (host: Host) => void): this;
        prependOnceListener(event: "hostRemove", listener: (host: Host) => void): this;
        prependOnceListener(event: "hostUp", listener: (host: Host) => void): this;
    }

    /**
     * Readable stream using to yield data from a result or a field
     */
    export class ResultStream {
        /**
         * Readable stream using to yield data from a result or a field
         */
        constructor();

        /**
         * Allows for throttling, helping nodejs keep the internal buffers reasonably sized.
         * @param readNext function that triggers reading the next result chunk
         */
        _valve(readNext: Function): void;
    }

    /**
     * Represents the state of a Client.
     *
     * Exposes information on the connections maintained by a Client at a specific time.
    */
    export class ClientState {
        /**
         * Creates a new instance of ClientState.
         * @param hosts
         * @param openConnections
         * @param inFlightQueries
         */
        constructor(hosts: Array<Host>, openConnections: {}, inFlightQueries: {});

        /**
         * Get an array of hosts to which the client is connected to.
         */
        getConnectedHosts(): Array<Host>

        /**
         * Gets the amount of queries that are currently being executed through a given host.
         *
         * This corresponds to the number of queries that have been sent by the Client to server
         * Host on one of its connections but haven’t yet obtained a response.
         * @param host
         */
        getInFlightQueries(host: Host): number;

        /**
         * Gets the amount of open connections to a given host.
         * @param host
         */
        getOpenConnections(host: Host): number;

        /**
         * Returns the string representation of the instance.
         */
        toString(): string;
    }
}
export default ExpressCassandraClient;
