"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    frameworkVersion: function() {
        return frameworkVersion;
    },
    modelListIndex: function() {
        return modelListIndex;
    },
    modelsMap: function() {
        return modelsMap;
    }
});
/**
 * Internal variable to indicate the framework version this package is built with.
 * @internal
 */ const frameworkVersion = "^1.5.0";
/**
 * Internal variable to store model blobs with GraphQL typename as the key, and use them in the action code functions.
 * @internal
 */ const modelsMap = {
    "User": {
        "key": "DataModel-Nyj11zYHJU6y",
        "name": "User",
        "apiIdentifier": "user",
        "namespace": [],
        "fields": {
            "ModelField-DataModel-Nyj11zYHJU6y-system-id": {
                "fieldType": "ID",
                "key": "ModelField-DataModel-Nyj11zYHJU6y-system-id",
                "name": "ID",
                "apiIdentifier": "id",
                "configuration": {
                    "type": "IDConfig",
                    "key": "IDConfig-VOqIhuuHvTtj",
                    "createdDate": "2023-11-10T17:45:55.795Z"
                },
                "internalWritable": true
            },
            "ModelField-DataModel-Nyj11zYHJU6y-system-createdAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-Nyj11zYHJU6y-system-createdAt",
                "name": "Created At",
                "apiIdentifier": "createdAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-rwVolrzG3VYQ",
                    "createdDate": "2023-11-10T17:45:55.795Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-DataModel-Nyj11zYHJU6y-system-updatedAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-Nyj11zYHJU6y-system-updatedAt",
                "name": "Updated At",
                "apiIdentifier": "updatedAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-pM2kg75j1tjV",
                    "createdDate": "2023-11-10T17:45:55.796Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-5jMLDOB9H4gx": {
                "fieldType": "String",
                "key": "ModelField-5jMLDOB9H4gx",
                "name": "Field F",
                "apiIdentifier": "googleProfileId",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-to2QU9zAzOxm",
                    "createdDate": "2023-11-10T17:45:55.853Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-82NvRtKGilut": {
                "fieldType": "String",
                "key": "ModelField-82NvRtKGilut",
                "name": "Field J",
                "apiIdentifier": "emailVerificationToken",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-fjlRmuIVtLs7",
                    "createdDate": "2023-11-10T17:45:55.867Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-Awdog48lm9c3": {
                "fieldType": "DateTime",
                "key": "ModelField-Awdog48lm9c3",
                "name": "Field H",
                "apiIdentifier": "lastSignedIn",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-WcFzBLxKAMfn",
                    "createdDate": "2023-11-10T17:45:55.858Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-F06oCeGumY8X": {
                "fieldType": "RoleAssignments",
                "key": "ModelField-F06oCeGumY8X",
                "name": "Field G",
                "apiIdentifier": "roles",
                "configuration": {
                    "type": "RoleAssignmentsConfig",
                    "key": "RoleAssignmentsConfig-CLuDE2vv_PSZ",
                    "createdDate": "2023-11-10T17:45:55.855Z",
                    "default": [
                        "unauthenticated"
                    ]
                },
                "internalWritable": true
            },
            "ModelField-HwldjUb0YzNq": {
                "fieldType": "Boolean",
                "key": "ModelField-HwldjUb0YzNq",
                "name": "Field D",
                "apiIdentifier": "emailVerified",
                "configuration": {
                    "type": "BooleanConfig",
                    "key": "BooleanConfig-PkPzPG7B6BNy",
                    "createdDate": "2023-11-10T17:45:55.847Z",
                    "default": false
                },
                "internalWritable": true
            },
            "ModelField-OsBSD5MOzA2l": {
                "fieldType": "DateTime",
                "key": "ModelField-OsBSD5MOzA2l",
                "name": "Field K",
                "apiIdentifier": "emailVerificationTokenExpiration",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-AsopjSsb1td4",
                    "createdDate": "2023-11-10T17:45:55.870Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-RZGeKn08rlZ6": {
                "fieldType": "URL",
                "key": "ModelField-RZGeKn08rlZ6",
                "name": "Field E",
                "apiIdentifier": "googleImageUrl",
                "configuration": {
                    "type": "URLConfig",
                    "key": "URLConfig-mNJxHTwduRx8",
                    "createdDate": "2023-11-10T17:45:55.849Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-crTKjwOaKlUE": {
                "fieldType": "Email",
                "key": "ModelField-crTKjwOaKlUE",
                "name": "Field C",
                "apiIdentifier": "email",
                "configuration": {
                    "type": "EmailConfig",
                    "key": "EmailConfig-cYfHLen0ME2V",
                    "createdDate": "2023-11-10T17:45:55.840Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-g-Qow64Ubsky": {
                "fieldType": "DateTime",
                "key": "ModelField-g-Qow64Ubsky",
                "name": "Field M",
                "apiIdentifier": "resetPasswordTokenExpiration",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-Lck42ewF_paB",
                    "createdDate": "2023-11-10T17:45:55.874Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-iGH5npvYRO8R": {
                "fieldType": "String",
                "key": "ModelField-iGH5npvYRO8R",
                "name": "Field B",
                "apiIdentifier": "lastName",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-ux95U4oRhjuu",
                    "createdDate": "2023-11-10T17:45:55.837Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-jyWxcriAtTMx": {
                "fieldType": "String",
                "key": "ModelField-jyWxcriAtTMx",
                "name": "Field L",
                "apiIdentifier": "resetPasswordToken",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-3MWZ215tdh0e",
                    "createdDate": "2023-11-10T17:45:55.872Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-p7gIwwPn7L3v": {
                "fieldType": "Password",
                "key": "ModelField-p7gIwwPn7L3v",
                "name": "Field I",
                "apiIdentifier": "password",
                "configuration": {
                    "type": "PasswordConfig",
                    "key": "PasswordConfig-yB4V4iTjkN8T",
                    "createdDate": "2023-11-10T17:45:55.860Z"
                },
                "internalWritable": true
            },
            "ModelField-qUOjeubWthFe": {
                "fieldType": "String",
                "key": "ModelField-qUOjeubWthFe",
                "name": "Field A",
                "apiIdentifier": "firstName",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-OPiDAbwFUDBD",
                    "createdDate": "2023-11-10T17:45:55.835Z",
                    "default": null
                },
                "internalWritable": true
            }
        },
        "graphqlTypeName": "User",
        "stateChart": {
            "type": "StateChart",
            "key": "StateChart-lrJqkxlthOnm",
            "createdDate": 1699638355810,
            "actions": {},
            "transitions": {},
            "stateInActionCode": false,
            "childStates": [
                {
                    "type": "State",
                    "key": "cAGfm1XtC2WY",
                    "createdDate": 1699638355810,
                    "name": "Start",
                    "isRecordBirthPlace": true,
                    "isUndeleteableSystemState": true,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                },
                {
                    "type": "State",
                    "key": "BwT4-1qSAhDb",
                    "createdDate": 1699638355810,
                    "name": "Created",
                    "isRecordBirthPlace": false,
                    "isUndeleteableSystemState": true,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                },
                {
                    "type": "State",
                    "key": "-gqZbf6QMPV8",
                    "createdDate": 1699638355810,
                    "name": "Deleted",
                    "isRecordBirthPlace": false,
                    "isUndeleteableSystemState": false,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                }
            ],
            "initialChildState": "cAGfm1XtC2WY"
        }
    },
    "Game": {
        "key": "DataModel-UF7tdI4ebLdS",
        "name": "games",
        "apiIdentifier": "game",
        "namespace": [],
        "fields": {
            "ModelField-DataModel-UF7tdI4ebLdS-system-id": {
                "fieldType": "ID",
                "key": "ModelField-DataModel-UF7tdI4ebLdS-system-id",
                "name": "ID",
                "apiIdentifier": "id",
                "configuration": {
                    "type": "IDConfig",
                    "key": "IDConfig-J5ISdVvrhpx9",
                    "createdDate": "2023-11-10T17:49:44.915Z"
                },
                "internalWritable": true
            },
            "ModelField-DataModel-UF7tdI4ebLdS-system-createdAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-UF7tdI4ebLdS-system-createdAt",
                "name": "Created At",
                "apiIdentifier": "createdAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-XjBa_Zg6emGR",
                    "createdDate": "2023-11-10T17:49:44.916Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-DataModel-UF7tdI4ebLdS-system-updatedAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-UF7tdI4ebLdS-system-updatedAt",
                "name": "Updated At",
                "apiIdentifier": "updatedAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-2n6uCDzjFfAi",
                    "createdDate": "2023-11-10T17:49:44.917Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-E5DvP36D6r9q": {
                "fieldType": "String",
                "key": "ModelField-E5DvP36D6r9q",
                "name": "messageId",
                "apiIdentifier": "messageId",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-UhA8RE4PAJu8",
                    "createdDate": "2023-11-13T16:19:32.876Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-_cvO4TR3aEH1": {
                "fieldType": "String",
                "key": "ModelField-_cvO4TR3aEH1",
                "name": "userId",
                "apiIdentifier": "userId",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-Mp958_E6mcJC",
                    "createdDate": "2023-11-13T16:19:49.670Z",
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-lOWktFGCOnqv": {
                "fieldType": "String",
                "key": "ModelField-lOWktFGCOnqv",
                "name": "objectName",
                "apiIdentifier": "objectName",
                "configuration": {
                    "type": "StringConfig",
                    "key": "StringConfig-eSaueU59bI0s",
                    "createdDate": "2023-11-13T16:19:53.989Z",
                    "default": null
                },
                "internalWritable": true
            }
        },
        "graphqlTypeName": "Game",
        "stateChart": {
            "type": "StateChart",
            "key": "StateChart-W2woT1fM3wAQ",
            "createdDate": 1699638584932,
            "actions": {},
            "transitions": {},
            "stateInActionCode": false,
            "childStates": [
                {
                    "type": "State",
                    "key": "7QgIEDGi6uCs",
                    "createdDate": 1699638584932,
                    "name": "Start",
                    "isRecordBirthPlace": true,
                    "isUndeleteableSystemState": true,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                },
                {
                    "type": "State",
                    "key": "mesxl9CPih-o",
                    "createdDate": 1699638584932,
                    "name": "Created",
                    "isRecordBirthPlace": false,
                    "isUndeleteableSystemState": true,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                },
                {
                    "type": "State",
                    "key": "VA2gquO2tpJr",
                    "createdDate": 1699638584932,
                    "name": "Deleted",
                    "isRecordBirthPlace": false,
                    "isUndeleteableSystemState": false,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                }
            ],
            "initialChildState": "7QgIEDGi6uCs"
        }
    },
    "Session": {
        "key": "DataModel-s6M5_oiYooo0",
        "name": "Session",
        "apiIdentifier": "session",
        "namespace": [],
        "fields": {
            "ModelField-DataModel-s6M5_oiYooo0-system-id": {
                "fieldType": "ID",
                "key": "ModelField-DataModel-s6M5_oiYooo0-system-id",
                "name": "ID",
                "apiIdentifier": "id",
                "configuration": {
                    "type": "IDConfig",
                    "key": "IDConfig-Jmg3rYNDERCp",
                    "createdDate": "2023-11-10T17:45:55.688Z"
                },
                "internalWritable": true
            },
            "ModelField-DataModel-s6M5_oiYooo0-system-createdAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-s6M5_oiYooo0-system-createdAt",
                "name": "Created At",
                "apiIdentifier": "createdAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-QO-U6etCts-t",
                    "createdDate": "2023-11-10T17:45:55.689Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-DataModel-s6M5_oiYooo0-system-updatedAt": {
                "fieldType": "DateTime",
                "key": "ModelField-DataModel-s6M5_oiYooo0-system-updatedAt",
                "name": "Updated At",
                "apiIdentifier": "updatedAt",
                "configuration": {
                    "type": "DateTimeConfig",
                    "key": "DateTimeConfig-GjeuEnMW_-np",
                    "createdDate": "2023-11-10T17:45:55.692Z",
                    "includeTime": true,
                    "default": null
                },
                "internalWritable": true
            },
            "ModelField-0CYnWjNNdoA0": {
                "fieldType": "BelongsTo",
                "key": "ModelField-0CYnWjNNdoA0",
                "name": "User",
                "apiIdentifier": "user",
                "configuration": {
                    "type": "BelongsToConfig",
                    "key": "BelongsToConfig-6mrcIX2ChO_Y",
                    "createdDate": "2023-11-10T17:45:56.035Z",
                    "relatedModelKey": "DataModel-Nyj11zYHJU6y",
                    "relatedModelApiIdentifier": null
                },
                "internalWritable": true
            }
        },
        "graphqlTypeName": "Session",
        "stateChart": {
            "type": "StateChart",
            "key": "StateChart-ockflPI-OF1i",
            "createdDate": 1699638355693,
            "actions": {},
            "transitions": {},
            "stateInActionCode": false,
            "childStates": [
                {
                    "type": "State",
                    "key": "State-I3TMQ8r5Cz3G",
                    "createdDate": 1699638355720,
                    "name": "Created",
                    "isRecordBirthPlace": false,
                    "isUndeleteableSystemState": false,
                    "restoreHistory": true,
                    "childStates": [],
                    "customApiIdentifier": null
                }
            ],
            "initialChildState": "State-I3TMQ8r5Cz3G"
        }
    }
};
/**
 * Internal variable to map model apiIdentifier to GraphQL typename in modelsMap.
 * @internal
 */ const modelListIndex = {
    "api:user": "User",
    "api:game": "Game",
    "api:session": "Session"
};
