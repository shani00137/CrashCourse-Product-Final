import { apiFetch } from "./apiClient";

/**
 * A single invoice line item (certificate service breakdown).
 * @typedef {Object} InvoiceLineItem
 * @property {number} [certificateInoviceId]
 * @property {number} amount
 * @property {string} service
 */

/**
 * Invoice record as returned by the API.
 * @typedef {Object} Invoice
 * @property {number} invoiceId
 * @property {string} invoiceNo
 * @property {number} applicantId
 * @property {number} amount
 * @property {string} service
 * @property {string} remarks
 * @property {string} dateTime
 * @property {number} paidAmount
 * @property {number} balance
 * @property {string} currency
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {InvoiceLineItem[]} serviceList
 */

/**
 * Payload used to create or update an invoice.
 * @typedef {Object} SaveInvoicePayload
 * @property {number} invoiceId          - 0 for a new invoice, existing id to update.
 * @property {string} [invoiceNo]        - Required when updating so the ledger entry can be matched.
 * @property {number} applicantId
 * @property {number} amount
 * @property {string} service
 * @property {number} paidAmount
 * @property {number} balance
 * @property {string} remarks
 * @property {string} currency
 * @property {InvoiceLineItem[]} serviceList
 */

/**
 * Load all invoices for an applicant, newest first.
 * @param {number} applicantId
 * @returns {Promise<Invoice[]>}
 */
async function getApplicantInvoice(applicantId) {
  return apiFetch(`/api/Applicant/api/Applicant/GetApplicantInvoice/${applicantId}`);
}

/**
 * Load all invoices across all applicants, newest first.
 * @returns {Promise<Invoice[]>}
 */
async function getAllApplicantInvoices() {
  return apiFetch("/api/Applicant/api/Applicant/GetAllApplicantInvoices");
}

/**
 * Applicants that have at least one invoice, newest applicant first.
 * @returns {Promise<Array<{ applicantId: number, firstName: string, lastName: string, registrationNo: string, invoiceCount: number, totalAmount: number }>>}
 */
async function getApplicantsWithInvoices() {
  return apiFetch("/api/Applicant/api/Applicant/GetApplicantsWithInvoices");
}

/**
 * Create (invoiceId = 0) or update an existing invoice.
 * @param {SaveInvoicePayload} payload
 * @returns {Promise<{ succeeded: boolean, message: string, invoiceId: number, invoiceNo: string }>}
 */
async function saveApplicantInvoice(payload) {
  return apiFetch("/api/Applicant/api/Applicant/SaveApplicantInvoice", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Delete an invoice and its matching ledger entry.
 * @param {number} invoiceId
 * @returns {Promise<{ succeeded: boolean, message: string, invoiceId: number }>}
 */
async function deleteApplicantInvoice(invoiceId) {
  return apiFetch(`/api/Applicant/api/Applicant/DeleteInvoiceNo/${invoiceId}`, {
    method: "DELETE"
  });
}

/**
 * Applicant summary for the invoice drawer: info + current status.
 * @param {number} applicantId
 * @returns {Promise<{ applicantId:number, registrationNo:string, firstName:string, lastName:string, mobile:string, email:string, address:string, country:string, course:string, applicationStatusId:number|null, statusName:string|null, isActive:boolean|null }>}
 */
async function getApplicantDetail(applicantId) {
  return apiFetch(`/api/Applicant/api/Applicant/GetApplicant/${applicantId}`);
}

/**
 * Applicant ledger entries.
 * @param {number} applicantId
 * @returns {Promise<Array<{ applicantId:number, debit:number, credit:number, dateTime:string, reference:string, remarks:string, totalDebit:number, totalCredit:number }>>}
 */
async function getApplicantTransactions(applicantId) {
  return apiFetch(`/api/Applicant/api/Applicant/GetApplicantTransaction/${applicantId}`);
}

/**
 * Change an applicant's workflow status.
 * @param {number} applicantId
 * @param {number} statusId
 * @returns {Promise<{ succeeded: boolean, applicantId: number, applicationStatusId: number, statusName: string }>}
 */
async function setApplicantStatus(applicantId, statusId) {
  return apiFetch(`/api/Applicant/api/Applicant/SetApplicantStatus/${applicantId}/${statusId}`, {
    method: "POST"
  });
}

export {
  deleteApplicantInvoice,
  getAllApplicantInvoices,
  getApplicantDetail,
  getApplicantInvoice,
  getApplicantTransactions,
  getApplicantsWithInvoices,
  saveApplicantInvoice,
  setApplicantStatus
};
