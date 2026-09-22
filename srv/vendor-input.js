const cds = require('@sap/cds');
const axios = require('axios');
const { UPDATE } = cds.ql;

const TOKEN_URL =
'https://490c6667trial.authentication.ap21.hana.ondemand.com/oauth/token';

const CLIENT_ID =
'sb-97959af1-36fb-4202-bcc0-36f3bc3ffb95!b128666|xsuaa!b34447';

const CLIENT_SECRET =
'54e4b527-4a76-4fb6-bb1c-ebe78cdb00a6$k68jHEINoSQYMjfjX7NQ3OtmNEj0z69QtE7ySTkSRJ0=';

const WORKFLOW_URL =
'https://spa-api-gateway-bpi-ap-prod.cfapps.ap21.hana.ondemand.com/workflow/rest/v1/workflow-instances';

const DEFINITION_ID =
'ap21.490c6667trial.vendorapprover.vendorApprovalProcess';

module.exports = cds.service.impl(async function () {

    const { VendorApprovalRequests } = this.entities;
    const db = cds.entities('vendorinvoice.db');
    const { VendorApprovalRequest: DBVendorApprovalRequest } = db;

    this.after('CREATE', VendorApprovalRequests, async (data) => {

        try {

            const token = await axios.post(
                TOKEN_URL,
                'grant_type=client_credentials',
                {
                    auth: {
                        username: CLIENT_ID,
                        password: CLIENT_SECRET
                    },
                    headers: {
                        'Content-Type':
                        'application/x-www-form-urlencoded'
                    }
                }
            );

            const accessToken = token.data.access_token;

            const payload = {

                definitionId: DEFINITION_ID,

                context: {

                    vendorID: data.ID,

                    vendorName: data.vendorName,

                    email: data.email,

                    phone: data.phone,

                    requestedBy: data.requestedBy || "Aditya"

                }

            };

            const response = await axios.post(

                WORKFLOW_URL,

                payload,

                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }

            );

            await UPDATE(VendorApprovalRequests)

                .set({

                    workflowInstanceId: response.data.id,

                    status: 'TRIGGERED'

                })

                .where({ ID: data.ID });

            console.log("Workflow Triggered Successfully");

        } catch (err) {

    console.log("========== WORKFLOW ERROR ==========");
    console.log(JSON.stringify(err.response?.data, null, 2));

    await UPDATE(VendorApprovalRequests)
        .set({
            status: 'FAILED'
        })
        .where({ ID: data.ID });

    console.error(err.message);
}

    });

});