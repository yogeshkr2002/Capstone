const cds = require('@sap/cds');
const { UPDATE, INSERT } = cds.ql;

module.exports = cds.service.impl(async function () {

    const { Invoices, ApprovalHistory } = this.entities;

    // Show only SUBMITTED invoices
    this.before('READ', Invoices, (req) => {

        if (req.query.SELECT.where) {
            req.query.SELECT.where.push('and');
            req.query.SELECT.where.push({ ref: ['status'] });
            req.query.SELECT.where.push('=');
            req.query.SELECT.where.push({ val: 'SUBMITTED' });
        } else {
            req.query.SELECT.where = [
                { ref: ['status'] },
                '=',
                { val: 'SUBMITTED' }
            ];
        }

    });

    this.on('ApproveInvoice', async (req) => {

        const invoiceID = req.params?.[0]?.ID || req.data.invoiceID;

        await UPDATE(Invoices)
            .set({
                status: 'APPROVED',
                approvedBy: req.user.id,
                approvedAt: new Date()
            })
            .where({ ID: invoiceID });

        await INSERT.into(ApprovalHistory).entries({
            invoice_ID: invoiceID,
            action: 'APPROVED',
            actor: req.user.id,
            comments: 'Invoice Approved',
            actionDate: new Date(),
            statusAfterAction: 'APPROVED'
        });

        return 'Invoice Approved Successfully';

    });

    this.on('RejectInvoice', async (req) => {

        const invoiceID = req.params?.[0]?.ID || req.data.invoiceID;

        await UPDATE(Invoices)
            .set({
                status: 'REJECTED',
                rejectedBy: req.user.id,
                rejectedAt: new Date()
            })
            .where({ ID: invoiceID });

        await INSERT.into(ApprovalHistory).entries({
            invoice_ID: invoiceID,
            action: 'REJECTED',
            actor: req.user.id,
            comments: 'Invoice Rejected',
            actionDate: new Date(),
            statusAfterAction: 'REJECTED'
        });

        return 'Invoice Rejected Successfully';

    });

});