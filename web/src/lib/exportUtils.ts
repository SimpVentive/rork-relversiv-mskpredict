import * as XLSX from 'xlsx';

export function exportToXLS(
  data: any[],
  xMetricName: string,
  yMetricName: string,
  colorMetricName: string | null,
  condition: string,
  chartType: string
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Raw data
  const dataSheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

  // Sheet 2: Metadata
  const metadata = [{
    'Chart Type': chartType,
    'X-Axis': xMetricName,
    'Y-Axis': yMetricName,
    'Color-by': colorMetricName || 'None',
    'Condition': condition,
    'Cohort Size': data.length,
    'Generated': new Date().toISOString()
  }];
  const metadataSheet = XLSX.utils.json_to_sheet(metadata);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

  // Sheet 3: Summary stats
  if (data.length > 0) {
    const stats = [{
      'Total Records': data.length,
      'Export Date': new Date().toLocaleDateString(),
      'Analysis': `${xMetricName} vs ${yMetricName}`
    }];
    const statsSheet = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Summary');
  }

  const fileName = `Analysis_${condition}_${xMetricName.replace(/ /g, '')}_vs_${yMetricName.replace(/ /g, '')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export async function exportChartAsPNG(
  chartElement: HTMLDivElement,
  xMetricName: string,
  yMetricName: string,
  colorMetricName: string | null,
  condition: string,
  cohortSize: number
) {
  const html2canvas = (await import('html2canvas')).default;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.style.background = 'white';
  wrapper.style.padding = '24px';
  wrapper.style.width = '1200px';

  // Title
  const title = document.createElement('h2');
  title.textContent = `${condition}: ${xMetricName} vs ${yMetricName}`;
  title.style.margin = '0 0 12px 0';
  title.style.fontSize = '18px';
  title.style.fontFamily = 'DM Sans';
  title.style.color = '#1A2332';
  wrapper.appendChild(title);

  // Metadata
  const metadata = document.createElement('p');
  metadata.textContent = `Cohort: N=${cohortSize} | Color-by: ${colorMetricName || 'None'} | Generated: ${new Date().toLocaleDateString()}`;
  metadata.style.margin = '0 0 20px 0';
  metadata.style.fontSize = '12px';
  metadata.style.color = '#647281';
  wrapper.appendChild(metadata);

  // Clone chart
  const chartClone = chartElement.cloneNode(true) as HTMLDivElement;
  wrapper.appendChild(chartClone);

  // Add to DOM (hidden)
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      backgroundColor: 'white'
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `Chart_${condition}_${xMetricName.replace(/ /g, '')}_vs_${yMetricName.replace(/ /g, '')}_${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  } finally {
    document.body.removeChild(wrapper);
  }
}
