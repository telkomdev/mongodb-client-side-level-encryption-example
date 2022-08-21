db = db.getSiblingDB('codebasedb');
db.createUser(
    {
        user: "admin",
        pwd: "admin",
        roles:[
            {
                role: "readWrite",
                db:   "codebasedb"
            }
        ]
    }
);

db = db.getSiblingDB('encryption');
db.createUser(
    {
        user: "admin",
        pwd: "admin",
        roles:[
            {
                role: "readWrite",
                db:   "encryption"
            }
        ]
    }
);