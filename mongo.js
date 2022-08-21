const { MongoClient, Binary } = require('mongodb');
const { ClientEncryption } = require("mongodb-client-encryption");
const fs = require('fs');

// https://www.mongodb.com/docs/manual/core/csfle/fundamentals/manual-encryption/

const keyVaultDatabase = "codebasedb";
const keyVaultCollection = "__keyVault";
const keyVaultNamespace = `${keyVaultDatabase}.${keyVaultCollection}`;

const provider = "local";
const path = "./master-key.txt";
const localMasterKey = fs.readFileSync(path);
const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};

const options = {
    keepAlive: true,
    maxPoolSize: 50,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000
};

async function createKeyVault() {
    try {
        const dbUrl = 'mongodb://admin:admin@localhost:27017/codebasedb';
        const keyVaultClient = new MongoClient(dbUrl, options);

        await keyVaultClient.connect();

        const keyVaultDB = keyVaultClient.db(keyVaultDatabase);
        // Drop the Key Vault Collection in case you created this collection
        // in a previous run of this application.
        // await keyVaultDB.dropDatabase();
        // Drop the database storing your encrypted fields as all
        // the DEKs encrypting those fields were deleted in the preceding line.
        // await keyVaultClient.db("medicalRecords").dropDatabase();
        const keyVaultColl = keyVaultDB.collection(keyVaultCollection);
        await keyVaultColl.createIndex(
            { keyAltNames: 1 },
            {
                unique: true,
                partialFilterExpression: { keyAltNames: { $exists: true } },
            }
        );

        // end-create-index
        // start-create-dek
        const client = new MongoClient(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();

        const encryption = new ClientEncryption(client, {
            keyVaultNamespace,
            kmsProviders,
        });

        const key = await encryption.createDataKey(provider);
        console.log("DataKeyId [base64]: ", key.toString("base64"));
        // example result: MNJqhj0PTfGl3vq00Uiq/w==

        await keyVaultClient.close();
        await client.close();

    } catch(e) {
        console.log('error connecting to database server', e);
    }
}

async function insertData() {
    try {
        
        const dataKey = 'MNJqhj0PTfGl3vq00Uiq/w==';
        const dbUrl = 'mongodb://admin:admin@localhost:27017/codebasedb';
        const database = 'codebasedb';

        const userCollections = 'users';

        const client = new MongoClient(dbUrl, options);

        await client.connect();

        // create client encryption
        const encryption = new ClientEncryption(client, {
            keyVaultNamespace,
            kmsProviders,
        });

        // Encryption Algorithm   | Data Type
        // ----------------------------------
        // Deterministic          | string
        // Random                 | Array

        // https://mongodb.github.io/node-mongodb-native/api-bson-generated/binary.html
        const encryptedEmail = await encryption.encrypt("alex@gmail.com", {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyId: new Binary(Buffer.from(dataKey, "base64"), 4),
        });

        const encryptedCreditCard = await encryption.encrypt("4797459275128533", {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyId: new Binary(Buffer.from(dataKey, "base64"), 4),
        });

        const db = client.db(database);
        await db.collection(userCollections).insertOne({
            email: encryptedEmail,
            creditCard: encryptedCreditCard
        });

        await client.close();
    } catch(e) {
        console.log('error connecting to database server', e);
    }
}

async function readData() {
    try {
        
        const dataKey = 'MNJqhj0PTfGl3vq00Uiq/w==';
        const dbUrl = 'mongodb://admin:admin@localhost:27017/codebasedb';
        const database = 'codebasedb';

        const userCollections = 'users';

        const client = new MongoClient(dbUrl, options);

        await client.connect();

        // create client encryption
        const encryption = new ClientEncryption(client, {
            keyVaultNamespace,
            kmsProviders,
        });

        // Encryption Algorithm   | Data Type
        // ----------------------------------
        // Deterministic          | string
        // Random                 | Array

        // https://mongodb.github.io/node-mongodb-native/api-bson-generated/binary.html
        const encryptedEmail = await encryption.encrypt("alex@gmail.com", {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyId: new Binary(Buffer.from(dataKey, "base64"), 4),
        });

        const db = client.db(database);
        const result = await db.collection(userCollections).find({});
        const datas = await result.toArray();
        for (const data of datas) {

            const emailDecrypted = await encryption.decrypt(data.email);
            const creditCardDecrypted = await encryption.decrypt(data.creditCard);

            console.log('email: ', emailDecrypted);
            console.log('credit card: ', creditCardDecrypted);

            console.log('-------------------------');
        }

        await client.close();
    } catch(e) {
        console.log('error connecting to database server', e);
    }
}

// createKeyVault().catch(e => console.log(e));

// insertData().catch(e => console.log(e));

readData().catch(e => console.log(e));