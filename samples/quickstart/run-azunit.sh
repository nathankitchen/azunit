#!/bin/bash

# DON'T FORGET TO CHMOD r+x TO MAKE THIS FILE EXECUTABLE

# Replace the tokens with values reflective of your environment:
#  * [test.js] A list of the test.js files you want to run.
#  * -t The name of the Azure AD tenant, usually ending in .onmicrosoft.com
#  * -p The client id of the Service Principal to authenticate with. A GUID.
#  * -k The client secret key for the Service Principal.
#  * -s The subscription ID. A GUID. Service Principal should have Reader access.

azunit run test.js -t <yourtenant.onmicrosoft.com> \
        -p <service-principal-client-id> \
        -k <service-principal-secret-key> \
        -s <subscription-id>