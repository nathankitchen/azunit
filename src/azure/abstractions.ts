/*  Abstractions.ts
 *
 *  A couple of interfaces to abstract cloud operations from the main Azure
 *  Unit test framework, to enable test/mock scenarios.
 */
import Azure from "ms-rest-azure";
import { ResourceManagementClient as RM } from "azure-arm-resource";
import * as ResourceManager from "azure-arm-resource";

export interface IAzureToken {
    value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials;
}

export interface IAzureAuthenticator {
    getSPTokenCredentials(tenant: string, clientId: string, secret: string) : Promise<IAzureToken>;
}

export interface IAzureResourceProvider {
    list(subscriptionId: string, token: IAzureToken) : Promise<Array<any>>;
}

class TestTokenCredentials {}

class AzureToken implements IAzureToken {

    constructor(value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials)
    {
        this.value = value;
    }

    readonly value: Azure.DeviceTokenCredentials | Azure.ApplicationTokenCredentials | Azure.UserTokenCredentials | TestTokenCredentials;
}

export class AzureAuthenticator implements IAzureAuthenticator {

    getSPTokenCredentials(tenant: string, clientId: string, secret: string)
    {
        return new Promise<IAzureToken>(
            (resolve, reject) => {

                Azure.loginWithServicePrincipalSecret(clientId, secret, tenant, function(err: Error, credentials: Azure.ApplicationTokenCredentials) {
                    
                    if (err) reject(err);
        
                    let token = new AzureToken(credentials);
        
                    resolve(token);
                });
            });
    }
}

export class TestAuthenticator implements IAzureAuthenticator {

    getSPTokenCredentials(tenant: string, clientId: string, secret: string)
    {
        return new Promise<IAzureToken>(
            (resolve, reject) => {
                resolve(new AzureToken(new TestTokenCredentials()));
            });
    }
}

export class AzureResourceProvider implements IAzureResourceProvider {

    list(subscriptionId: string, token: IAzureToken) {
        
        return new Promise<any>(
            (resolve, reject) => {

                const client = new RM.ResourceManagementClient(<Azure.ApplicationTokenCredentials>token.value, subscriptionId);

                client.resources.list((err: Error, data?: ResourceManager.ResourceModels.ResourceListResult) => {

                    if (err) reject(err);

                    if (data) {
                        
                        const ids = new Set(data.map(e => {
                            
                            if (e && e.id) {
                                return e.id;
                            }

                            return null;
                        }));

                        const types = new Set(data.map(e => {
                            
                            if (e && e.type) {
                                let ns = e.type.split("/", 1);
                                if (ns && ns.length == 1) { return ns[0]; }
                            }

                            return null;
                        }));

                        let providerPromises = new Array<Promise<RM.ResourceManagementModels.Provider>>();

                        types.forEach(t => {
                            if (t) {
                                providerPromises.push(client.providers.get(t));
                            }
                        });

                        // Get all the available providers
                        Promise.all(providerPromises).then((providers) => {

                            let apis = new Array();

                            let resourcePromises = new Array<Promise<RM.ResourceManagementModels.Resource>>();

                            // Scan all the providers and pick out the highest API available for each
                            // resource.
                            providers.forEach(p => {
                                if (p && p.resourceTypes) {
                                    p.resourceTypes.forEach(r => {
                                        if (r && r.apiVersions && r.apiVersions.length > 0) {
                                            apis.push({
                                                namespace: p.namespace,
                                                resourceType: r.resourceType,
                                                fqns: p.namespace + '/' + r.resourceType,
                                                api: r.apiVersions[0]
                                            });
                                        }
                                    });
                                }
                            });

                            // Scan all the resources and work out which API to use for each resource type.
                            // Queue up the promise to get the resource by ID using the identified API.
                            data.forEach(r => {
                                if (r && r.id) {
                                    
                                    let api2 = apis.filter(a => a.fqns == r.type);
                                    
                                    resourcePromises.push(client.resources.getById(r.id, api2[0].api));
                                }
                            });

                            Promise.all(resourcePromises)
                            .then((resources) => {
                                resolve(resources);
                            })
                            .catch(err => reject(err));

                        })
                        .catch(err => reject(err));;
                    }
                });
            });
    }
}