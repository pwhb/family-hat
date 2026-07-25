import writeXlsxFile from 'write-excel-file/node';
import { stringify } from 'csv/sync';

export async function generateReportFile(
	data: Record<string, any>[],
	format: 'csv' | 'excel' | 'json'
) {
	if (format === 'csv') {
		const csvString = stringify(data, { header: true });
		return {
			buffer: Buffer.from(csvString, 'utf-8'),
			contentType: 'text/csv',
			extension: 'csv'
		};
	}

	if (format === 'excel') {
		const keys = data.length > 0 ? Object.keys(data[0]) : [];

		const columns = keys.map((key) => ({
			header: key,
			cell: (row: Record<string, any>) => ({
				value: row[key] != null ? String(row[key]) : ''
			})
		}));

		const buffer = await writeXlsxFile(data, { columns }).toBuffer();
		return {
			buffer,
			contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			extension: 'xlsx'
		};
	}

	if (format === 'json') {
		const jsonString = JSON.stringify(data, null, 2);
		return {
			buffer: Buffer.from(jsonString, 'utf-8'),
			contentType: 'application/json',
			extension: 'json'
		};
	}

	throw new Error(`Unsupported export format: ${format}`);
}
