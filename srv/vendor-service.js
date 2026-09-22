const cds = require('@sap/cds');
const { SELECT, UPDATE, INSERT } = cds.ql;

module.exports = cds.service.impl(async function () {

    const { Invoices, Vendors, ApprovalHistory } = this.entities;

    this.before('CREATE', Invoices, async (req) => {

        console.log("Creating Invoice by Vendor");
        req.data.status = 'DRAFT';

    });

    this.before('UPDATE', Invoices, async (req) => {

        console.log("Updating Invoice");

    });

    this.on('SubmitInvoice', async (req) => {

        const invoiceID =
            req.params?.[0]?.ID || req.data.invoiceID;

        await UPDATE(Invoices)
            .set({
                status: 'SUBMITTED',
                submittedAt: new Date(),
                submittedBy: req.user.id || 'Vendor User'
            })
            .where({ ID: invoiceID });

        // Insert into Approval History
        await INSERT.into(ApprovalHistory).entries({
            invoice_ID: invoiceID,
            action: 'SUBMITTED',
            actor: req.user.id || 'Vendor User',
            comments: 'Submitted for approval',
            actionDate: new Date(),
            statusAfterAction: 'SUBMITTED'
        });

        return 'Invoice submitted successfully';

    });

    this.on('MyInvoices', async () => {

        return SELECT.from(Invoices);

    });

    this.on('MyProfile', async () => {

        return SELECT.one.from(Vendors);

    });

});