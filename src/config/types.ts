export type Config = {
    name: string;
    domain: string;
    port: number;
    useQueueDashboard: boolean;
    onlyVerifiedAccount: boolean;
    
    // MongoDB
    db: {
        host: string;
        port: number;
        name: string;
    }

    // Redis
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    }

    // Twitter
    twitter: {
        consumer_key: string;
        consumer_secret: string;
        access_token: string;
        access_token_secret: string;
        list_prefix: string;
    }

    // Maintainer
    maintainer: {
        name: string;
        email: string;
    }

    // IgnoreList
    ignoreList: [] | string[];
}

export interface packageJson {
    name: string;
    version: string;
    repository: {
        url: string;
    }
}