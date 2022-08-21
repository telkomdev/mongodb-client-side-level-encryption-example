### MongoDB manual encryption mechanism of Client-Side Field Level Encryption (CSFLE)

### Reference
- https://www.mongodb.com/docs/manual/core/csfle/fundamentals/manual-encryption/
- https://github.com/mongodb-university/docs-in-use-encryption-examples

### Getting started

#### Run MongoDB Server
```shell
$ docker-compose up
```

#### Generate Master Key
```shell
$ node master_key_gen.js
```

#### Create Key Data

Open `mongo.js`

Run `createKeyVault` function

`mongo.js`
```javascript
...............................
.................................
createKeyVault().catch(e => console.log(e));

// insertData().catch(e => console.log(e));

//readData().catch(e => console.log(e));
```

Run
```shell
$ node mongo.js
```

#### Insert Data

Open `mongo.js`

Run `insertData` function

`mongo.js`
```javascript
...............................
.................................
// createKeyVault().catch(e => console.log(e));

insertData().catch(e => console.log(e));

//readData().catch(e => console.log(e));
```

Run
```shell
$ node mongo.js
```

#### Read Data

Open `mongo.js`

Run `readData` function

`mongo.js`
```javascript
...............................
.................................
// createKeyVault().catch(e => console.log(e));

// insertData().catch(e => console.log(e));

readData().catch(e => console.log(e));
```

Run
```shell
$ node mongo.js
```