//import Azure from "ms-rest-azure";
//import { ResourceManagementClient as RM } from "azure-arm-resource";
//import * as ResourceManager from "azure-arm-resource";

import * as msRest from "@azure/ms-rest-js";
import * as msRestAzure from "@azure/ms-rest-azure-js";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { ResourceManagementClient, ResourceManagementModels, ResourceManagementMappers } from "@azure/arm-resources";

import { IAzureResourceProvider } from "./IAzureResourceProvider";
import { IAzureToken } from "./IAzureToken";

export class AzureResourceProvider implements IAzureResourceProvider {

    list(subscriptionId: string, token: IAzureToken): any {
        
        return new Promise<any>(
            (resolve, reject) => {

                const client = new ResourceManagementClient(token.value, subscriptionId);

                client.resources.list((err: Error, data?: ResourceManagementModels.ResourceListResult) => {

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

                        let providerPromises = new Array<Promise<ResourceManagementModels.Provider>>();

                        types.forEach(t => {
                            if (t) {
                                providerPromises.push(client.providers.get(t));
                            }
                        });

                        // Get all the available providers
                        Promise.all(providerPromises).then((providers) => {

                            let apis = new Array();

                            let resourcePromises = new Array<Promise<ResourceManagementModels.Resource>>();

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
                                    if (api2 && api2.length > 0) {
                                        resourcePromises.push(client.resources.getById(r.id, api2[0].api));
                                    }
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