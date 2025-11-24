'use client';

import type { InvoiceItem } from './add-item-form';

type PrintBillProps = {
    invoiceNumber: string;
    customerName: string;
    customerMobile?: string;
    customerEmail?: string;
    vehicleNumber?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    date: Date;
};

export function PrintBill({
    invoiceNumber,
    customerName,
    customerMobile,
    customerEmail,
    vehicleNumber,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    date,
}: PrintBillProps) {
    const formatDate = (d: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = d.getDate().toString().padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = d.getHours() % 12 || 12;
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-bill-container,
            #print-bill-container * {
              visibility: visible;
            }
            #print-bill-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20mm;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
          @media screen {
            #print-bill-container {
              display: none;
            }
          }
        `
            }} />

            <div id="print-bill-container">
                <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '32px', fontFamily: 'Arial, sans-serif' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>HERO MOTORS</h1>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}>Authorized Service Center</p>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}>123 Main Street, City Name - 560001</p>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}>Phone: +91 80 1234 5678 | Email: contact@heromotors.com</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: '4px 0' }}>GSTIN: 29ABCDE1234F1Z5</p>
                    </div>

                    {/* Invoice Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>TAX INVOICE</h2>
                            <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Invoice No:</strong> {invoiceNumber}</p>
                            <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Date:</strong> {formatDate(date)}</p>
                            <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Payment Mode:</strong> {paymentMethod.toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>BILL TO:</p>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{customerName}</p>
                            {customerMobile && <p style={{ fontSize: '14px', margin: '4px 0' }}>Mobile: {customerMobile}</p>}
                            {customerEmail && <p style={{ fontSize: '14px', margin: '4px 0' }}>Email: {customerEmail}</p>}
                            {vehicleNumber && <p style={{ fontSize: '14px', margin: '4px 0' }}>Vehicle: {vehicleNumber}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', marginBottom: '24px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderTop: '2px solid black', borderBottom: '2px solid black' }}>
                                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>S.No</th>
                                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>Rate (₹)</th>
                                <th style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                                    <td style={{ padding: '8px', fontSize: '14px' }}>{index + 1}</td>
                                    <td style={{ padding: '8px', fontSize: '14px' }}>{item.item}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>{item.rate.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>{(item.quantity * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                        <div style={{ width: '256px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                                <span>GST (18%):</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid black' }}>
                                <span>TOTAL:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div style={{ marginBottom: '24px', fontSize: '14px' }}>
                        <p><strong>Amount in Words:</strong> {numberToWords(total)} Rupees Only</p>
                    </div>

                    {/* Terms & Conditions */}
                    <div style={{ borderTop: '1px solid #999', paddingTop: '16px', marginBottom: '24px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Terms & Conditions:</p>
                        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '4px' }}>Goods once sold will not be taken back or exchanged</li>
                            <li style={{ marginBottom: '4px' }}>All disputes subject to local jurisdiction only</li>
                            <li style={{ marginBottom: '4px' }}>Warranty as per manufacturer's terms</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #999', paddingTop: '16px' }}>
                        <div style={{ fontSize: '12px' }}>
                            <p style={{ margin: '4px 0' }}>Thank you for your business!</p>
                            <p style={{ margin: '4px 0' }}>For any queries, please contact us at the above details</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ borderTop: '1px solid black', width: '192px', marginTop: '48px', paddingTop: '8px' }}>
                                <p style={{ fontSize: '12px', margin: 0 }}>Authorized Signatory</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper function to convert number to words (simplified for Indian numbering)
function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = Math.floor(num % 100);

    let words = '';

    if (crore > 0) {
        words += convertTwoDigit(crore) + ' Crore ';
    }
    if (lakh > 0) {
        words += convertTwoDigit(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        words += convertTwoDigit(thousand) + ' Thousand ';
    }
    if (hundred > 0) {
        words += ones[hundred] + ' Hundred ';
    }
    if (remainder > 0) {
        words += convertTwoDigit(remainder);
    }

    return words.trim();
}

function convertTwoDigit(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num < 10) return ones[num];
    if (num >= 10 && num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 > 0 ? ' ' + ones[num % 10] : '');
}
